"use client";

import { useEffect } from "react";
import type { Bookmark } from "@/lib/useBookmarks";
import { useStore } from "@/lib/StoreProvider";
import Link from "next/link";
import { MarkdownContent } from "@/components/MarkdownContent";

type Props = {
  open: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onRemove: (postId: string) => void;
  onPostClick: (post: any) => void;
};

export function BookmarksPanel({ open, onClose, bookmarks, onRemove, onPostClick }: Props) {
  const { posts, topics } = useStore();

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
          bg-[#FAFAFA] dark:bg-slate-900
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
              Bài Viết Đã Lưu
            </h2>
            <p className="font-sans text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
              {bookmarks.length} bài viết
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

        {/* Bookmark list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <span className="text-4xl mb-4 opacity-30">🔖</span>
              <p className="font-serif text-sm text-gray-400 dark:text-slate-500 leading-relaxed">
                Chưa có bài viết nào.<br />Hãy nhấn Bookmark để lưu lại những bài viết hay.
              </p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {bookmarks.map((b) => {
                const post = posts.find(p => p.id === b.postId);
                const topic = post ? topics.find(t => t.id === post.topicId) : null;
                if (!post) return null; // Post might have been deleted
                
                return (
                  <div key={b.id}>
                    <BookmarkCard 
                      bookmark={b} 
                      post={post} 
                      topicName={topic?.name}
                      onRemove={onRemove} 
                      onClick={() => onPostClick(post)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function BookmarkCard({ bookmark, post, topicName, onRemove, onClick }: { bookmark: Bookmark; post: any; topicName?: string; onRemove: (id: string) => void; onClick: () => void }) {
  const dateStr = new Date(bookmark.savedAt).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer relative bg-white dark:bg-[#1a1c23] border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-6"
    >
      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(post.id); }}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 z-10"
        aria-label="Bỏ lưu"
      >
        ✕
      </button>

      {/* Ribbon Icon */}
      <div className="text-xl text-blue-400/50 dark:text-blue-500/30 leading-none mb-3">
        🔖
      </div>

      {/* Post Details */}
      {post.title && (
        <h3 className="font-serif text-base font-bold leading-snug text-[#222] dark:text-slate-100 mb-2 pr-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {post.title}
        </h3>
      )}
      
      <div className={`font-serif leading-relaxed mb-5 line-clamp-3 ${post.title ? "text-[13px] text-gray-500 dark:text-slate-400" : "text-[15px] text-[#333] dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"}`}>
         <MarkdownContent content={post.excerpt} />
      </div>

      {/* Meta container */}
      <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-slate-800/50">
        <span className="font-sans text-[10px] font-semibold tracking-widest uppercase text-blue-500 dark:text-blue-400 line-clamp-1">
          {topicName || "NEROVERSE"}
        </span>
        <span className="font-sans text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-widest block">
          ĐÃ LƯU: {dateStr}
        </span>
      </div>
    </div>
  );
}
