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

      {/* Unified All Projects List */}
      <section className="section-padding pt-4 pb-24">
        <div className="container-narrow">
          <div className="space-y-6">
            {projects.map((project, index) => {
              const live = isPublicUrl(project.liveUrl);
              const code = isPublicUrl(project.githubUrl);
              const tags: string[] = Array.isArray(project.tags) ? project.tags : [];
              return (
                <Reveal key={project.id} delay={index * 50}>
                  <GlassCard interactive tilt hover padding="none" className="group overflow-hidden">
                    <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                      <Link
                        href={`/projects/${project.id}`}
                        className="relative block min-h-[220px] overflow-hidden border-b border-white/5 lg:min-h-[300px] lg:border-b-0 lg:border-r cursor-grow group/img bg-[#060a17] p-2 sm:p-3"
                      >
                        {project.image ? (
                          <Image
                            src={project.image}
                            alt={`${project.title} preview`}
                            fill
                            className="object-contain object-top p-2 transition-transform duration-700 group-hover/img:scale-[1.02]"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-accent-cyan/10" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/40 to-transparent pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-0 p-5">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            {project.featured && (
                              <Badge variant="accent" className="bg-amber-500/20 text-amber-300 border-amber-500/30 gap-1">
                                <Star className="h-3 w-3 fill-amber-300" /> Featured
                              </Badge>
                            )}
                            <Badge variant="accent">{project.year || "2024"}</Badge>
                            <Badge variant="muted">{project.statusLabel || "Completed"}</Badge>
                          </div>
                          <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl group-hover/img:text-accent-soft transition-colors">
                            {project.title}
                          </h3>
                        </div>
                      </Link>

                      <div className="flex flex-col justify-between gap-5 p-5 sm:p-7">
                        <p className="text-sm leading-relaxed text-slate-300">{project.description}</p>
                        <dl className="space-y-3">
                          {project.problem && (
                            <div>
                              <dt className="text-xs font-medium uppercase tracking-widest text-slate-500">Problem</dt>
                              <dd className="mt-1 text-sm leading-relaxed text-slate-300">{project.problem}</dd>
                            </div>
                          )}
                          {project.outcome && (
                            <div>
                              <dt className="text-xs font-medium uppercase tracking-widest text-slate-500">Outcome</dt>
                              <dd className="mt-1 text-sm leading-relaxed text-slate-300">{project.outcome}</dd>
                            </div>
                          )}
                        </dl>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {tags.slice(0, 5).map((tag) => (
                              <Badge key={tag}>{tag}</Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/5">
                          {live && project.liveUrl && (
                            <LinkButton href={project.liveUrl} variant="primary" size="sm" external className="cursor-grow">
                              Live demo <ArrowUpRight className="h-3.5 w-3.5" />
                            </LinkButton>
                          )}
                          {code && project.githubUrl && (
                            <LinkButton href={project.githubUrl} variant="secondary" size="sm" external className="cursor-grow">
                              <Github className="h-3.5 w-3.5" /> Source
                            </LinkButton>
                          )}
                          <LinkButton href={`/projects/${project.id}`} variant="ghost" size="sm" className="text-indigo-400 hover:text-white cursor-grow gap-1 ml-auto">
                            Case study →
                          </LinkButton>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
