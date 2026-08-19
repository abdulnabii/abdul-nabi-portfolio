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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.aiwithab.site"
  ),
  title: {
    default: "Abdul Nabi — Full-Stack Developer & Data / ML Engineer",
    template: `%s · Abdul Nabi`,
  },
  description:
    "Official portfolio of Abdul Nabi — Full-Stack Engineer specializing in Next.js, TypeScript, REST APIs, Python ML models, and Application Security (AppSec) based in Karachi, Pakistan.",
  keywords: [
    "Abdul Nabi",
    "aiwithab.site",
    "Abdul Nabi Portfolio",
    "Full-Stack Developer Karachi",
    "Full-Stack Engineer Pakistan",
    "Next.js Developer",
    "TypeScript Specialist",
    "Python ML Engineer",
    "Blood Sugar Tracker FYP",
    "Application Security Learner",
    "Supabase PostgreSQL Developer",
  ],
  authors: [{ name: "Abdul Nabi", url: "https://www.aiwithab.site" }],
  creator: "Abdul Nabi",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.aiwithab.site",
    title: "Abdul Nabi — Full-Stack Developer & Data / ML Engineer",
    description:
      "Full-stack developer building clean Next.js apps, REST APIs, and ML models with active learning in Application Security.",
    siteName: "Abdul Nabi Portfolio",
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
    title: "Abdul Nabi — Full-Stack Developer & Data / ML Engineer",
    description:
      "Full-stack developer building production Next.js apps, REST APIs, and ML models.",
    images: ["/profile.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
};

import { SettingsProvider } from "@/components/settings-provider";
import {
  getSiteSettings,
  getAboutData,
  getSkillsData,
  getExperienceData,
  getEducationData,
  getSectionVisibility,
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
  const sectionVisibility = await getSectionVisibility();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Abdul Nabi",
    jobTitle: "Full-Stack Developer & Data / ML Engineer",
    url: "https://www.aiwithab.site",
    sameAs: [
      "https://github.com/abdulnabii",
      "https://linkedin.com/in/abdulnabi-khaskheli",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Karachi",
      addressRegion: "Sindh",
      addressCountry: "Pakistan",
    },
    knowsAbout: [
      "Next.js",
      "TypeScript",
      "React",
      "Full-Stack Web Development",
      "Python",
      "Machine Learning",
      "Application Security",
      "Supabase",
      "PostgreSQL",
    ],
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("app_theme");if(t==="light"){document.documentElement.classList.add("light");document.documentElement.classList.remove("dark");}else{document.documentElement.classList.add("dark");document.documentElement.classList.remove("light");}}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans bg-ambient antialiased`}>
        <SettingsProvider
          initialSettings={settings}
          initialAbout={about}
          initialSkills={skills}
          initialExperience={experience}
          initialEducation={education}
          initialSectionVisibility={sectionVisibility}
        >
          <DraftPreviewBanner />
          <SiteChrome>{children}</SiteChrome>
        </SettingsProvider>
      </body>
    </html>
  );
}
