"use client";

import { useStore } from "@/lib/StoreProvider";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Post, Topic } from "@/lib/mockData";
import { MarkdownContent } from "@/components/MarkdownContent";

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { posts, topics } = useStore();

  const [post, setPost] = useState<Post | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);

  useEffect(() => {
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
  }, [id, posts, topics, router]);

  if (!post) return null;

  const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <Link
        href="/"
        className="inline-block mb-12 font-sans text-sm tracking-wide text-gray-400 dark:text-slate-500 hover:text-[#333333] dark:hover:text-slate-300 transition-colors"
      >
        &larr; Back to Reading
      </Link>

      <header className="mb-12 border-b border-gray-100 dark:border-slate-700 pb-8">
        <div className="flex items-center gap-4 mb-6 font-sans">
          <span className="text-xs tracking-wider uppercase text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-gray-100 dark:border-slate-800">
            {topic?.name || "Unknown"}
          </span>
          <span className="text-xs text-gray-400 dark:text-slate-500 tracking-wide">
            {dateStr}
          </span>
        </div>

        {/* Title & Excerpt */}
        <div className="mb-8">
          {post.title && (
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#333333] dark:text-slate-100 mb-6 leading-tight">
              {post.title}
            </h1>
          )}
          <div className={`${post.title ? "text-xl md:text-2xl font-light text-gray-500 dark:text-slate-400" : "text-2xl md:text-3xl font-medium text-[#333333] dark:text-slate-100"} font-serif leading-relaxed`}>
            <MarkdownContent content={post.excerpt} />
          </div>
        </div>
      </header>

      {/* Full content */}
      {post.fullContent && (
        <div className="text-lg font-serif leading-loose text-[#444444] dark:text-slate-300 space-y-4 mb-12">
          <MarkdownContent content={post.fullContent} />
        </div>
      )}

      {/* Tags section */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-slate-800 flex flex-wrap gap-4">
          {post.tags.map(tag => (
            <Link 
              key={tag}
              href={`/?tag=${tag}`}
              className="font-sans text-[11px] uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 hover:text-[#333333] dark:hover:text-slate-200 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
