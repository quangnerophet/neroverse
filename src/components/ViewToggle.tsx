"use client";

import { useStore } from "@/lib/StoreProvider";
import { useEffect, useState } from "react";

export function ViewToggle() {
  const { viewMode, setViewMode, sortOrder, setSortOrder } = useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div className="w-48 h-8 animate-pulse bg-gray-100 dark:bg-slate-800 rounded-full" />;
  }

  const pill = "flex bg-gray-100 dark:bg-slate-800 p-1 rounded-full border border-gray-200 dark:border-slate-700";
  const btnBase = "px-3 py-1 text-[10px] uppercase tracking-widest font-sans rounded-full transition-all duration-200";
  const active = "bg-white dark:bg-slate-700 text-[#333333] dark:text-slate-100 shadow-sm";
  const inactive = "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300";

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      {/* Sort */}
      <div className={pill}>
        <button onClick={() => setSortOrder("newest")} className={`${btnBase} ${sortOrder === "newest" ? active : inactive}`}>Newest</button>
        <button onClick={() => setSortOrder("oldest")} className={`${btnBase} ${sortOrder === "oldest" ? active : inactive}`}>Oldest</button>
        <button onClick={() => setSortOrder("mostliked")} className={`${btnBase} ${sortOrder === "mostliked" ? active : inactive}`}>Most ❤️</button>
      </div>

      {/* View mode */}
      <div className={pill}>
        <button onClick={() => setViewMode("cards")} className={`${btnBase} ${viewMode === "cards" ? active : inactive}`}>Cards</button>
        <button onClick={() => setViewMode("list")} className={`${btnBase} ${viewMode === "list" ? active : inactive}`}>List</button>
        <button onClick={() => setViewMode("masonry")} className={`${btnBase} ${viewMode === "masonry" ? active : inactive}`}>Masonry</button>
      </div>
    </div>
  );
}
