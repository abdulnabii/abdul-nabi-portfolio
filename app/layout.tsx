import { SiteChrome } from "@/components/site-chrome";
import { siteContent } from "@/data/content";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteContent.title,
    template: `%s · ${siteContent.name}`,
  },
  description: siteContent.tagline,
  keywords: [
    "Abdul Nabi",
    "Full-Stack Engineer",
    "Next.js",
    "TypeScript",
    "Product UI",
    "Portfolio",
  ],
  authors: [{ name: siteContent.name }],
  creator: siteContent.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    title: siteContent.title,
    description: siteContent.tagline,
    siteName: siteContent.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteContent.title,
    description: siteContent.tagline,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans bg-ambient antialiased`}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
