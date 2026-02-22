import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spider Sitemap Generator — Visualize & Export Sitemaps",
  description: "Crawl websites and generate visual sitemaps",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}<Analytics />
      </body>
    </html>
  );
}
