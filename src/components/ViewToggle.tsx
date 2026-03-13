"use client";

import { useStore } from "@/lib/StoreProvider";
import { useEffect, useState } from "react";

export function ViewToggle() {
  const { viewMode, setViewMode } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-20 h-8 animate-pulse bg-gray-100 dark:bg-slate-800 rounded-full" />
    );
  }

  return (
    <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-full border border-gray-200 dark:border-slate-700">
      <button
        onClick={() => setViewMode("masonry")}
        className={`px-3 py-1 text-[10px] uppercase tracking-widest font-sans rounded-full transition-all duration-300 ${
          viewMode === "masonry"
            ? "bg-white dark:bg-slate-700 text-[#333333] dark:text-slate-100 shadow-sm"
            : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
        }`}
      >
        Cards
      </button>
      <button
        onClick={() => setViewMode("list")}
        className={`px-3 py-1 text-[10px] uppercase tracking-widest font-sans rounded-full transition-all duration-300 ${
          viewMode === "list"
            ? "bg-white dark:bg-slate-700 text-[#333333] dark:text-slate-100 shadow-sm"
            : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
        }`}
      >
        List
      </button>
    </div>
  );
}
