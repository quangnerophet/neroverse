"use client";

import { useState, useCallback } from "react";
import { useStore } from "@/lib/StoreProvider";
import { Post } from "@/lib/mockData";
import { useBookmarks } from "@/lib/useBookmarks";
import { useAuth } from "@/lib/AuthContext";

type Props = {
  post: Post;
  variant?: "card" | "modal"; // card = compact, modal = full
};

export function LikeShare({ post, variant = "card" }: Props) {
  const { likePost, setPricingModalOpen } = useStore();
  const { toggleBookmark, isBookmarked, isLoaded } = useBookmarks();
  const { tier, user, signIn } = useAuth();
  
  const storageKey = `nero_liked_${post.id}`;
  const [liked, setLiked] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(storageKey) === "1";
  });
  const [count, setCount] = useState(post.likes ?? 0);
  const [copied, setCopied] = useState(false);

  const bookmarked = isLoaded && isBookmarked(post.id);

  const onBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      signIn();
      return;
    }
    if (tier !== "premium" && tier !== "vip") {
      setPricingModalOpen(true);
      return;
    }
    await toggleBookmark(post.id);
  };

  const handleLike = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) return; // Can't unlike — each reader hearts once
    setLiked(true);
    setCount((c) => c + 1);
    localStorage.setItem(storageKey, "1");
    try {
      await likePost(post.id);
    } catch {
      // Silently revert if Firestore fails
      setLiked(false);
      setCount((c) => c - 1);
      localStorage.removeItem(storageKey);
    }
  }, [liked, likePost, post.id, storageKey]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    const title = post.title || post.excerpt.slice(0, 60);
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled — do nothing
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [post]);

  if (variant === "modal") {
    return (
      <div className="flex items-center gap-4">
        {/* Heart */}
        <button
          onClick={handleLike}
          title={liked ? "Already liked!" : "Like this post"}
          className={`flex items-center gap-1.5 font-sans text-xs tracking-wide transition-all duration-200 ${
            liked
              ? "text-rose-500 dark:text-rose-400"
              : "text-gray-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400"
          }`}
        >
          <span className="text-base">{liked ? "❤️" : "🤍"}</span>
          <span>{count}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          title="Share this post"
          className="flex items-center gap-1.5 font-sans text-xs tracking-wide text-gray-400 dark:text-slate-500 hover:text-[#333333] dark:hover:text-slate-200 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>{copied ? "Copied!" : "Share"}</span>
        </button>
        {/* Bookmark */}
        <button
          onClick={onBookmarkClick}
          title={bookmarked ? "Bỏ lưu bài viết" : "Lưu bài viết để đọc sau"}
          className={`flex items-center gap-1.5 font-sans text-[11px] uppercase font-semibold tracking-wider transition-colors duration-200 ${
            bookmarked
              ? "text-blue-500 dark:text-blue-400"
              : "text-gray-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400"
          }`}
        >
          <span className="text-sm">{bookmarked ? "🔖" : "📑"}</span>
          <span>{bookmarked ? "Đã lưu" : "Lưu"}</span>
        </button>
      </div>
    );
  }

  // Card variant — minimal, just heart + bookmark
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleLike}
        title={liked ? "Already liked!" : "Like this post"}
        className={`flex items-center gap-1 font-sans text-[10px] tracking-wide transition-all duration-200 ${
          liked
            ? "text-rose-500 dark:text-rose-400"
            : "text-gray-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400"
        }`}
      >
        <span>{liked ? "❤️" : "🤍"}</span>
        <span>{count}</span>
      </button>

      <button
        onClick={onBookmarkClick}
        title={bookmarked ? "Bỏ lưu bài viết" : "Lưu bài viết"}
        className={`flex items-center transition-all duration-200 opacity-60 hover:opacity-100 ${
          bookmarked ? "text-blue-500 dark:text-blue-400 opacity-100 filter drop-shadow-sm" : ""
        }`}
      >
        <span className="text-xs">{bookmarked ? "🔖" : "📑"}</span>
      </button>
    </div>
  );
}
