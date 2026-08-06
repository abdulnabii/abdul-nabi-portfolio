import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { getAllProjects } from "@/lib/project-store";
import { isPublicUrl } from "@/lib/links";
import { ArrowLeft, ArrowUpRight, FolderGit2, Github, Heart, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

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
  const projects = await getAllProjects();
  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

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

          {/* Stats row */}
          <Reveal delay={100}>
            <div className="mt-8 flex flex-wrap gap-4">
              {[
                { label: "Total Projects", value: projects.length },
                { label: "Featured", value: featured.length },
                { label: "Total Likes", value: projects.reduce((s, p) => s + (p.appreciations ?? 0), 0) },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 backdrop-blur-sm"
                >
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured Projects */}
      {featured.length > 0 && (
        <section className="section-padding pt-4">
          <div className="container-narrow">
            <Reveal>
              <div className="mb-6 flex items-center gap-3">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <h2 className="text-lg font-semibold text-white">Featured Case Studies</h2>
                <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                  {featured.length}
                </span>
              </div>
            </Reveal>

            <div className="space-y-6">
              {featured.map((project, index) => {
                const live = isPublicUrl(project.liveUrl);
                const code = isPublicUrl(project.githubUrl);
                return (
                  <Reveal key={project.id} delay={index * 60}>
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
                              <Badge variant="accent">{project.year}</Badge>
                              <Badge variant="muted">{project.statusLabel}</Badge>
                              {(project.appreciations ?? 0) > 0 && (
                                <Badge variant="muted" className="gap-1 text-indigo-300">
                                  <Heart className="h-3 w-3 fill-indigo-400/40" />
                                  {project.appreciations}
                                </Badge>
                              )}
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
                          <div className="flex flex-wrap gap-2 pt-1">
                            {project.tags.slice(0, 5).map((tag) => (
                              <Badge key={tag}>{tag}</Badge>
                            ))}
                          </div>
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
      )}

      {/* Other Projects Grid */}
      {others.length > 0 && (
        <section className="section-padding pt-4 pb-20">
          <div className="container-narrow">
            <Reveal>
              <div className="mb-6 flex items-center gap-3">
                <FolderGit2 className="h-4 w-4 text-slate-400" />
                <h2 className="text-lg font-semibold text-white">More Projects</h2>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-slate-400">
                  {others.length}
                </span>
              </div>
            </Reveal>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((project, index) => {
                const live = isPublicUrl(project.liveUrl);
                const code = isPublicUrl(project.githubUrl);
                return (
                  <Reveal key={project.id} delay={index * 50}>
                    <GlassCard interactive hover padding="none" className="group flex flex-col overflow-hidden h-full">
                      {/* Thumbnail */}
                      <Link href={`/projects/${project.id}`} className="relative block h-44 overflow-hidden bg-[#060a17] flex-shrink-0">
                        {project.image ? (
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-contain object-top p-2 transition-transform duration-500 group-hover:scale-[1.04]"
                            sizes="(max-width: 640px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-violet-900/20" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent" />
                      </Link>

                      {/* Content */}
                      <div className="flex flex-1 flex-col gap-3 p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="accent">{project.year}</Badge>
                          <Badge variant="muted">{project.statusLabel}</Badge>
                        </div>
                        <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-xs leading-relaxed text-slate-400 line-clamp-3">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-white/5">
                          {project.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} className="text-[10px]">{tag}</Badge>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="text-[10px] text-slate-500 self-center">+{project.tags.length - 3}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          {live && project.liveUrl && (
                            <LinkButton href={project.liveUrl} variant="primary" size="sm" external className="flex-1 justify-center text-xs">
                              Demo <ArrowUpRight className="h-3 w-3" />
                            </LinkButton>
                          )}
                          {code && project.githubUrl && (
                            <LinkButton href={project.githubUrl} variant="secondary" size="sm" external className="flex-1 justify-center text-xs">
                              <Github className="h-3 w-3" /> Code
                            </LinkButton>
                          )}
                          <LinkButton href={`/projects/${project.id}`} variant="ghost" size="sm" className="text-indigo-400 text-xs">
                            Details →
                          </LinkButton>
                        </div>
                      </div>
                    </GlassCard>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
