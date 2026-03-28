"use client";

import { useEffect } from "react";
import type { Highlight } from "@/lib/useHighlights";

type Props = {
  open: boolean;
  onClose: () => void;
  highlights: Highlight[];
  onRemove: (id: string) => void;
};

export function WorkspacePanel({ open, onClose, highlights, onRemove }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-in panel */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-full max-w-sm z-50
          bg-white dark:bg-slate-900
          border-l border-gray-100 dark:border-slate-700
          shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h2 className="font-sans font-bold text-sm tracking-widest uppercase text-[#333] dark:text-slate-100">
              Bộ Sưu Tập
            </h2>
            <p className="font-sans text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
              {highlights.length} đoạn đã lưu
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-100 dark:border-slate-700 text-gray-400 hover:text-[#333] dark:hover:text-slate-200 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Highlight list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {highlights.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <span className="text-4xl mb-4 opacity-30">✦</span>
              <p className="font-serif text-sm text-gray-400 dark:text-slate-500 leading-relaxed">
                Chưa có highlight nào.<br />Bôi đen đoạn văn yêu thích và lưu lại nhé.
              </p>
            </div>
          ) : (
            highlights.map((h) => (
              <HighlightCard key={h.id} highlight={h} onRemove={onRemove} />
            ))
          )}
        </div>
      </aside>
    </>
  );
}

function HighlightCard({ highlight, onRemove }: { highlight: Highlight; onRemove: (id: string) => void }) {
  const dateStr = new Date(highlight.savedAt).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  return (
    <div className="group relative bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl p-4">
      {/* Delete button */}
      <button
        onClick={() => onRemove(highlight.id)}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-400 text-xs"
        aria-label="Xóa"
      >
        ✕
      </button>

      {/* Highlight bar */}
      <div className="w-5 h-0.5 bg-amber-400 rounded mb-3" />

      {/* Text */}
      <p className="font-serif text-sm leading-relaxed text-[#333] dark:text-slate-200 mb-3 pr-4">
        &ldquo;{highlight.text}&rdquo;
      </p>

      {/* Meta */}
      <div className="flex items-center justify-between gap-2 font-sans">
        {highlight.postTitle ? (
          <span className="text-[10px] text-gray-400 dark:text-slate-500 truncate">
            {highlight.postTitle}
          </span>
        ) : (
          <span className="text-[10px] text-gray-300 dark:text-slate-600 italic">Bài không có tiêu đề</span>
        )}
        <span className="text-[10px] text-gray-300 dark:text-slate-600 whitespace-nowrap">{dateStr}</span>
      </div>
    </div>
  );
}
