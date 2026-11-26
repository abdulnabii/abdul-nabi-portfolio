import type { Metadata } from "next";
import { getMiniProjects } from "@/lib/mini-projects-store";
import { MiniProjectsClient } from "@/components/mini-projects/mini-projects-client";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Live Mini Projects & AI Micro-Tools — Abdul Nabi",
  description:
    "Explore 30 production micro-applications, healthcare ML tools, FinTech & AppSec utilities, and real-time AI demos built by Abdul Nabi.",
  alternates: {
    canonical: "https://www.abdulnabi.org/mini-projects",
  },
};

export default async function MiniProjectsPage() {
  const miniProjects = await getMiniProjects();
  return <MiniProjectsClient initialProjects={miniProjects} />;
}
