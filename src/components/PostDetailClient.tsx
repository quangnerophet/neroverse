"use client";

import { useStore } from "@/lib/StoreProvider";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Post, Topic } from "@/lib/mockData";
import { MarkdownContent } from "@/components/MarkdownContent";

export default function PostDetailClient() {
  const { id } = useParams();
  const router = useRouter();
  const { posts, topics } = useStore();

  const [isLoaded, setIsLoaded] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);

  useEffect(() => {
    if (posts.length > 0) setIsLoaded(true);
  }, [posts]);

  useEffect(() => {
    if (!isLoaded) return;
    if (id) {
      const foundPost = posts.find((p) => p.id === id);
      if (foundPost) {
        setPost(foundPost);
        const foundTopic = topics.find((t) => t.id === foundPost.topicId);
        if (foundTopic) setTopic(foundTopic);
      } else {
        router.push("/");
      }
    }
  }, [id, posts, topics, router, isLoaded]);

  if (!post) return (
    <div className="min-h-[60vh] flex items-center justify-center text-gray-300 dark:text-slate-600 font-sans text-sm tracking-wide">
      Loading...
    </div>
  );

  const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="max-w-2xl mx-auto px-5 py-10 md:py-16">

      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-10 font-sans text-xs uppercase tracking-widest text-gray-400 dark:text-slate-500 hover:text-[#333333] dark:hover:text-slate-300 transition-colors"
      >
        <span>←</span> Back
      </Link>

      {/* Meta row */}
      <div className="flex items-center gap-3 mb-6 font-sans">
        <span className="text-[10px] tracking-widest uppercase text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-gray-100 dark:border-slate-700">
          {topic?.name || "Unknown"}
        </span>
        <span className="text-[11px] text-gray-300 dark:text-slate-600 tracking-wide">
          {dateStr}
        </span>
      </div>

      {/* Title */}
      {post.title && (
        <h1 className="font-serif font-bold text-2xl md:text-3xl text-[#222222] dark:text-slate-100 leading-snug mb-5">
          {post.title}
        </h1>
      )}

      {/* Excerpt — reads as the intro paragraph */}
      <div className={`font-serif leading-[1.85] mb-8 ${
        post.title
          ? "text-base text-gray-500 dark:text-slate-400"
          : "text-lg text-[#333333] dark:text-slate-200"
      }`}>
        <MarkdownContent content={post.excerpt} />
      </div>

      {/* Divider if full content follows */}
      {post.fullContent && (
        <hr className="border-gray-100 dark:border-slate-700 mb-8" />
      )}

      {/* Full content */}
      {post.fullContent && (
        <div className="font-serif text-base leading-[1.9] text-[#3a3a3a] dark:text-slate-300 space-y-5 mb-12">
          <MarkdownContent content={post.fullContent} />
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 pt-6 border-t border-gray-100 dark:border-slate-800 flex flex-wrap gap-3">
          {post.tags.map((tag: string) => (
            <Link
              key={tag}
              href={`/?tag=${tag}`}
              className="font-sans text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 hover:text-[#333333] dark:hover:text-slate-200 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
