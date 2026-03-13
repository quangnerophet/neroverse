"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/StoreProvider";
import { useRouter } from "next/navigation";
import { MarkdownContent } from "@/components/MarkdownContent";

const ADMIN_PASSWORD = "admin123";

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState(false);

  const { topics, posts, addTopic, addPost, updatePost } = useStore();

  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicParentId, setNewTopicParentId] = useState("");

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [newPostExcerpt, setNewPostExcerpt] = useState("");
  const [newPostFullContent, setNewPostFullContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postDate, setPostDate] = useState(new Date().toISOString().split('T')[0]);
  const [tagsInput, setTagsInput] = useState<string[]>(["", "", "", "", ""]);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand content textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = contentRef.current.scrollHeight + "px";
    }
  }, [newPostFullContent]);

  // ─── Login Handler ────────────────────────────────────────────────────────
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setPasswordInput("");
    }
  };

  // ─── Form Handlers ────────────────────────────────────────────────────────
  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopicName.trim()) {
      addTopic(newTopicName.trim(), newTopicParentId || undefined);
      setNewTopicName("");
      setNewTopicParentId("");
    }
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostExcerpt.trim() && selectedTopicId) {
      const filteredTags = tagsInput.map(t => t.trim()).filter(t => t !== "");
      const submittedDate = new Date(postDate).toISOString();
      
      if (editingPostId) {
        updatePost(editingPostId, selectedTopicId, newPostExcerpt.trim(), newPostFullContent.trim() || undefined, filteredTags, submittedDate, postTitle.trim() || undefined);
        setEditingPostId(null);
      } else {
        addPost(selectedTopicId, newPostExcerpt.trim(), newPostFullContent.trim() || undefined, filteredTags, submittedDate, postTitle.trim() || undefined);
      }

      setPostTitle("");
      setNewPostExcerpt("");
      setNewPostFullContent("");
      setSelectedTopicId("");
      setPostDate(new Date().toISOString().split('T')[0]);
      setTagsInput(["", "", "", "", ""]);
    }
  };

  const startEditing = (post: any) => {
    setEditingPostId(post.id);
    setSelectedTopicId(post.topicId);
    setPostTitle(post.title || "");
    setNewPostExcerpt(post.excerpt);
    setNewPostFullContent(post.fullContent || "");
    setPostDate(new Date(post.createdAt).toISOString().split('T')[0]);
    
    const existingTags = post.tags || [];
    const newTagsInput = ["", "", "", "", ""];
    existingTags.slice(0, 5).forEach((tag: string, i: number) => {
      newTagsInput[i] = tag;
    });
    setTagsInput(newTagsInput);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setPostTitle("");
    setNewPostExcerpt("");
    setNewPostFullContent("");
    setSelectedTopicId("");
    setPostDate(new Date().toISOString().split('T')[0]);
    setTagsInput(["", "", "", "", ""]);
  };

  const updateTagInput = (index: number, value: string) => {
    const next = [...tagsInput];
    next[index] = value;
    setTagsInput(next);
  };

  // ─── Login Screen ─────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-xs">
          <p className="font-serif text-2xl text-[#333333] dark:text-slate-100 text-center mb-2 tracking-tight">
            Enter
          </p>
          <p className="font-sans text-xs text-center text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-12">
            Private Area
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setLoginError(false);
              }}
              placeholder="Password"
              autoFocus
              autoComplete="current-password"
              className={`w-full bg-transparent border-b py-3 text-center text-lg text-[#333333] dark:text-slate-100 focus:outline-none transition-colors font-serif placeholder:text-gray-300 dark:placeholder:text-slate-600 tracking-widest ${
                loginError
                  ? "border-red-300 placeholder:text-red-300"
                  : "border-gray-300 dark:border-slate-600 focus:border-[#333333] dark:focus:border-slate-300"
              } rounded-lg`}
            />
            {loginError && (
              <p className="font-sans text-xs text-center text-red-400 tracking-wide -mt-3">
                Incorrect password.
              </p>
            )}
            <button
              type="submit"
              className="font-sans text-xs uppercase tracking-widest py-3 border border-gray-300 dark:border-slate-600 hover:border-[#333333] dark:hover:border-slate-300 hover:bg-[#333333] dark:hover:bg-slate-700 hover:text-white dark:hover:text-slate-100 transition-all text-[#333333] dark:text-slate-300 rounded-full"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12 border-b border-gray-200 dark:border-slate-700 pb-4">
        <h1 className="text-3xl tracking-tight text-[#333333] dark:text-slate-100 font-serif">
          Publishing Dashboard
        </h1>
        <button
          onClick={() => setIsLoggedIn(false)}
          className="font-sans text-xs uppercase tracking-widest text-gray-400 dark:text-slate-500 hover:text-[#333333] dark:hover:text-slate-300 transition-colors border border-gray-100 dark:border-slate-800 px-4 py-1.5 rounded-full"
        >
          Sign out
        </button>
      </div>

      {/* Entry Form (Add/Edit) */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm uppercase tracking-widest text-gray-400 dark:text-slate-500 font-sans">
            {editingPostId ? "Edit Entry" : "New Entry"}
          </h2>
          {editingPostId && (
            <button 
              onClick={cancelEdit}
              className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors font-sans"
            >
              Cancel Edit
            </button>
          )}
        </div>
        
        <p className="font-sans text-xs text-gray-400 dark:text-slate-500 mb-6">
          Use{" "}
          <code className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md text-gray-500 dark:text-slate-300">
            **bold**
          </code>
          ,{" "}
          <code className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md text-gray-500 dark:text-slate-300">
            *italic*
          </code>
          , or{" "}
          <code className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md text-gray-500 dark:text-slate-300">
            ==highlight==
          </code>{" "}
          for formatting.
        </p>
        
        <form onSubmit={handlePostSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              required
              className="w-full bg-transparent border border-gray-200 dark:border-slate-800 px-4 py-3 text-[#333333] dark:text-slate-300 focus:outline-none focus:border-[#333333] dark:focus:border-slate-500 transition-colors font-sans text-sm tracking-wide appearance-none rounded-xl"
            >
              <option value="" disabled className="dark:bg-slate-800">
                Select a category
              </option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id} className="dark:bg-slate-800">
                  {topic.parentId ? `  ↳ ${topic.name}` : topic.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-slate-500 font-sans">
              Publication Date
            </label>
            <input
              type="date"
              value={postDate}
              onChange={(e) => setPostDate(e.target.value)}
              required
              className="w-full bg-transparent border-b border-gray-200 dark:border-slate-800 py-2 text-[#333333] dark:text-slate-100 focus:outline-none focus:border-[#333333] dark:focus:border-slate-300 transition-colors font-sans text-sm px-2 rounded-md"
            />
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Post Title (Optional tiêu đề in đậm)..."
              className="w-full bg-transparent border-b border-gray-200 dark:border-slate-800 py-3 text-3xl font-bold text-[#333333] dark:text-slate-100 focus:outline-none focus:border-[#333333] dark:focus:border-slate-500 transition-colors font-serif placeholder:text-gray-200 dark:placeholder:text-slate-700 rounded-lg px-2"
            />
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={newPostExcerpt}
              onChange={(e) => setNewPostExcerpt(e.target.value)}
              placeholder="Short Excerpt (Câu dẫn ngắn hiển thị ở trang chủ)..."
              required
              className="w-full bg-transparent border-b border-gray-200 dark:border-slate-800 py-3 text-xl text-[#333333] dark:text-slate-100 focus:outline-none focus:border-[#333333] dark:focus:border-slate-500 transition-colors font-serif placeholder:text-gray-200 dark:placeholder:text-slate-700 rounded-lg px-2"
            />
          </div>

          <div className="flex flex-col gap-2">
            <textarea
              ref={contentRef}
              value={newPostFullContent}
              onChange={(e) => setNewPostFullContent(e.target.value)}
              placeholder="Full Content (Nội dung chi tiết - Optional)..."
              className="w-full bg-transparent border-b border-gray-200 dark:border-slate-700 py-6 text-lg text-[#333333] dark:text-slate-200 focus:outline-none focus:border-[#333333] dark:focus:border-slate-500 transition-colors font-serif placeholder:text-gray-300 dark:placeholder:text-slate-600 overflow-hidden resize-none"
            />
          </div>

          {/* Live Preview */}
          {newPostFullContent && (
            <div className="mt-8 mb-12 p-8 bg-white dark:bg-slate-800/30 border border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
              <h4 className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-slate-500 font-sans mb-8">
                Live Preview
              </h4>
              <MarkdownContent content={newPostFullContent} />
            </div>
          )}

          {/* Hashtags Section - 5 input fields */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 font-sans">
              Hashtags (Max 5)
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {tagsInput.map((tag, i) => (
                <div key={i} className="flex items-center gap-1 border-b border-gray-100 dark:border-slate-800 focus-within:border-gray-300 transition-colors pb-1">
                  <span className="text-gray-300 dark:text-slate-700 font-sans text-xs">#</span>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => updateTagInput(i, e.target.value.replace(/\s+/g, ''))} // No spaces in tags
                    placeholder="..."
                    className="w-full bg-transparent text-xs font-sans text-[#333333] dark:text-slate-300 focus:outline-none placeholder:text-gray-100 dark:placeholder:text-slate-800"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="self-end font-sans text-xs uppercase tracking-widest px-8 py-3 bg-[#333333] dark:bg-slate-700 text-white hover:bg-black dark:hover:bg-slate-600 transition-colors rounded-full shadow-sm"
          >
            {editingPostId ? "Update Block" : "Publish Block"}
          </button>
        </form>
      </section>

      {/* Category Management */}
      <section className="mb-20 pt-12 border-t border-gray-100 dark:border-slate-800">
        <h2 className="text-sm uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-6 font-sans">
          Manage Categories
        </h2>
        <form onSubmit={handleAddTopic} className="flex flex-col gap-4">
          <input
            type="text"
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            placeholder="Philosophy, Design, Art..."
            required
            className="w-full bg-transparent border-b border-gray-200 dark:border-slate-800 text-lg py-2 text-[#333333] dark:text-slate-100 focus:outline-none focus:border-[#333333] dark:focus:border-slate-500 transition-colors font-serif placeholder:text-gray-200 dark:placeholder:text-slate-700 rounded-lg px-2"
          />
          <select
            value={newTopicParentId}
            onChange={(e) => setNewTopicParentId(e.target.value)}
            className="w-full bg-transparent border-b border-gray-300 dark:border-slate-600 py-2 text-[#333333] dark:text-slate-400 focus:outline-none focus:border-[#333333] dark:focus:border-slate-300 transition-colors font-sans text-sm tracking-wide appearance-none"
          >
            <option value="" className="dark:bg-slate-800">None — Main Topic (Chủ đề chính)</option>
            {topics
              .filter((t) => !t.parentId)
              .map((t) => (
                <option key={t.id} value={t.id} className="dark:bg-slate-800">
                  {t.name}
                </option>
              ))}
          </select>
          <button
            type="submit"
            className="self-end font-sans text-xs uppercase tracking-widest px-6 py-3 border border-gray-200 dark:border-slate-800 hover:border-[#333333] dark:hover:border-slate-400 hover:bg-[#333333] dark:hover:bg-slate-700 hover:text-white dark:text-slate-300 dark:hover:text-white transition-all text-[#333333] rounded-full"
          >
            Save Category
          </button>
        </form>
      </section>

      {/* Manage Entries */}
      <section className="pt-12 border-t border-gray-100 dark:border-slate-800">
        <h2 className="text-sm uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-8 font-sans">
          Manage Entries
        </h2>
        <div className="flex flex-col gap-8">
          {posts.map((post) => {
            const topic = topics.find(t => t.id === post.topicId);
            return (
              <div key={post.id} className="group flex justify-between items-start gap-4 border-l-2 border-gray-50 dark:border-slate-800 pl-4 py-2 hover:border-gray-200 dark:hover:border-slate-600 transition-colors">
                <div className="flex-1">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-slate-500 font-sans block mb-1">
                    {topic?.name}
                  </span>
                  <p className="font-serif text-[#333333] dark:text-slate-300 leading-snug line-clamp-2 italic">
                    {post.excerpt.replace(/\*\*|\*|==/g, '')}
                  </p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.tags.map(tag => (
                        <span key={tag} className="text-[9px] text-gray-400 dark:text-slate-600 font-sans">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => startEditing(post)}
                  className="font-sans text-[10px] uppercase tracking-widest py-2 px-4 border border-gray-200 dark:border-slate-800 text-gray-400 hover:text-[#333333] dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600 transition-all opacity-0 group-hover:opacity-100 rounded-full"
                >
                  Edit
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
