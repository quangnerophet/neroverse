import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/StoreProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ViewToggle } from "@/components/ViewToggle";
import Link from "next/link";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Nero Micro-Blogging | A Typography Experience",
  description: "Reading a book in short blocks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col selection:bg-yellow-100 dark:selection:bg-yellow-900/30 bg-[#FAFAFA] dark:bg-slate-900 transition-colors duration-300">
        <ThemeProvider>
          <StoreProvider>
            <header className="border-b border-gray-200 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 transition-colors duration-300">
              <div className="max-w-4xl mx-auto px-6 py-8 flex justify-between items-center">
                <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                  <span className="font-serif text-2xl tracking-tight text-[#333333] dark:text-slate-100">
                    Nero Micro-Blogging
                  </span>
                </Link>
                <div className="flex items-center gap-6">
                  <ViewToggle />
                  <ThemeToggle />
                </div>
              </div>
            </header>

            <main className="flex-grow">
              {children}
            </main>
          </StoreProvider>

          <footer className="border-t border-gray-200 dark:border-slate-700 mt-24 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-6 py-12 text-center text-sm text-gray-400 dark:text-slate-500 font-sans tracking-wide">
              &copy; {new Date().getFullYear()} Nero Micro-Blogging. All rights reserved.
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
