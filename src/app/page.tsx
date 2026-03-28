"use client";

import { useStore } from "@/lib/StoreProvider";
import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MarkdownContent } from "@/components/MarkdownContent";
import { PostModal } from "@/components/PostModal";
import { LikeShare } from "@/components/LikeShare";
import { WorkspacePanel } from "@/components/WorkspacePanel";
import { useHighlights } from "@/lib/useHighlights";
import { BookmarksPanel } from "@/components/BookmarksPanel";
import { useBookmarks } from "@/lib/useBookmarks";
import { Post } from "@/lib/mockData";

function MasonryLayout({ items, openModal, topics }: { items: Post[], openModal: (p: Post) => void, topics: { id: string, name: string, parentId?: string | null }[] }) {
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth < 640) setCols(1);
      else if (window.innerWidth < 1024) setCols(2);
      else setCols(3);
    };
    updateCols(); // initial
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  // Distribute items into columns (0, 1, 2, 0, 1, 2)
  const columns = Array.from({ length: cols }, () => [] as Post[]);
  items.forEach((item, i) => columns[i % cols].push(item));

  return (
    <div className="flex gap-4 items-start w-full">
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-4 flex-1 min-w-0">
          {col.map((post) => {
            const topic = topics.find((t) => t.id === post.topicId);
            const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric", month: "short", day: "numeric",
            });
            return (
              <div
                key={post.id}
                onClick={() => openModal(post)}
                className="cursor-pointer bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-none transition-all duration-300 hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.1)] dark:hover:border-slate-500 rounded-2xl group"
              >
                <div className="font-serif text-sm leading-relaxed text-[#333333] dark:text-slate-200 mb-4 group-hover:opacity-80 transition-opacity">
                  <MarkdownContent content={post.excerpt} />
                </div>
                <div className="flex justify-between items-center font-sans border-t border-gray-100 dark:border-slate-700 pt-3">
                  <span className="text-[10px] tracking-wider uppercase text-gray-400 dark:text-slate-500">{topic?.name || ""}</span>
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <LikeShare post={post} variant="card" />
                    <span className="text-[10px] text-gray-300 dark:text-slate-600">{dateStr}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function HomeContent() {
  const { topics, posts, viewMode, sortOrder } = useStore();

  const { highlights, removeHighlight } = useHighlights();
  const { bookmarks, toggleBookmark } = useBookmarks();
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedTag = searchParams.get("tag");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalPost, setModalPost] = useState<Post | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);

  const rootTopics = topics.filter((t) => !t.parentId);
  const [selectedRootId, setSelectedRootId] = useState<string | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  const subtopics = selectedRootId
    ? topics.filter((t) => t.parentId === selectedRootId)
    : [];

  const handleRootSelect = (id: string | null) => {
    setSelectedRootId(id);
    setSelectedSubId(null);
    if (selectedTag) router.push("/");
  };

  const countPostsInTopic = (topicId: string, includeChildren = true) => {
    const childIds = includeChildren
      ? topics.filter((t) => t.parentId === topicId).map((t) => t.id)
      : [];
    return posts.filter((p) => p.topicId === topicId || childIds.includes(p.topicId)).length;
  };

  const filteredPosts = posts.filter((post) => {
    let matchesTopic = true;
    if (selectedSubId) {
      matchesTopic = post.topicId === selectedSubId;
    } else if (selectedRootId) {
      const subIds = topics.filter((t) => t.parentId === selectedRootId).map((t) => t.id);
      matchesTopic = post.topicId === selectedRootId || subIds.includes(post.topicId);
    }
    const matchesTag = selectedTag ? post.tags?.includes(selectedTag) : true;
    const query = searchQuery.toLowerCase();
    const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    }).toLowerCase();
    const matchesSearch = !searchQuery ||
      post.excerpt.toLowerCase().includes(query) ||
      post.fullContent?.toLowerCase().includes(query) ||
      post.tags?.some(t => t.toLowerCase().includes(query)) ||
      dateStr.includes(query);
    return matchesTopic && matchesTag && matchesSearch;
  });

  // Apply sort order
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortOrder === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortOrder === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return (b.likes ?? 0) - (a.likes ?? 0); // mostliked
  });

  const clearTag = () => router.push("/");
  const selectTag = (tag: string) => {
    router.push(`/?tag=${tag}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openModal = useCallback((post: Post) => {
    setModalPost(post);
  }, []);

  const closeModal = useCallback(() => {
    setModalPost(null);
  }, []);

  // ── Shared post card renderer ──────────────────────────────────────────────
  const renderPostCard = (post: Post, extraClass = "") => {
    const topic = topics.find((t) => t.id === post.topicId);
    const dateStr = new Date(post.createdAt).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
    return (
      <div
        key={post.id}
        onClick={() => openModal(post)}
        className={`group cursor-pointer bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-6 md:p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-none transition-all duration-300 hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.1)] dark:hover:border-slate-500 rounded-2xl flex gap-5 md:gap-8 relative ${extraClass}`}
      >
        {/* Tier badge */}
        {post.tier && post.tier !== 'free' && (
          <span className={`absolute top-4 right-4 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full pointer-events-none
            ${post.tier === 'vip' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
            {post.tier === 'vip' ? '👑 VIP' : '🔒 PREMIUM'}
          </span>
        )}
        {/* Left vertical text (Topic Name like the metal plaque Artist name) */}
        <div className="flex-shrink-0 flex items-start pt-1">
          <h3 
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }} 
            className="font-sans text-[11px] sm:text-[13px] font-bold tracking-[0.3em] uppercase text-gray-300 dark:text-slate-600 group-hover:text-[#333333] dark:group-hover:text-slate-300 transition-colors whitespace-nowrap"
          >
            {topic?.name || "NEROVERSE"}
          </h3>
        </div>

        {/* Right content column */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="mb-6">
            {post.title && (
              <h4 className="font-serif text-xl md:text-2xl font-bold text-[#222222] dark:text-slate-100 mb-3 leading-snug group-hover:opacity-80 transition-opacity">
                {post.title}
              </h4>
            )}
            <div className={`font-serif leading-[1.8] line-clamp-8 ${post.title ? "text-sm text-gray-500 dark:text-slate-400" : "text-[15px] md:text-base text-[#333333] dark:text-slate-200"}`}>
              <MarkdownContent content={post.excerpt} />
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-5">
                {post.tags.slice(0, 3).map(tag => (
                  <button
                    key={tag}
                    onClick={(e) => { e.stopPropagation(); selectTag(tag); }}
                    className="font-sans text-[8.5px] uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 hover:text-[#333333] dark:hover:text-slate-300 transition-colors"
                  >#{tag}</button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center font-sans">
            <span className="text-[10px] text-gray-400 dark:text-slate-500 tracking-wide uppercase">{dateStr}</span>
            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              <LikeShare post={post} variant="card" />
            </div>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="max-w-4xl mx-auto px-6 py-12">

      {/* Modal */}
      {modalPost && (
        <PostModal
          post={modalPost}
          topic={topics.find(t => t.id === modalPost.topicId)}
          onClose={closeModal}
          onTagClick={selectTag}
        />
      )}

      {/* Workspace Panel */}
      <WorkspacePanel
        open={workspaceOpen}
        onClose={() => setWorkspaceOpen(false)}
        highlights={highlights}
        onRemove={removeHighlight}
      />

      {/* Bookmarks Panel */}
      <BookmarksPanel
        open={bookmarksOpen}
        onClose={() => setBookmarksOpen(false)}
        bookmarks={bookmarks}
        onRemove={toggleBookmark}
        onPostClick={(post: Post) => {
          setBookmarksOpen(false);
          openModal(post);
        }}
      />

      {/* ── Tier Selector + Workspace Button (dev toolbar) ── */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
        {/* Workspace trigger (Highlights) */}
        <button
          onClick={() => setWorkspaceOpen(true)}
          title="Bộ sưu tập cá nhân (Highlights)"
          className="relative w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/30 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
        >
          <span className="text-xl group-hover:text-amber-500 transition-colors">✦</span>
          {highlights.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {highlights.length > 9 ? "9+" : highlights.length}
            </span>
          )}
        </button>

        {/* Bookmarks trigger */}
        <button
          onClick={() => setBookmarksOpen(true)}
          title="Bài viết đã lưu (Bookmarks)"
          className="relative w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/30 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
        >
          <span className="text-xl group-hover:text-blue-500 transition-colors opacity-70">🔖</span>
          {bookmarks.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {bookmarks.length > 9 ? "9+" : bookmarks.length}
            </span>
          )}
        </button>

      </div>

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
          <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#333333] dark:hover:text-slate-200 transition-colors">
            <span className="text-lg font-bold">&times;</span>
          </button>
        )}
      </div>

      {/* ── Tier 1: Root Topic Filter ── */}
      <div className="mb-0 border-b border-gray-200 dark:border-slate-700 pb-3">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide whitespace-nowrap">
          <button onClick={() => handleRootSelect(null)}
            className={`font-sans tracking-wide text-sm flex-shrink-0 transition-all duration-300 pb-1 flex items-center gap-1.5 ${selectedRootId === null ? "text-[#333333] dark:text-slate-100 border-b border-[#333333] dark:border-slate-300" : "text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300"}`}>
            ALL
            <span className={`text-[9px] font-sans font-medium px-1.5 py-0.5 rounded-full ${selectedRootId === null ? "bg-[#333333] dark:bg-slate-300 text-white dark:text-slate-900" : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500"}`}>{posts.length}</span>
          </button>
          {rootTopics.map((topic) => (
            <button key={topic.id} onClick={() => handleRootSelect(topic.id)}
              className={`font-sans tracking-wide text-sm uppercase flex-shrink-0 transition-all duration-300 pb-1 flex items-center gap-1.5 ${selectedRootId === topic.id ? "text-[#333333] dark:text-slate-100 border-b border-[#333333] dark:border-slate-300" : "text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300"}`}>
              {topic.name}
              <span className={`text-[9px] font-sans font-medium px-1.5 py-0.5 rounded-full ${selectedRootId === topic.id ? "bg-[#333333] dark:bg-slate-300 text-white dark:text-slate-900" : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500"}`}>{countPostsInTopic(topic.id)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tier 2: Subtopic Filter ── */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${subtopics.length > 0 ? "max-h-16 opacity-100 mb-10" : "max-h-0 opacity-0 mb-8"}`}>
        <div className="flex gap-5 overflow-x-auto scrollbar-hide whitespace-nowrap pt-3 pb-2 pl-2 border-l-2 border-gray-100 dark:border-slate-700 mt-2">
          <button onClick={() => setSelectedSubId(null)}
            className={`font-sans text-xs tracking-wide flex-shrink-0 transition-all duration-300 flex items-center gap-1.5 ${selectedSubId === null ? "text-[#555555] dark:text-slate-300 underline underline-offset-4" : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"}`}>
            All {topics.find((t) => t.id === selectedRootId)?.name}
          </button>
          {subtopics.map((sub) => (
            <button key={sub.id} onClick={() => setSelectedSubId(sub.id)}
              className={`font-sans text-xs tracking-wide uppercase flex-shrink-0 transition-all duration-300 flex items-center gap-1.5 ${selectedSubId === sub.id ? "text-[#555555] dark:text-slate-300 underline underline-offset-4" : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"}`}>
              {sub.name}
              <span className="text-[9px] bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 px-1.5 py-0.5 rounded-full">{countPostsInTopic(sub.id, false)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tag Indicator ── */}
      {selectedTag && (
        <div className="mb-8 flex items-center gap-3">
          <span className="font-sans text-xs uppercase tracking-widest text-gray-400 dark:text-slate-500"># Tag:</span>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            <span className="font-sans text-xs font-medium text-[#333333] dark:text-slate-300">#{selectedTag}</span>
            <button onClick={clearTag} className="text-gray-400 hover:text-red-500 transition-colors text-xs font-bold leading-none">&times;</button>
          </div>
        </div>
      )}

      {/* ── Posts Render Engine ── */}

      {/* CARDS — 2-col CSS grid, reading order */}
      {viewMode === "cards" && (
        <div className="masonry-grid">
          {sortedPosts.map((post) => renderPostCard(post, "masonry-item"))}
        </div>
      )}

      {/* LIST — single column */}
      {viewMode === "list" && (
        <div className="flex flex-col gap-12">
          {sortedPosts.map((post) => {
            const topic = topics.find((t) => t.id === post.topicId);
            return (
              <div
                key={post.id}
                onClick={() => openModal(post)}
                className="relative pl-8 border-l border-gray-100 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-600 transition-colors cursor-pointer group"
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 font-sans block mb-3">
                  {topic?.name || "Entry"}
                </span>
                <div className="mb-4 font-serif text-xl leading-relaxed text-[#333333] dark:text-slate-200 group-hover:opacity-80 transition-opacity">
                  <MarkdownContent content={post.excerpt} />
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-2 mb-4">
                    {post.tags.map(tag => (
                      <button key={tag} onClick={(e) => { e.stopPropagation(); selectTag(tag); }}
                        className="font-sans text-[10px] uppercase tracking-widest text-gray-400 dark:text-slate-600 hover:text-[#333333] dark:hover:text-slate-300">
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
                <div onClick={(e) => e.stopPropagation()}>
                  <LikeShare post={post} variant="card" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MASONRY — JS-based columns, tight packing + left→right order */}
      {viewMode === "masonry" && (
        <MasonryLayout items={sortedPosts} openModal={openModal} topics={topics} />
      )}

      {sortedPosts.length === 0 && (
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
