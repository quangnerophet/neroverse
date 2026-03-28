"use client";

import { useEffect, useRef, useState } from "react";
import type { UserTier } from "@/lib/useUserTier";

type Props = {
  containerRef: React.RefObject<HTMLElement | null>;
  userTier: UserTier;
  onSave: (text: string) => void;
};

export function HighlightTooltip({ containerRef, userTier, onSave }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const canHighlight = userTier === "premium" || userTier === "vip";

  useEffect(() => {
    if (!canHighlight) return;

    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selected = selection?.toString().trim();
      if (!selected || selected.length < 5) { setTooltip(null); return; }

      // Ensure selection is inside the article container
      if (!containerRef.current) return;
      const range = selection!.getRangeAt(0);
      if (!containerRef.current.contains(range.commonAncestorContainer)) {
        setTooltip(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      setTooltip({
        x: rect.left - containerRect.left + rect.width / 2 + containerRef.current.scrollLeft,
        y: rect.top - containerRect.top + containerRef.current.scrollTop - 48,
        text: selected,
      });
    };

    const handleMouseDown = (e: MouseEvent | TouchEvent | Event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setTooltip(null);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleMouseUp);
    document.addEventListener("selectionchange", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown as EventListener);
    document.addEventListener("touchstart", handleMouseDown as EventListener);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
      document.removeEventListener("selectionchange", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown as EventListener);
      document.removeEventListener("touchstart", handleMouseDown as EventListener);
    };
  }, [canHighlight, containerRef]);

  const handleSave = () => {
    if (!tooltip) return;
    onSave(tooltip.text);
    // Visually highlight the selected text
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const mark = document.createElement("mark");
      mark.className = "nero-highlight";
      try { range.surroundContents(mark); } catch { /* skip complex ranges */ }
      selection.removeAllRanges();
    }
    setTooltip(null);
  };

  if (!tooltip) return null;

  return (
    <div
      ref={tooltipRef}
      style={{ position: "absolute", left: tooltip.x, top: tooltip.y, transform: "translateX(-50%)", zIndex: 9999 }}
      className="pointer-events-auto"
    >
      <button
        onMouseDown={(e) => e.preventDefault()} // prevent selection loss
        onClick={handleSave}
        className="
          flex items-center gap-1.5 px-3 py-1.5
          bg-[#1a1a1a] dark:bg-white
          text-white dark:text-[#1a1a1a]
          text-[11px] font-sans font-semibold tracking-wide
          rounded-full shadow-lg
          hover:bg-[#333] dark:hover:bg-gray-100
          transition-all duration-150 whitespace-nowrap
          border border-transparent
        "
      >
        <span>✦</span>
        <span>Lưu Highlight</span>
      </button>
      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-2 h-2 bg-[#1a1a1a] dark:bg-white rotate-45 -mt-1" />
      </div>
    </div>
  );
}
