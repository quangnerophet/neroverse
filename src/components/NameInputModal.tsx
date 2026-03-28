"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";

export function NameInputModal() {
  const { user, needsName, updateDisplayName } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-fill with Google display name if available
  useEffect(() => {
    if (needsName && user) {
      setName(user.displayName || "");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [needsName, user]);

  if (!needsName || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await updateDisplayName(name.trim());
    setSaving(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header strip */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400" />

          <div className="px-8 py-8">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt="avatar"
                  className="w-14 h-14 rounded-full ring-2 ring-white dark:ring-slate-800 ring-offset-2 dark:ring-offset-slate-900 shadow"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-serif text-2xl text-white shadow">
                  {(user.email || "?")[0].toUpperCase()}
                </div>
              )}
            </div>

            <h2 className="font-serif text-xl text-center text-[#222] dark:text-slate-100 mb-1">
              Xin chào!
            </h2>
            <p className="font-sans text-[11px] text-center text-gray-400 dark:text-slate-500 tracking-wide mb-7">
              Bạn muốn được gọi là gì?
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tên hiển thị..."
                  maxLength={32}
                  required
                  className="
                    w-full bg-transparent border-b-2 border-gray-200 dark:border-slate-700
                    py-2 text-lg font-serif text-center
                    text-[#333] dark:text-slate-100
                    focus:outline-none focus:border-amber-400 dark:focus:border-amber-500
                    transition-colors placeholder:text-gray-300 dark:placeholder:text-slate-600
                  "
                />
                {/* Character count */}
                <span className="absolute right-0 bottom-3 font-sans text-[10px] text-gray-300 dark:text-slate-700">
                  {name.length}/32
                </span>
              </div>

              <button
                type="submit"
                disabled={!name.trim() || saving}
                className="
                  w-full font-sans text-xs uppercase tracking-widest
                  py-3 rounded-full
                  bg-[#333] dark:bg-slate-200
                  text-white dark:text-slate-900
                  hover:bg-black dark:hover:bg-white
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                {saving ? "Đang lưu…" : "Bắt đầu →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
