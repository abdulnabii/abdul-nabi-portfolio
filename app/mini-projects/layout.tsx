import type { Metadata } from "next";
import { getMiniProjects } from "@/lib/mini-projects-store";

export const metadata: Metadata = {
  title: "Free AI Web Apps, Developer Tools & Labs Online | Abdul Nabi",
  description:
    "Explore 30+ free interactive AI tools, developer utilities, and web applications — AI Resume Builder, Diabetes Risk Predictor, Cloud Architecture Canvas, SQL Generator, and API Load Tester.",
  keywords: [
    "free AI tools online",
    "AI resume builder ATS free",
    "diabetes risk predictor machine learning",
    "cloud architecture diagram generator",
    "API load testing dashboard free",
    "AI SQL query builder",
    "Next.js developer tools",
    "30 days 30 AI projects",
    "Abdul Nabi dev labs",
    "full stack AI web applications",
  ],
  alternates: {
    canonical: "https://www.aiwithab.site/mini-projects",
  },
  openGraph: {
    title: "Free AI Web Apps, Developer Tools & Labs Online | Abdul Nabi",
    description:
      "30+ free interactive AI tools, developer utilities, and web applications built with Next.js, TypeScript, and Python ML by Abdul Nabi.",
    url: "https://www.aiwithab.site/mini-projects",
    type: "website",
    images: [
      {
        url: "https://www.aiwithab.site/profile.jpg",
        width: 1200,
        height: 630,
        alt: "Free AI Web Apps & Developer Tools by Abdul Nabi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Web Apps, Developer Tools & Labs Online | Abdul Nabi",
    description:
      "30+ free interactive AI tools, developer utilities, and web applications by Abdul Nabi.",
    images: ["https://www.aiwithab.site/profile.jpg"],
  },
};

export default async function MiniProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let projects: any[] = [];
  try {
    projects = await getMiniProjects();
  } catch {}

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "30 Days 30 AI Projects & Free Developer Tools",
    description: "Interactive AI applications, developer utilities, and web tools built by Abdul Nabi.",
    url: "https://www.aiwithab.site/mini-projects",
    numberOfItems: projects.length,
    itemListElement: projects.slice(0, 15).map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "SoftwareApplication",
        name: p.title,
        description: p.description,
        applicationCategory: p.category.includes("Health")
          ? "HealthApplication"
          : p.category.includes("FinTech")
          ? "FinanceApplication"
          : "DeveloperApplication",
        operatingSystem: "Web Browser",
        url: p.vercelUrl || "https://www.aiwithab.site/mini-projects",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        author: {
          "@type": "Person",
          name: "Abdul Nabi",
          url: "https://www.aiwithab.site",
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}

