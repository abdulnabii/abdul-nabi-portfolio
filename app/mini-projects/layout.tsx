import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dev Labs — Mini Projects & Interactive Tools | Abdul Nabi",
  description:
    "30+ interactive mini projects and developer tools by Abdul Nabi — games, physics simulations, AI demos, and coding experiments. Built with Next.js and TypeScript.",
  alternates: {
    canonical: "https://www.aiwithab.site/mini-projects",
  },
  openGraph: {
    title: "Dev Labs — Mini Projects & Interactive Tools | Abdul Nabi",
    description:
      "30+ interactive mini projects, games, AI demos, and developer tools built by Abdul Nabi.",
    url: "https://www.aiwithab.site/mini-projects",
    type: "website",
    images: [
      {
        url: "https://www.aiwithab.site/profile.jpg",
        width: 1200,
        height: 630,
        alt: "Dev Labs by Abdul Nabi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dev Labs — Mini Projects & Interactive Tools | Abdul Nabi",
    description:
      "30+ interactive mini projects, games, AI demos, and developer tools built by Abdul Nabi.",
    images: ["https://www.aiwithab.site/profile.jpg"],
  },
};

export default function MiniProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
