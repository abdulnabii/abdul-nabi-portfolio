import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "30 Days 30 AI Projects — Interactive Developer Tools & Demos | Abdul Nabi",
  description:
    "Explore 30 production AI & full-stack micro-applications built by Abdul Nabi — including Healthcare ML diagnostic predictors, automated AppSec auditors, developer utilities, and AI agents with live browser demos.",
  keywords: [
    "30 Days 30 AI Projects",
    "Abdul Nabi Mini Projects",
    "AI Developer Tools",
    "Healthcare ML Web App",
    "Diabetes Risk Predictor",
    "Code Review Bot",
    "Next.js AI Tools",
    "Free AI Browser Tools",
    "Abdul Nabi",
    "aiwithab.site",
  ],
  alternates: {
    canonical: "https://www.aiwithab.site/mini-projects",
  },
  openGraph: {
    title: "30 Days 30 AI Projects — Interactive Developer Tools & Demos | Abdul Nabi",
    description:
      "Explore 30 production AI & full-stack micro-applications built by Abdul Nabi — live browser demos, Healthcare ML, and AppSec tools.",
    url: "https://www.aiwithab.site/mini-projects",
    type: "website",
    images: [
      {
        url: "https://www.aiwithab.site/profile.jpg",
        width: 1200,
        height: 630,
        alt: "30 Days 30 AI Projects by Abdul Nabi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "30 Days 30 AI Projects — Interactive Developer Tools & Demos | Abdul Nabi",
    description:
      "Explore 30 production AI & full-stack micro-applications built by Abdul Nabi with live browser demos.",
    images: ["https://www.aiwithab.site/profile.jpg"],
    creator: "@abdulnabii",
  },
};

export default function MiniProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.aiwithab.site",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Mini Projects",
            item: "https://www.aiwithab.site/mini-projects",
          },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": "https://www.aiwithab.site/mini-projects#collection",
        name: "30 Days 30 AI Projects Challenge — Abdul Nabi",
        url: "https://www.aiwithab.site/mini-projects",
        description:
          "Open-source suite of 30 interactive AI and machine learning micro-applications spanning Healthcare, DevTools, FinTech, and IoT.",
        author: {
          "@type": "Person",
          name: "Abdul Nabi",
          url: "https://www.aiwithab.site",
        },
      },
    ],
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
