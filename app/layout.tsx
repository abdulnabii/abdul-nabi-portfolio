import { DraftPreviewBanner } from "@/components/draft-preview-banner";
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

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://abdulnabi.vercel.app"
  ),
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
    images: [
      {
        url: "/profile.jpg",
        width: 1200,
        height: 630,
        alt: "Abdul Nabi — Full-Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteContent.title,
    description: siteContent.tagline,
    images: ["/profile.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { SettingsProvider } from "@/components/settings-provider";
import {
  getSiteSettings,
  getAboutData,
  getSkillsData,
  getExperienceData,
  getEducationData,
} from "@/lib/settings-store";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const about = await getAboutData();
  const skills = await getSkillsData();
  const experience = await getExperienceData();
  const education = await getEducationData();

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans bg-ambient antialiased`}>
        <SettingsProvider
          initialSettings={settings}
          initialAbout={about}
          initialSkills={skills}
          initialExperience={experience}
          initialEducation={education}
        >
          <DraftPreviewBanner />
          <SiteChrome>{children}</SiteChrome>
        </SettingsProvider>
      </body>
    </html>
  );
}
