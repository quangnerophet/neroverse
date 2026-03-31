"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
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
  h1: ({ children }) => (
    <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100 mt-10 mb-4">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-3">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-serif text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-2">
      {children}
    </h3>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-300 dark:border-slate-600 pl-5 my-6 italic text-gray-500 dark:text-slate-400 font-serif">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 my-4 ml-4 font-serif text-[#333333] dark:text-slate-200">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 my-4 ml-4 font-serif text-[#333333] dark:text-slate-200">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className={`block bg-gray-100 dark:bg-slate-800 rounded-lg p-4 my-4 text-sm font-mono text-gray-800 dark:text-slate-200 overflow-x-auto ${className}`}>
          {children}
        </code>
      );
    }
    return (
      <code className="bg-gray-100 dark:bg-slate-800 rounded px-1.5 py-0.5 text-sm font-mono text-gray-800 dark:text-slate-200">
        {children}
      </code>
    );
  },
  hr: () => (
    <hr className="my-8 border-gray-200 dark:border-slate-700" />
  ),
};

export function MarkdownContent({ content, className = "", hideImages = false }: MarkdownContentProps) {
  const processed = preProcess(content);

  const mergedComponents = {
    ...components,
    img: hideImages ? () => null : ({ src, alt }: { src?: string; alt?: string }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className="w-full h-auto rounded-xl my-6 object-cover shadow-sm" />
    )
  };

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={mergedComponents as Components}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
