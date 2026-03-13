"use client";

import { useStore } from "@/lib/StoreProvider";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MarkdownContent } from "@/components/MarkdownContent";

function HomeContent() {
  const { topics, posts, viewMode } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const selectedTag = searchParams.get("tag");
  const [searchQuery, setSearchQuery] = useState("");

  // Tier 1: top-level topics (no parentId)
  const rootTopics = topics.filter((t) => !t.parentId);

  const [selectedRootId, setSelectedRootId] = useState<string | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  const subtopics = selectedRootId
    ? topics.filter((t) => t.parentId === selectedRootId)
    : [];

  const handleRootSelect = (id: string | null) => {
    setSelectedRootId(id);
    setSelectedSubId(null);
    // Clear tag when selecting a topic
    if (selectedTag) {
      router.push("/");
    }
  };

  const activeTopicId = selectedSubId ?? selectedRootId;

  const filteredPosts = posts.filter((post) => {
    const matchesTopic = activeTopicId ? post.topicId === activeTopicId : true;
    const matchesTag = selectedTag ? post.tags?.includes(selectedTag) : true;
    
    // Search logic
    const query = searchQuery.toLowerCase();
    const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).toLowerCase();

    const matchesSearch = !searchQuery || 
      post.excerpt.toLowerCase().includes(query) || 
      post.fullContent?.toLowerCase().includes(query) || 
      post.tags?.some(t => t.toLowerCase().includes(query)) ||
      dateStr.includes(query);

    return matchesTopic && matchesTag && matchesSearch;
  });

  const clearTag = () => {
    router.push("/");
  };

  const selectTag = (tag: string) => {
    router.push(`/?tag=${tag}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">

      {/* ── Search Bar ── */}
      <div className="mb-12 relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400 dark:text-slate-600 transition-colors group-focus-within:text-[#333333] dark:group-focus-within:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search entries, hashtags, ideas..."
          className="w-full bg-white dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 pl-10 pr-4 py-3 text-sm font-sans text-[#333333] dark:text-slate-100 focus:outline-none focus:border-gray-300 dark:focus:border-slate-600 transition-all shadow-sm rounded-xl placeholder:text-gray-300 dark:placeholder:text-slate-600"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#333333] dark:hover:text-slate-200 transition-colors"
          >
            <span className="text-lg font-bold">&times;</span>
          </button>
        )}
      </div>

      {/* ── Tier 1: Root Topic Filter ── */}
      <div className="mb-0 border-b border-gray-200 dark:border-slate-700 pb-3">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide whitespace-nowrap">
          <button
            onClick={() => handleRootSelect(null)}
            className={`font-sans tracking-wide text-sm flex-shrink-0 transition-all duration-300 pb-1 ${
              selectedRootId === null
                ? "text-[#333333] dark:text-slate-100 border-b border-[#333333] dark:border-slate-300"
                : "text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300"
            }`}
          >
            ALL
          </button>
          {rootTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleRootSelect(topic.id)}
              className={`font-sans tracking-wide text-sm uppercase flex-shrink-0 transition-all duration-300 pb-1 ${
                selectedRootId === topic.id
                  ? "text-[#333333] dark:text-slate-100 border-b border-[#333333] dark:border-slate-300"
                  : "text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300"
              }`}
            >
              {topic.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tier 2: Subtopic Filter ── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          subtopics.length > 0 ? "max-h-16 opacity-100 mb-10" : "max-h-0 opacity-0 mb-8"
        }`}
      >
        <div className="flex gap-5 overflow-x-auto scrollbar-hide whitespace-nowrap pt-3 pb-2 pl-2 border-l-2 border-gray-100 dark:border-slate-700 mt-2">
          <button
            onClick={() => setSelectedSubId(null)}
            className={`font-sans text-xs tracking-wide flex-shrink-0 transition-all duration-300 ${
              selectedSubId === null
                ? "text-[#555555] dark:text-slate-300 underline underline-offset-4"
                : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
            }`}
          >
            All {topics.find((t) => t.id === selectedRootId)?.name}
          </button>
          {subtopics.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubId(sub.id)}
              className={`font-sans text-xs tracking-wide uppercase flex-shrink-0 transition-all duration-300 ${
                selectedSubId === sub.id
                  ? "text-[#555555] dark:text-slate-300 underline underline-offset-4"
                  : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tag Indicator ── */}
      {selectedTag && (
        <div className="mb-8 flex items-center gap-3">
          <span className="font-sans text-xs uppercase tracking-widest text-gray-400 dark:text-slate-500">
            Filtering by tag:
          </span>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            <span className="font-sans text-xs font-medium text-[#333333] dark:text-slate-300">#{selectedTag}</span>
            <button 
              onClick={clearTag}
              className="text-gray-400 hover:text-red-500 transition-colors text-xs font-bold leading-none"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* ── Posts Render Engine ── */}
      {viewMode === "masonry" ? (
        <div className="masonry-grid">
          {filteredPosts.map((post) => {
            const topic = topics.find((t) => t.id === post.topicId);
            const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            return (
                <div
                key={post.id}
                className={`block masonry-item bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-none transition-all duration-300 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] dark:hover:border-slate-500 rounded-2xl`}
                >
                <div className="mb-6">
                  {post.title && (
                    <h3 className="font-serif text-2xl font-bold text-[#333333] dark:text-slate-100 mb-2 leading-tight">
                      {post.title}
                    </h3>
                  )}
                  <Link href={post.fullContent ? `/post/${post.id}` : "#"} className={`block leading-relaxed ${post.title ? "text-base text-gray-500 dark:text-slate-400" : "text-lg text-[#333333] dark:text-slate-200"} ${!post.fullContent ? "cursor-default" : ""}`}>
                      <MarkdownContent content={post.excerpt} />
                  </Link>
                </div>

                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mb-6">
                    {post.tags.map(tag => (
                        <button 
                        key={tag}
                        onClick={() => selectTag(tag)}
                        className="font-sans text-[10px] uppercase tracking-widest text-gray-400 dark:text-slate-500 hover:text-[#333333] dark:hover:text-slate-300 transition-colors"
                        >
                        #{tag}
                        </button>
                    ))}
                    </div>
                )}

                {post.fullContent && (
                    <Link href={`/post/${post.id}`} className="block mb-6 font-serif text-gray-400 dark:text-slate-500 text-sm italic hover:text-gray-600 dark:hover:text-slate-400 transition-colors">
                    Chi tiết &rarr;
                    </Link>
                )}

                <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center font-sans">
                    <span className="text-xs tracking-wider uppercase text-gray-400 dark:text-slate-500">
                    {topic?.name || "Unknown"}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-slate-500 tracking-wide">
                    {dateStr}
                    </span>
                </div>
                </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-16">
          {filteredPosts.map((post) => {
            const topic = topics.find((t) => t.id === post.topicId);
            return (
              <div key={post.id} className="relative pl-8 border-l border-gray-100 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-600 transition-colors">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 font-sans block mb-3">
                  {topic?.name || "Entry"}
                </span>
                <div className="mb-4">
                  {post.title && (
                    <h3 className="font-serif text-3xl font-bold text-[#333333] dark:text-slate-100 mb-2 leading-tight">
                      {post.title}
                    </h3>
                  )}
                  <Link href={post.fullContent ? `/post/${post.id}` : "#"} className={`block font-serif leading-relaxed hover:opacity-80 transition-opacity ${post.title ? "text-lg text-gray-400 dark:text-slate-500" : "text-2xl text-[#333333] dark:text-slate-200"} ${!post.fullContent ? "cursor-default" : ""}`}>
                    <MarkdownContent content={post.excerpt} />
                  </Link>
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-2">
                    {post.tags.map(tag => (
                      <button 
                        key={tag}
                        onClick={() => selectTag(tag)}
                        className="font-sans text-[10px] uppercase tracking-widest text-gray-400 dark:text-slate-600 hover:text-[#333333] dark:hover:text-slate-300"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {filteredPosts.length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-slate-500 font-sans tracking-wide">
          No entries found.
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-sans text-gray-400">Loading entries...</div>}>
      <HomeContent />
    </Suspense>
  );
}
