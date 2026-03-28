"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/StoreProvider";
import { MarkdownContent } from "@/components/MarkdownContent";
import { SiteSettings, SocialLink } from "@/lib/StoreProvider";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, getDoc, setDoc } from "firebase/firestore";

const ADMIN_PASSWORD = "admin123";

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState(false);

  const { topics, posts, addTopic, updateTopic, deleteTopic, addPost, updatePost, siteSettings, updateSiteSettings } = useStore();

  // ─── Post State ──────────────────────────────────────────────────────────
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicParentId, setNewTopicParentId] = useState("");
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editTopicName, setEditTopicName] = useState("");
  const [editTopicParentId, setEditTopicParentId] = useState("");

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [newPostExcerpt, setNewPostExcerpt] = useState("");
  const [newPostFullContent, setNewPostFullContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postDate, setPostDate] = useState(new Date().toISOString().split('T')[0]);
  const [postTier, setPostTier] = useState<'free' | 'premium' | 'vip'>('free');
  const [tagsInput, setTagsInput] = useState<string[]>([]);
  const [tagsRaw, setTagsRaw] = useState("");

  // ─── Site Settings State ─────────────────────────────────────────────────
  const [footerLinks, setFooterLinks] = useState<SocialLink[]>([]);
  const [footerNote, setFooterNote] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [seedStatus, setSeedStatus] = useState<"idle" | "running" | "done">("idle");

  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand content textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = contentRef.current.scrollHeight + "px";
    }
  }, [newPostFullContent]);

  // Sync site settings from store
  useEffect(() => {
    if (siteSettings) {
      setFooterLinks(siteSettings.footerLinks?.length > 0 ? siteSettings.footerLinks : [{ label: "", url: "" }]);
      setFooterNote(siteSettings.footerNote || "");
    }
  }, [siteSettings]);

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

  // ─── Category Handlers ────────────────────────────────────────────────────
  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopicName.trim()) {
      await addTopic(newTopicName.trim(), newTopicParentId || undefined);
      setNewTopicName("");
      setNewTopicParentId("");
    }
  };

  const startEditTopic = (id: string, name: string, parentId?: string) => {
    setEditingTopicId(id);
    setEditTopicName(name);
    setEditTopicParentId(parentId || "");
  };

  const handleUpdateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTopicId && editTopicName.trim()) {
      await updateTopic(editingTopicId, editTopicName.trim(), editTopicParentId || undefined);
      setEditingTopicId(null);
    }
  };

  const handleDeleteTopic = async (id: string, name: string) => {
    const hasChildren = topics.some(t => t.parentId === id);
    if (hasChildren) {
      alert(`Cannot delete "${name}" because it has sub-categories. Delete the sub-categories first.`);
      return;
    }
    if (confirm(`Delete category "${name}"? This cannot be undone.`)) {
      await deleteTopic(id);
    }
  };

  // ─── Post Handlers ─────────────────────────────────────────────────────
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostExcerpt.trim() && selectedTopicId) {
      const filteredTags = tagsInput.map(t => t.trim()).filter(t => t !== "");
      const submittedDate = new Date(postDate).toISOString();
      
      if (editingPostId) {
        await updatePost(editingPostId, selectedTopicId, newPostExcerpt.trim(), newPostFullContent.trim() || undefined, filteredTags, submittedDate, postTitle.trim() || undefined, postTier);
        setEditingPostId(null);
      } else {
        await addPost(selectedTopicId, newPostExcerpt.trim(), newPostFullContent.trim() || undefined, filteredTags, submittedDate, postTitle.trim() || undefined, postTier);
      }

      setPostTitle("");
      setNewPostExcerpt("");
      setNewPostFullContent("");
      setSelectedTopicId("");
      setPostDate(new Date().toISOString().split('T')[0]);
      setPostTier('free');
      setTagsInput([]);
      setTagsRaw("");
    }
  };

  const startEditing = (post: any) => {
    setEditingPostId(post.id);
    setSelectedTopicId(post.topicId);
    setPostTitle(post.title || "");
    setNewPostExcerpt(post.excerpt);
    setNewPostFullContent(post.fullContent || "");
    setPostDate(new Date(post.createdAt).toISOString().split('T')[0]);
    setPostTier(post.tier || 'free');
    const existingTags = post.tags || [];
    setTagsInput(existingTags);
    setTagsRaw(existingTags.map((t: string) => `#${t}`).join(" "));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setPostTitle("");
    setNewPostExcerpt("");
    setNewPostFullContent("");
    setSelectedTopicId("");
    setPostDate(new Date().toISOString().split('T')[0]);
    setPostTier('free');
    setTagsInput([]);
    setTagsRaw("");
  };

  const updateTagInput = (index: number, value: string) => {
    const next = [...tagsInput];
    next[index] = value;
    setTagsInput(next);
  };

  const parseTagsRaw = (value: string) => {
    setTagsRaw(value);
    // Extract all #word tokens, strip the #, deduplicate, limit to 10
    const parsed = [...new Set(
      value.match(/#(\w+)/g)?.map(t => t.slice(1)) ?? []
    )].slice(0, 10);
    setTagsInput(parsed);
  };

  // ─── Site Settings Handlers ───────────────────────────────────────────────
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedLinks = footerLinks.filter(l => l.label.trim() && l.url.trim());
    await updateSiteSettings({ footerLinks: cleanedLinks, footerNote });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const addLinkRow = () => {
    if (footerLinks.length < 8) setFooterLinks([...footerLinks, { label: "", url: "" }]);
  };

  const removeLinkRow = (i: number) => {
    setFooterLinks(footerLinks.filter((_, idx) => idx !== i));
  };

  const updateLink = (i: number, field: "label" | "url", value: string) => {
    const next = [...footerLinks];
    next[i] = { ...next[i], [field]: value };
    setFooterLinks(next);
  };

  // ─── Shared Styles ───────────────────────────────────────────────────────
  const inputBase = "w-full bg-transparent border-b border-gray-200 dark:border-slate-800 py-2 text-[#333333] dark:text-slate-100 focus:outline-none focus:border-[#333333] dark:focus:border-slate-500 transition-colors font-sans text-sm px-2";
  const sectionHeader = "text-sm uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-6 font-sans";
  const divider = "pt-12 border-t border-gray-100 dark:border-slate-800";

  // ─── Login Screen ─────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-xs">
          <p className="font-serif text-2xl text-[#333333] dark:text-slate-100 text-center mb-2 tracking-tight">Enter</p>
          <p className="font-sans text-xs text-center text-gray-400 dark:text-slate-500 tracking-widest uppercase mb-12">Private Area</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setLoginError(false); }}
              placeholder="Password"
              autoFocus
              autoComplete="current-password"
              className={`w-full bg-transparent border-b py-3 text-center text-lg text-[#333333] dark:text-slate-100 focus:outline-none transition-colors font-serif placeholder:text-gray-300 dark:placeholder:text-slate-600 tracking-widest ${loginError ? "border-red-300 placeholder:text-red-300" : "border-gray-300 dark:border-slate-600 focus:border-[#333333] dark:focus:border-slate-300"} rounded-lg`}
            />
            {loginError && <p className="font-sans text-xs text-center text-red-400 tracking-wide -mt-3">Incorrect password.</p>}
            <button type="submit" className="font-sans text-xs uppercase tracking-widest py-3 border border-gray-300 dark:border-slate-600 hover:border-[#333333] dark:hover:border-slate-300 hover:bg-[#333333] dark:hover:bg-slate-700 hover:text-white dark:hover:text-slate-100 transition-all text-[#333333] dark:text-slate-300 rounded-full">
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────
  const rootTopics = topics.filter(t => !t.parentId);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12 border-b border-gray-200 dark:border-slate-700 pb-4">
        <h1 className="text-3xl tracking-tight text-[#333333] dark:text-slate-100 font-serif">Publishing Dashboard</h1>
        <button onClick={() => setIsLoggedIn(false)} className="font-sans text-xs uppercase tracking-widest text-gray-400 dark:text-slate-500 hover:text-[#333333] dark:hover:text-slate-300 transition-colors border border-gray-100 dark:border-slate-800 px-4 py-1.5 rounded-full">
          Sign out
        </button>
      </div>

      {/* ─── Entry Form ─────────────────────────────────────────────────── */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-2">
          <h2 className={sectionHeader}>{editingPostId ? "Edit Entry" : "New Entry"}</h2>
          {editingPostId && (
            <button onClick={cancelEdit} className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors font-sans">
              Cancel Edit
            </button>
          )}
        </div>
        <p className="font-sans text-xs text-gray-400 dark:text-slate-500 mb-6">
          Use{" "}<code className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md text-gray-500 dark:text-slate-300">**bold**</code>,{" "}
          <code className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md text-gray-500 dark:text-slate-300">*italic*</code>, or{" "}
          <code className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md text-gray-500 dark:text-slate-300">==highlight==</code>{" "}for formatting.
        </p>
        <form onSubmit={handlePostSubmit} className="flex flex-col gap-6">
          <select value={selectedTopicId} onChange={(e) => setSelectedTopicId(e.target.value)} required
            className="w-full bg-transparent border border-gray-200 dark:border-slate-800 px-4 py-3 text-[#333333] dark:text-slate-300 focus:outline-none focus:border-[#333333] dark:focus:border-slate-500 transition-colors font-sans text-sm tracking-wide appearance-none rounded-xl">
            <option value="" disabled className="dark:bg-slate-800">Select a category</option>
            {rootTopics.map((root) => (
              <>
                <option key={root.id} value={root.id} className="dark:bg-slate-800 font-semibold">
                  {root.name}
                </option>
                {topics.filter(t => t.parentId === root.id).map((sub) => (
                  <option key={sub.id} value={sub.id} className="dark:bg-slate-800">
                    {"  ↳ " + sub.name}
                  </option>
                ))}
              </>
            ))}
          </select>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-slate-500 font-sans">Publication Date</label>
            <input type="date" value={postDate} onChange={(e) => setPostDate(e.target.value)} required className={inputBase} />
          </div>

          <input type="text" value={postTitle} onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Post Title (Optional)..."
            className="w-full bg-transparent border-b border-gray-200 dark:border-slate-800 py-3 text-3xl font-bold text-[#333333] dark:text-slate-100 focus:outline-none focus:border-[#333333] dark:focus:border-slate-500 transition-colors font-serif placeholder:text-gray-200 dark:placeholder:text-slate-700 rounded-lg px-2" />

          <input type="text" value={newPostExcerpt} onChange={(e) => setNewPostExcerpt(e.target.value)}
            placeholder="Short Excerpt..." required
            className="w-full bg-transparent border-b border-gray-200 dark:border-slate-800 py-3 text-xl text-[#333333] dark:text-slate-100 focus:outline-none focus:border-[#333333] dark:focus:border-slate-500 transition-colors font-serif placeholder:text-gray-200 dark:placeholder:text-slate-700 rounded-lg px-2" />

          <textarea ref={contentRef} value={newPostFullContent} onChange={(e) => setNewPostFullContent(e.target.value)}
            placeholder="Full Content (Optional)..."
            className="w-full bg-transparent border-b border-gray-200 dark:border-slate-700 py-6 text-lg text-[#333333] dark:text-slate-200 focus:outline-none focus:border-[#333333] dark:focus:border-slate-500 transition-colors font-serif placeholder:text-gray-300 dark:placeholder:text-slate-600 overflow-hidden resize-none" />

          {newPostFullContent && (
            <div className="mt-8 mb-12 p-8 bg-white dark:bg-slate-800/30 border border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
              <h4 className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-slate-500 font-sans mb-8">Live Preview</h4>
              <MarkdownContent content={newPostFullContent} />
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 font-sans">Hashtags</h3>
            <input
              type="text"
              value={tagsRaw}
              onChange={(e) => parseTagsRaw(e.target.value)}
              placeholder="#MentalNotes #Resilience #Intropreneur ..."
              className="w-full bg-transparent border-b border-gray-200 dark:border-slate-800 py-2 text-sm text-[#333333] dark:text-slate-200 focus:outline-none focus:border-[#333333] dark:focus:border-slate-500 transition-colors font-sans placeholder:text-gray-300 dark:placeholder:text-slate-700"
            />
            {tagsInput.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {tagsInput.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-sans text-[11px] px-3 py-1 rounded-full">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => {
                        const next = tagsInput.filter((_, idx) => idx !== i);
                        setTagsInput(next);
                        setTagsRaw(next.map(t => `#${t}`).join(" "));
                      }}
                      className="text-gray-300 hover:text-red-400 transition-colors leading-none"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 font-sans">Tier Truy Cập</h3>
            <div className="flex gap-3">
              {(['free', 'premium', 'vip'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPostTier(t)}
                  className={`font-sans text-xs uppercase tracking-widest px-4 py-2 rounded-full border transition-all
                    ${postTier === t
                      ? t === 'vip'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : t === 'premium'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-[#333333] text-white border-[#333333] dark:bg-slate-200 dark:text-slate-900 dark:border-slate-200'
                      : 'text-gray-400 border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'
                    }`}
                >
                  {t === 'vip' ? '👑' : t === 'premium' ? '🔒' : '✓'} {t}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="self-end font-sans text-xs uppercase tracking-widest px-8 py-3 bg-[#333333] dark:bg-slate-700 text-white hover:bg-black dark:hover:bg-slate-600 transition-colors rounded-full shadow-sm">
            {editingPostId ? "Update Block" : "Publish Block"}
          </button>
        </form>
      </section>

      {/* ─── Category Management ─────────────────────────────────────────── */}
      <section className={`mb-20 ${divider}`}>
        <h2 className={sectionHeader}>Manage Categories</h2>

        {/* Add new topic */}
        <form onSubmit={handleAddTopic} className="flex flex-col gap-4 mb-10">
          <h3 className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-slate-600 font-sans">Add New</h3>
          <input type="text" value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)}
            placeholder="Category name..." required
            className="w-full bg-transparent border-b border-gray-200 dark:border-slate-800 text-lg py-2 text-[#333333] dark:text-slate-100 focus:outline-none focus:border-[#333333] dark:focus:border-slate-500 transition-colors font-serif placeholder:text-gray-200 dark:placeholder:text-slate-700 rounded-lg px-2" />
          <select value={newTopicParentId} onChange={(e) => setNewTopicParentId(e.target.value)}
            className="w-full bg-transparent border-b border-gray-300 dark:border-slate-600 py-2 text-[#333333] dark:text-slate-400 focus:outline-none focus:border-[#333333] dark:focus:border-slate-300 transition-colors font-sans text-sm tracking-wide appearance-none">
            <option value="" className="dark:bg-slate-800">None — Main Topic</option>
            {rootTopics.map((t) => (
              <option key={t.id} value={t.id} className="dark:bg-slate-800">{t.name}</option>
            ))}
          </select>
          <button type="submit" className="self-end font-sans text-xs uppercase tracking-widest px-6 py-3 border border-gray-200 dark:border-slate-800 hover:border-[#333333] dark:hover:border-slate-400 hover:bg-[#333333] dark:hover:bg-slate-700 hover:text-white dark:text-slate-300 dark:hover:text-white transition-all text-[#333333] rounded-full">
            Add Category
          </button>
        </form>

        {/* Existing topics list */}
        <h3 className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-slate-600 font-sans mb-4">Existing Categories</h3>
        <div className="flex flex-col gap-2">
          {rootTopics.map((root) => (
            <div key={root.id} className="flex flex-col gap-1">
              {/* Root topic */}
              {editingTopicId === root.id ? (
                <form onSubmit={handleUpdateTopic} className="flex items-center gap-3 py-2 px-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                  <input type="text" value={editTopicName} onChange={(e) => setEditTopicName(e.target.value)} required autoFocus
                    className="flex-1 bg-transparent border-b border-gray-300 dark:border-slate-600 text-sm text-[#333333] dark:text-slate-200 focus:outline-none font-sans py-1" />
                  <select value={editTopicParentId} onChange={(e) => setEditTopicParentId(e.target.value)}
                    className="bg-transparent border-b border-gray-300 dark:border-slate-600 text-xs font-sans text-gray-500 dark:text-slate-400 focus:outline-none appearance-none">
                    <option value="" className="dark:bg-slate-800">No parent</option>
                    {rootTopics.filter(t => t.id !== root.id).map(t => <option key={t.id} value={t.id} className="dark:bg-slate-800">{t.name}</option>)}
                  </select>
                  <button type="submit" className="font-sans text-[10px] uppercase tracking-widest text-green-500 hover:text-green-700 transition-colors px-3 py-1.5 border border-green-300 rounded-full">Save</button>
                  <button type="button" onClick={() => setEditingTopicId(null)} className="font-sans text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                </form>
              ) : (
                <div className="group flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                  <span className="font-sans text-sm font-medium text-[#333333] dark:text-slate-200 tracking-wide">{root.name}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditTopic(root.id, root.name, root.parentId)} className="font-sans text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#333333] dark:hover:text-slate-200 transition-colors px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-full">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteTopic(root.id, root.name)} className="font-sans text-[10px] uppercase tracking-widest text-red-300 hover:text-red-500 transition-colors px-3 py-1.5 border border-red-200 hover:border-red-400 rounded-full">
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-topics */}
              {topics.filter(t => t.parentId === root.id).map(sub => (
                editingTopicId === sub.id ? (
                  <form key={sub.id} onSubmit={handleUpdateTopic} className="flex items-center gap-3 ml-6 py-2 px-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                    <input type="text" value={editTopicName} onChange={(e) => setEditTopicName(e.target.value)} required autoFocus
                      className="flex-1 bg-transparent border-b border-gray-300 dark:border-slate-600 text-sm text-[#333333] dark:text-slate-200 focus:outline-none font-sans py-1" />
                    <select value={editTopicParentId} onChange={(e) => setEditTopicParentId(e.target.value)}
                      className="bg-transparent border-b border-gray-300 dark:border-slate-600 text-xs font-sans text-gray-500 dark:text-slate-400 focus:outline-none appearance-none">
                      <option value="" className="dark:bg-slate-800">No parent</option>
                      {rootTopics.map(t => <option key={t.id} value={t.id} className="dark:bg-slate-800">{t.name}</option>)}
                    </select>
                    <button type="submit" className="font-sans text-[10px] uppercase tracking-widest text-green-500 hover:text-green-700 transition-colors px-3 py-1.5 border border-green-300 rounded-full">Save</button>
                    <button type="button" onClick={() => setEditingTopicId(null)} className="font-sans text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                  </form>
                ) : (
                  <div key={sub.id} className="group flex items-center justify-between ml-6 py-1.5 px-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                    <span className="font-sans text-xs text-gray-500 dark:text-slate-400 tracking-wide">↳ {sub.name}</span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditTopic(sub.id, sub.name, sub.parentId)} className="font-sans text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#333333] dark:hover:text-slate-200 transition-colors px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-full">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteTopic(sub.id, sub.name)} className="font-sans text-[10px] uppercase tracking-widest text-red-300 hover:text-red-500 transition-colors px-3 py-1.5 border border-red-200 hover:border-red-400 rounded-full">
                        Delete
                      </button>
                    </div>
                  </div>
                )
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Manage Entries ──────────────────────────────────────────────── */}
      <section className={`mb-20 ${divider}`}>
        <h2 className={sectionHeader}>Manage Entries</h2>
        <div className="flex flex-col gap-8">
          {posts.map((post) => {
            const topic = topics.find(t => t.id === post.topicId);
            return (
              <div key={post.id} className="group flex justify-between items-start gap-4 border-l-2 border-gray-50 dark:border-slate-800 pl-4 py-2 hover:border-gray-200 dark:hover:border-slate-600 transition-colors">
                <div className="flex-1">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-slate-500 font-sans block mb-1">{topic?.name}</span>
                  <p className="font-serif text-[#333333] dark:text-slate-300 leading-snug line-clamp-2 italic">
                    {post.excerpt.replace(/\*\*|\*|==/g, '')}
                  </p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.tags.map(tag => <span key={tag} className="text-[9px] text-gray-400 dark:text-slate-600 font-sans">#{tag}</span>)}
                    </div>
                  )}
                </div>
                <button onClick={() => startEditing(post)} className="font-sans text-[10px] uppercase tracking-widest py-2 px-4 border border-gray-200 dark:border-slate-800 text-gray-400 hover:text-[#333333] dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600 transition-all opacity-0 group-hover:opacity-100 rounded-full">
                  Edit
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Site Settings ───────────────────────────────────────────────── */}
      <section className={divider}>
        <h2 className={sectionHeader}>Site Settings — Footer Links</h2>
        <p className="font-sans text-xs text-gray-400 dark:text-slate-500 mb-6">Edit the social links shown in the website footer.</p>
        <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {footerLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-3">
                <input type="text" value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)}
                  placeholder="Label (e.g. Twitter)"
                  className="w-1/3 bg-transparent border-b border-gray-200 dark:border-slate-800 py-2 text-sm text-[#333333] dark:text-slate-200 focus:outline-none focus:border-[#333333] dark:focus:border-slate-500 transition-colors font-sans" />
                <input type="url" value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-transparent border-b border-gray-200 dark:border-slate-800 py-2 text-sm text-[#333333] dark:text-slate-200 focus:outline-none focus:border-[#333333] dark:focus:border-slate-500 transition-colors font-sans" />
                <button type="button" onClick={() => removeLinkRow(i)} className="text-gray-300 hover:text-red-400 transition-colors font-sans text-xs px-2">✕</button>
              </div>
            ))}
          </div>

          {footerLinks.length < 8 && (
            <button type="button" onClick={addLinkRow} className="self-start font-sans text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#333333] dark:hover:text-slate-300 transition-colors border border-dashed border-gray-200 dark:border-slate-700 px-4 py-2 rounded-full">
              + Add Link
            </button>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-slate-500 font-sans">Footer Note (Optional)</label>
            <input type="text" value={footerNote} onChange={(e) => setFooterNote(e.target.value)}
              placeholder="A short tagline or note..."
              className={inputBase} />
          </div>

          <button type="submit" className="self-end font-sans text-xs uppercase tracking-widest px-8 py-3 bg-[#333333] dark:bg-slate-700 text-white hover:bg-black dark:hover:bg-slate-600 transition-colors rounded-full shadow-sm">
            {settingsSaved ? "✓ Saved!" : "Save Settings"}
          </button>
        </form>
      </section>

      {/* ─── Seed Likes ─────────────────────────────────────────────────── */}
      <section className="mb-20 pt-10 border-t border-dashed border-gray-200 dark:border-slate-700">
        <h2 className="font-serif text-xl text-[#333333] dark:text-slate-100 mb-2">Utils</h2>
        <p className="font-sans text-xs text-gray-400 dark:text-slate-500 mb-6">
          Tự động thêm số tim ngẫu nhiên (50–100) cho các bài viết cũ chưa có.
        </p>
        <button
          type="button"
          disabled={seedStatus !== "idle"}
          onClick={async () => {
            setSeedStatus("running");
            const snapshot = await getDocs(collection(db, "posts"));
            const updates = snapshot.docs.filter(d => !d.data().likes).map(d =>
              updateDoc(doc(db, "posts", d.id), {
                likes: Math.floor(Math.random() * 51) + 50,
              })
            );
            await Promise.all(updates);
            setSeedStatus("done");
          }}
          className="font-sans text-xs uppercase tracking-widest px-6 py-2.5 rounded-full border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-[#333333] dark:hover:border-slate-400 hover:text-[#333333] dark:hover:text-slate-200 disabled:opacity-40 transition-all"
        >
          {seedStatus === "idle" && "Seed likes for old posts"}
          {seedStatus === "running" && "Running…"}
          {seedStatus === "done" && "✓ Done! All posts now have likes."}
        </button>
      </section>
      {/* ─── User Management ─────────────────────────────────────────────── */}
      <section className="mb-20 pt-10 border-t border-dashed border-gray-200 dark:border-slate-700">
        <h2 className="font-serif text-xl text-[#333333] dark:text-slate-100 mb-1">User Management</h2>
        <p className="font-sans text-xs text-gray-400 dark:text-slate-500 mb-6">
          Danh sách tất cả người dùng đã đăng nhập. Click vào tier để thay đổi ngay.
        </p>
        <UserTierManager />
      </section>
    </div>
  );
}

// ── User list + inline tier toggle ─────────────────────────────────────────
type UserRecord = {
  uid: string;
  email: string;
  displayName: string;
  tier: "free" | "premium" | "vip";
  createdAt: string;
};

function UserTierManager() {
  const [users, setUsers]       = useState<UserRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [saving, setSaving]     = useState<string | null>(null); // uid being saved

  // Load all users from Firestore
  const loadUsers = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "users"));
    const list: UserRecord[] = snap.docs.map((d) => ({
      uid:         d.id,
      email:       d.data().email       ?? "",
      displayName: d.data().displayName ?? "",
      tier:        d.data().tier        ?? "free",
      createdAt:   d.data().createdAt   ?? "",
    }));
    // Sort newest first
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    setUsers(list);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const changeTier = async (uid: string, newTier: "free" | "premium" | "vip") => {
    setSaving(uid);
    await setDoc(doc(db, "users", uid), { tier: newTier }, { merge: true });
    setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, tier: newTier } : u));
    setSaving(null);
  };

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {/* Search + Refresh */}
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo email hoặc tên..."
          className="flex-1 bg-transparent border-b border-gray-200 dark:border-slate-800 py-2 text-sm text-[#333333] dark:text-slate-100 focus:outline-none font-sans placeholder:text-gray-300"
        />
        <button
          type="button"
          onClick={loadUsers}
          className="font-sans text-xs uppercase tracking-widest px-4 py-2 border border-gray-200 dark:border-slate-700 hover:border-gray-400 rounded-full transition-all text-gray-500 dark:text-slate-400 flex-shrink-0"
        >
          ↻ Refresh
        </button>
      </div>

      {/* State indicators */}
      {loading && (
        <p className="font-sans text-xs text-gray-400 dark:text-slate-500 animate-pulse">Đang tải danh sách…</p>
      )}
      {!loading && filtered.length === 0 && (
        <p className="font-sans text-xs text-gray-400 dark:text-slate-500">
          {search ? "Không tìm thấy user nào." : "Chưa có user nào đăng nhập."}
        </p>
      )}

      {/* User list */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col divide-y divide-gray-100 dark:divide-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden">
          {filtered.map((u) => (
            <div key={u.uid} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
              <div className="min-w-0">
                <p className="font-sans text-sm font-medium text-[#333] dark:text-slate-100 truncate">
                  {u.displayName || <span className="italic text-gray-400">(chưa đặt tên)</span>}
                </p>
                <p className="font-sans text-[11px] text-gray-400 dark:text-slate-500 truncate">{u.email}</p>
                {u.createdAt && (
                  <p className="font-sans text-[10px] text-gray-300 dark:text-slate-700 mt-0.5">
                    Joined {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                )}
              </div>

              <div className="flex gap-1.5 flex-shrink-0">
                {(["free", "premium", "vip"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    disabled={saving === u.uid}
                    onClick={() => u.tier !== t && changeTier(u.uid, t)}
                    className={`
                      font-sans text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border transition-all
                      ${u.tier === t
                        ? t === "vip"       ? "bg-purple-600 text-white border-purple-600"
                          : t === "premium" ? "bg-amber-500 text-white border-amber-500"
                          : "bg-[#333] text-white border-[#333] dark:bg-slate-200 dark:text-slate-900 dark:border-slate-200"
                        : "text-gray-300 dark:text-slate-700 border-gray-200 dark:border-slate-800 hover:border-gray-400 dark:hover:border-slate-500 hover:text-gray-500 dark:hover:text-slate-400"
                      }
                      ${saving === u.uid ? "opacity-50 cursor-wait" : "cursor-pointer"}
                    `}
                  >
                    {saving === u.uid && u.tier !== t ? "…" : (t === "vip" ? "👑" : t === "premium" ? "🔒" : "✓")}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && users.length > 0 && (
        <p className="font-sans text-[10px] text-gray-300 dark:text-slate-700">
          {filtered.length} / {users.length} users
        </p>
      )}
    </div>
  );
}
