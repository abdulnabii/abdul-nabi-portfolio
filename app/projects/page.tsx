import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { getPublishedProjects } from "@/lib/project-store";
import { isPublicUrl } from "@/lib/links";
import { ArrowLeft, ArrowUpRight, FolderGit2, Github, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import seedProjects from "@/data/projects.json";
import { ProjectFilterList } from "@/components/projects/project-filter-list";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Projects | Abdul Nabi — Full-Stack Developer",
  description:
    "Browse all projects by Abdul Nabi — Full-Stack apps built with Next.js, Supabase, TypeScript, and ML systems. Case studies, source code, and live demos.",
  openGraph: {
    title: "All Projects | Abdul Nabi",
    description: "Full portfolio of web apps, ML systems, and open-source projects by Abdul Nabi.",
  },
};

export default async function AllProjectsPage() {
  let projects: any[] = [];
  try {
    projects = await getPublishedProjects();
    if (!projects || projects.length === 0) {
      projects = seedProjects as any[];
    }
  } catch (err) {
    console.error("[AllProjectsPage] Error fetching projects:", err);
    projects = seedProjects as any[];
  }

  const featuredCount = projects.filter((p) => p.featured).length;

  return (
    <div className="relative min-h-screen pt-28 md:pt-36">
      {/* Header */}
      <section className="section-padding pb-8">
        <div className="container-narrow">
          <Reveal>
            <Link
              href="/#projects"
              className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Portfolio
            </Link>
          </Reveal>

          <Reveal delay={60}>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-7 items-center rounded-full bg-indigo-500/15 px-3 text-xs font-semibold uppercase tracking-widest text-indigo-400 border border-indigo-500/25">
                All Work
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Project{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Showcase
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Every project I&apos;ve shipped — from production web apps and ML systems to open-source tools. {projects.length} projects total.
            </p>
          </Reveal>

          {/* Stats row with small icons */}
          <Reveal delay={100}>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 backdrop-blur-sm">
                <FolderGit2 className="h-5 w-5 text-indigo-400" />
                <div>
                  <p className="text-2xl font-bold text-white leading-none">{projects.length}</p>
                  <p className="mt-1 text-xs text-slate-400 uppercase tracking-wider">Total Projects</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 backdrop-blur-sm">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400/20" />
                <div>
                  <p className="text-2xl font-bold text-white leading-none">{featuredCount}</p>
                  <p className="mt-1 text-xs text-slate-400 uppercase tracking-wider">Featured</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Unified All Projects List with Client Search & Category Filter */}
      <section className="section-padding pt-4 pb-24">
        <div className="container-narrow">
          <ProjectFilterList initialProjects={projects} />
        </div>
      </section>
    </div>
  );
}
