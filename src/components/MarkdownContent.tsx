"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import type { Components } from "react-markdown";
import type { ReactNode } from "react";

type MarkdownContentProps = {
  content: string;
  className?: string;
  hideImages?: boolean;
};

// Pre-process content: 
// 1. Handle ==highlight== tags
// 2. Preserve single newlines by converting them to Markdown hard breaks (two spaces + \n)
function preProcess(text: string): string {
  const processed = text.replace(/==(.*?)==/g, "<mark>$1</mark>");
  // Convert single \n to "  \n" to force a line break in standard Markdown rendering
  return processed.split('\n').join('  \n');
}

// Custom component mappings for clean typography + dark mode
const components: Components = {
  p: ({ children }) => (
    <p className="font-serif leading-loose text-[#333333] dark:text-slate-200 mb-6 last:mb-0">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-slate-900 dark:text-slate-100">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic text-slate-700 dark:text-slate-300">{children}</em>
  ),
  mark: ({ children }: { children?: ReactNode }) => (
    <mark className="font-semibold bg-yellow-200 text-gray-900 dark:bg-yellow-900/40 dark:text-yellow-100 px-1 rounded-sm not-italic">
      {children}
    </mark>
  ),
};

export function MarkdownContent({ content, className = "", hideImages = false }: MarkdownContentProps) {
  const processed = preProcess(content);

  const mergedComponents = {
    ...components,
    img: hideImages ? () => null : ({ src, alt }: { src?: string; alt?: string }) => (
      <img src={src} alt={alt} className="w-full h-auto rounded-xl my-6 object-cover shadow-sm" />
    )
  };

  return (
    <div className={className}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={mergedComponents as any}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
