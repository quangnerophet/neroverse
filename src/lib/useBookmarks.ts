"use client";

import { useState, useEffect } from "react";

export type Bookmark = {
  id: string; // The ID of the bookmark entry itself
  postId: string; // The ID of the post being bookmarked
  savedAt: string;
};

const STORAGE_KEY = "nero_bookmarks";

/** Simulated DB save — replace body with real Firestore call when ready. */
async function saveBookmarkToDB(bookmark: Bookmark): Promise<void> {
  console.log("[bookmark] saved to (simulated) DB:", bookmark);
  // TODO: await setDoc(doc(db, "bookmarks", ...), bookmark);
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setBookmarks(JSON.parse(raw));
      } catch { /* ignore */ }
      setIsLoaded(true);
    };
    
    load();
    window.addEventListener("nero_bookmarks_changed", load);
    return () => window.removeEventListener("nero_bookmarks_changed", load);
  }, []);

  const persist = (items: Bookmark[]) => {
    setBookmarks(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("nero_bookmarks_changed"));
  };

  const toggleBookmark = async (postId: string) => {
    const isBookmarked = bookmarks.some((b) => b.postId === postId);
    
    if (isBookmarked) {
      persist(bookmarks.filter((b) => b.postId !== postId));
    } else {
      const b: Bookmark = {
        id: `bn_${Date.now()}`,
        postId,
        savedAt: new Date().toISOString(),
      };
      const updated = [b, ...bookmarks];
      persist(updated);
      await saveBookmarkToDB(b);
    }
  };

  const isBookmarked = (postId: string) => {
    return bookmarks.some((b) => b.postId === postId);
  };

  return { bookmarks, toggleBookmark, isBookmarked, isLoaded };
}
