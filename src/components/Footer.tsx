"use client";

import { useStore } from "@/lib/StoreProvider";

export function Footer() {
  const { siteSettings } = useStore();
  const links = siteSettings?.footerLinks ?? [];
  const note = siteSettings?.footerNote ?? "";

  return (
    <footer className="border-t border-gray-200 dark:border-slate-700 mt-24 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {links.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-xs uppercase tracking-widest text-gray-400 dark:text-slate-500 hover:text-[#333333] dark:hover:text-slate-300 transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
        <p className="text-center text-sm text-gray-400 dark:text-slate-500 font-sans tracking-wide">
          &copy; {new Date().getFullYear()} Nero Micro-Blogging. All rights reserved.
        </p>
        {note && (
          <p className="text-center text-xs text-gray-300 dark:text-slate-600 font-sans mt-2 tracking-wide">
            {note}
          </p>
        )}
      </div>
    </footer>
  );
}
