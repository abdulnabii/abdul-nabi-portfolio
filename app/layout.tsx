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
    default: "Abdul Nabi — Full-Stack Developer & AI/ML Engineer | Karachi",
    template: `%s · Abdul Nabi`,
  },
  description:
    "Portfolio of Abdul Nabi — Full-Stack Engineer & AI/ML Developer specializing in Next.js 14, TypeScript, Python ML, Supabase, REST APIs, and Application Security. Based in Karachi, Pakistan. Open to remote work.",
  keywords: [
    "Abdul Nabi",
    "Abdul Nabi developer",
    "Abdul Nabi portfolio",
    "Abdul Nabi Khaskheli",
    "aiwithab.site",
    "Full-Stack Developer Karachi",
    "Full-Stack Engineer Pakistan",
    "Next.js Developer Pakistan",
    "TypeScript developer",
    "React developer Pakistan",
    "Python ML Engineer",
    "AI engineer Pakistan",
    "Machine Learning developer",
    "Application Security developer",
    "AppSec engineer",
    "Supabase developer",
    "PostgreSQL developer",
    "Next.js 14 app router",
    "hire full stack developer Pakistan",
    "freelance developer Karachi",
    "Blood Sugar Tracker FYP",
    "30 days 30 AI projects",
    "AI blog generator",
    "web developer portfolio",
    "software engineer portfolio Pakistan",
  ],
  authors: [{ name: "Abdul Nabi", url: "https://www.aiwithab.site" }],
  creator: "Abdul Nabi",
  publisher: "Abdul Nabi",
  alternates: {
    canonical: "https://www.aiwithab.site",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.aiwithab.site",
    title: "Abdul Nabi — Full-Stack Developer & AI/ML Engineer",
    description:
      "Portfolio of Abdul Nabi — Next.js, TypeScript, Python ML, Supabase, REST APIs, and Application Security. Based in Karachi, Pakistan.",
    siteName: "Abdul Nabi — aiwithab.site",
    images: [
      {
        url: "https://www.aiwithab.site/profile.jpg",
        width: 1200,
        height: 630,
        alt: "Abdul Nabi — Full-Stack Developer & AI/ML Engineer",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Abdul Nabi — Full-Stack Developer & AI/ML Engineer",
    description:
      "Portfolio of Abdul Nabi — Next.js, TypeScript, Python ML, Supabase, REST APIs, and AppSec. Based in Karachi, Pakistan.",
    images: ["https://www.aiwithab.site/profile.jpg"],
    creator: "@abdulnabii",
    site: "@abdulnabii",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  category: "technology",
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
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://www.aiwithab.site/#person",
        name: "Abdul Nabi",
        alternateName: "Abdul Nabi Khaskheli",
        jobTitle: "Full-Stack Developer & AI/ML Engineer",
        description:
          "Full-Stack Engineer & AI/ML Developer specializing in Next.js 14, TypeScript, Python, Supabase, and Application Security. Based in Karachi, Pakistan.",
        url: "https://www.aiwithab.site",
        image: {
          "@type": "ImageObject",
          url: "https://www.aiwithab.site/profile.jpg",
          width: 400,
          height: 400,
        },
        email: "abdulnabi.khaskhely@gmail.com",
        sameAs: [
          "https://github.com/abdulnabii",
          "https://linkedin.com/in/abdul-nabi-95391a3b0",
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Karachi",
          addressRegion: "Sindh",
          addressCountry: "PK",
        },
        alumniOf: {
          "@type": "EducationalOrganization",
          name: "University of Sindh",
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
          "REST APIs",
          "AI Engineering",
        ],
        hasOccupation: {
          "@type": "Occupation",
          name: "Full-Stack Software Engineer",
          occupationLocation: {
            "@type": "City",
            name: "Karachi",
          },
          skills: "Next.js, TypeScript, React, Python, Machine Learning, Supabase, PostgreSQL, Application Security",
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://www.aiwithab.site/#website",
        url: "https://www.aiwithab.site",
        name: "Abdul Nabi — Portfolio & Blog",
        description: "Portfolio and blog of Abdul Nabi, Full-Stack Developer & AI/ML Engineer based in Karachi, Pakistan.",
        publisher: { "@id": "https://www.aiwithab.site/#person" },
        inLanguage: "en-US",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://www.aiwithab.site/blog?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
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
