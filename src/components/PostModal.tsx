"use client";

import { useEffect, useRef, useState } from "react";
import { Post, Topic } from "@/lib/mockData";
import { MarkdownContent } from "@/components/MarkdownContent";
import { LikeShare } from "@/components/LikeShare";
import { HighlightTooltip } from "@/components/HighlightTooltip";
import { useAuth } from "@/lib/AuthContext";
import { canRead } from "@/lib/useUserTier";
import { useHighlights } from "@/lib/useHighlights";
import { useStore } from "@/lib/StoreProvider";
import Link from "next/link";
import { CommentsSection } from "@/components/CommentsSection";

type Props = {
  post: Post;
  topic: Topic | undefined;
  onClose: () => void;
  onTagClick?: (tag: string) => void;
  onPostClick?: (post: Post) => void;
};
export function PostModal({ post, topic, onClose, onTagClick, onPostClick }: Props) {
  const { user, tier, signIn } = useAuth();
  const { setPricingModalOpen, posts } = useStore();
  const { addHighlight } = useHighlights();
  const contentRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const isLocked = !canRead(post.tier, tier);
  const canHighlight = user && (tier === "premium" || tier === "vip");
  const canViewImages = user && (tier === "premium" || tier === "vip");

  const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  // Lock body scroll
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);


  const handleSaveHighlight = async (text: string) => {
    await addHighlight(text, post.id, post.title || post.excerpt.slice(0, 50));
    // Visual mark
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const mark = document.createElement("mark");
      mark.className = "nero-highlight";
      try { range.surroundContents(mark); } catch { /* skip complex */ }
      selection.removeAllRanges();
    }
    // Toast
    setToast("✦ Đã lưu vào Bộ Sưu Tập");
    setTimeout(() => setToast(null), 2500);
  };

  // Tier badge config
  const tierBadge =
    post.tier === "vip"
      ? { label: "VIP", icon: "👑", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" }
      : post.tier === "premium"
      ? { label: "Premium", icon: "🔒", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" }
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal card */}
      <article
        className="relative z-10 w-full max-w-2xl mx-4 my-10 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-7 pb-0">
          <div className="flex items-center gap-3 font-sans flex-wrap">
            <span className="text-[10px] tracking-widest uppercase text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-gray-100 dark:border-slate-700">
              {topic?.name || "Unknown"}
            </span>
            <span className="text-[11px] text-gray-300 dark:text-slate-600 tracking-wide">
              {dateStr}
            </span>
            {tierBadge && (
              <span className={`text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${tierBadge.className}`}>
                {tierBadge.icon} {tierBadge.label}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-[#333333] dark:hover:text-slate-200 transition-colors w-8 h-8 flex items-center justify-center rounded-full border border-gray-100 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-500 font-sans text-sm flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Main selectable content */}
        <div ref={contentRef} className="relative px-8 pt-6 pb-8 select-text">
          {/* Floating tooltip for Premium/VIP */}
          {canHighlight && (
            <HighlightTooltip
              containerRef={contentRef}
              userTier={tier}
              onSave={handleSaveHighlight}
            />
          )}

          {/* Highlight hint for premium/vip */}
          {canHighlight && !isLocked && post.fullContent && (
            <p className="font-sans text-[10px] text-gray-300 dark:text-slate-700 mb-4 flex items-center gap-1.5">
              <span>✦</span>
              <span>Bôi đen đoạn văn yêu thích để lưu vào Bộ Sưu Tập</span>
            </p>
          )}

          {/* Title */}
          {post.title && (
            <h2 className="font-serif font-bold text-2xl md:text-3xl text-[#222222] dark:text-slate-100 leading-snug mb-5">
              {post.title}
            </h2>
          )}

          <div className={`font-serif leading-[1.85] mb-6 ${
            post.title ? "text-base text-gray-500 dark:text-slate-400" : "text-lg text-[#333333] dark:text-slate-200"
          }`}>
            <MarkdownContent content={post.excerpt} hideImages={!canViewImages} />
          </div>

          {/* Full content — gated */}
          {post.fullContent && (
            <>
              <hr className="border-gray-100 dark:border-slate-700 mb-6" />

              {isLocked ? (
                /* ── LOCKED VIEW ── */
                <div className="relative">
                  <div className="font-serif text-base leading-[1.9] text-[#3a3a3a] dark:text-slate-300 space-y-5 line-clamp-3 blur-[3px] select-none pointer-events-none">
                    <MarkdownContent content={post.fullContent} hideImages={true} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white dark:via-slate-900/70 dark:to-slate-900" />
                  <div className="relative mt-4 flex flex-col items-center text-center py-6 gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-slate-700 flex items-center justify-center text-lg">
                      {post.tier === "vip" ? "👑" : "🔒"}
                    </div>
                    <div>
                      <p className="font-serif text-base text-[#333] dark:text-slate-200 font-medium mb-1">
                        {post.tier === "vip" ? "Nội dung dành riêng cho VIP" : "Nội dung Premium"}
                      </p>
                      <p className="font-sans text-xs text-gray-400 dark:text-slate-500">
                        Nâng cấp để đọc toàn bộ bài viết chuyên sâu này
                      </p>
                    </div>

                    {!user ? (
                      /* Not logged in — show login button */
                      <button
                        onClick={signIn}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-sans font-semibold tracking-wide uppercase rounded-full bg-[#333] hover:bg-black dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white text-white transition-all duration-200"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Đăng nhập để xem thêm
                      </button>
                    ) : (
                      /* Logged in but wrong tier */
                      <button
                        onClick={() => {
                          onClose();
                          setPricingModalOpen(true);
                        }}
                        className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs font-sans font-semibold tracking-wide uppercase rounded-full transition-all duration-200
                          ${post.tier === "vip" ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"}`}
                      >
                        {post.tier === "vip" ? "👑 Nâng cấp VIP" : "🔓 Nâng cấp Premium"}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* ── UNLOCKED VIEW ── */
                <div className="font-serif text-base leading-[1.9] text-[#3a3a3a] dark:text-slate-300 space-y-5 mb-6">
                  <MarkdownContent content={post.fullContent} hideImages={!canViewImages} />
                </div>
              )}
            </>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-slate-800">
              {post.tags.map((tag: string) => (
                <button
                  key={tag}
                  onClick={() => { onTagClick?.(tag); onClose(); }}
                  className="font-sans text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 hover:text-[#333333] dark:hover:text-slate-200 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Bottom bar: Like + Permalink */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <LikeShare post={post} variant="modal" />
            <Link
              href={`/post/${post.id}`}
              className="font-sans text-[10px] uppercase tracking-widest text-gray-300 dark:text-slate-600 hover:text-gray-500 dark:hover:text-slate-400 transition-colors"
              onClick={onClose}
            >
              Permalink →
            </Link>
          </div>

          <CommentsSection />

          <RelatedPosts 
            currentPost={post} 
            allPosts={posts} 
            onPostClick={onPostClick} 
          />
        </div>

        {/* === TOAST NOTIFICATION === */}
        {toast && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="font-sans text-[11px] font-medium text-white bg-[#1a1a1a] dark:bg-slate-200 dark:text-slate-900 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fade-in-up">
              {toast}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

function RelatedPosts({ currentPost, allPosts, onPostClick }: { currentPost: Post, allPosts: Post[], onPostClick?: (p: Post) => void }) {
  // Find up to 3 posts in the same topic, excluding the current one
  const related = allPosts
    .filter(p => p.topicId === currentPost.topicId && p.id !== currentPost.id)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="mt-12 pt-10 border-t border-gray-100 dark:border-slate-800">
      <h3 className="font-serif text-2xl font-bold text-[#222] dark:text-slate-100 mb-6">
        Gợi ý bài đọc
      </h3>
      <div className="flex flex-col gap-6">
        {related.map(p => {
          const dateStr = new Date(p.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric",
          });
          return (
            <div 
              key={p.id} 
              onClick={() => onPostClick?.(p)}
              className="group cursor-pointer border-b border-gray-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0"
            >
              {p.title && (
                <h4 className="font-serif text-lg font-bold text-[#222] dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                  {p.title}
                </h4>
              )}
              <div className={`font-serif leading-relaxed line-clamp-2 ${p.title ? "text-sm text-gray-500 dark:text-slate-400" : "text-base text-[#333] dark:text-slate-200"} mb-3`}>
                <MarkdownContent content={p.excerpt} />
              </div>
              <div className="flex items-center gap-3 font-sans text-[11px] text-gray-400 tracking-wide uppercase">
                <span>{dateStr}</span>
                {p.tier && p.tier !== 'free' && (
                  <>
                    <span>•</span>
                    <span className={p.tier === 'vip' ? "text-purple-500" : "text-amber-500"}>
                      {p.tier === 'vip' ? '👑 VIP' : '🔒 PREMIUM'}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
