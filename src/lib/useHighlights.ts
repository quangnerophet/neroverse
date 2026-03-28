"use client";

import { useState, useEffect } from "react";

export type Highlight = {
  id: string;
  text: string;
  postId: string;
  postTitle?: string;
  savedAt: string;
};

const STORAGE_KEY = "nero_highlights";

/** Simulated DB save — replace body with real Firestore call when ready. */
async function saveHighlightToDB(highlight: Highlight): Promise<void> {
  console.log("[highlight] saved to (simulated) DB:", highlight);
  // TODO: await addDoc(collection(db, "highlights"), highlight);
}

export function useHighlights() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setHighlights(JSON.parse(raw));
      } catch { /* ignore */ }
    };
    
    load();
    window.addEventListener("nero_highlights_changed", load);
    return () => window.removeEventListener("nero_highlights_changed", load);
  }, []);

  const persist = (items: Highlight[]) => {
    setHighlights(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("nero_highlights_changed"));
  };

  const addHighlight = async (text: string, postId: string, postTitle?: string) => {
    const h: Highlight = {
      id: `h_${Date.now()}`,
      text: text.trim(),
      postId,
      postTitle,
      savedAt: new Date().toISOString(),
    };
    const updated = [h, ...highlights];
    persist(updated);
    await saveHighlightToDB(h);
    return h;
  };

  const removeHighlight = (id: string) => {
    persist(highlights.filter((h) => h.id !== id));
  };

  return { highlights, addHighlight, removeHighlight };
}
