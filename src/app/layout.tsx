import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/StoreProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ViewToggle } from "@/components/ViewToggle";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/lib/AuthContext";
import { AuthButton } from "@/components/AuthButton";
import { NameInputModal } from "@/components/NameInputModal";
import { PricingModal } from "@/components/PricingModal";
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
      <head>
        {/* GitHub Pages SPA redirect handler: restores path from ?p= query param */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var params = new URLSearchParams(window.location.search);
            var p = params.get('p');
            if (p) {
              params.delete('p');
              var q = params.get('q');
              params.delete('q');
              var newUrl = '/' + p + (q ? '?' + q : '') + window.location.hash;
              window.history.replaceState(null, null, newUrl);
            }
          })()
        `}} />
      </head>
      <body className="antialiased min-h-screen flex flex-col selection:bg-yellow-100 dark:selection:bg-yellow-900/30 bg-[#FAFAFA] dark:bg-slate-900 transition-colors duration-300">
        <ThemeProvider>
          <StoreProvider>
            <AuthProvider>
            <header className="border-b border-gray-200 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-900 transition-colors duration-300">
              {/* Mobile: logo centered on top, controls centered below */}
              <div className="max-w-4xl mx-auto px-6 py-5 flex flex-col gap-4 items-center md:flex-row md:justify-between md:py-8 md:gap-0">
                <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                  <span className="font-serif text-2xl tracking-tight text-[#333333] dark:text-slate-100">
                    Nero Micro-Blogging
                  </span>
                </Link>
                <div className="flex items-center gap-3">
                  <ViewToggle />
                  <ThemeToggle />
                  <AuthButton />
                </div>
              </div>
            </header>

            <main className="flex-grow">
              {children}
            </main>

            <Footer />
            <NameInputModal />
            <PricingModal />
            </AuthProvider>
          </StoreProvider>

        </ThemeProvider>
      </body>
    </html>
  );
}
