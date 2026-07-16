import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ProjectAppreciation } from "@/components/project-appreciation";
import { getProjectById, getPublishedProjects } from "@/lib/project-store";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface ProjectPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const project = await getProjectById(params.slug);
  if (!project) {
    return { title: "Project not found" };
  }

  return {
    title: `${project.title} — Case Study`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.image ? [project.image] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProjectById(params.slug);

  if (!project || project.published === false) {
    notFound();
  }

  const all = await getPublishedProjects();
  const related = all.filter((p) => p.id !== project.id).slice(0, 2);

  return (
    <article className="section-padding pt-32 md:pt-36">
      <div className="container-narrow max-w-3xl">
        <LinkButton
          href="/#projects"
          variant="ghost"
          size="sm"
          className="mb-8 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to work
        </LinkButton>

        <header className="mb-10">
          {project.image && (
            <div className="relative mb-8 h-56 overflow-hidden rounded-3xl border border-white/10 sm:h-72 bg-[#050814]">
              <Image
                src={project.image}
                alt={`${project.title} cover`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/70 to-transparent" />
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>Case Study</span>
            <span aria-hidden>·</span>
            <span>{project.year}</span>
            <span aria-hidden>·</span>
            <Badge variant="muted">{project.statusLabel}</Badge>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl md:leading-tight">
            {project.title}
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-slate-400">
            {project.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="accent">
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        <div className="space-y-6">
          <GlassCard padding="lg" elevated className="space-y-8">
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-400">
                The Problem
              </h2>
              <p className="text-base leading-relaxed text-slate-300">
                {project.problem}
              </p>
            </section>

            <section className="space-y-3 border-t border-white/5 pt-6">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-400">
                Your Role & Execution
              </h2>
              <p className="text-base leading-relaxed text-slate-300">
                {project.role}
              </p>
            </section>

            <section className="space-y-3 border-t border-white/5 pt-6">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-400">
                Outcome & Impact
              </h2>
              <p className="text-base leading-relaxed text-slate-300">
                {project.outcome}
              </p>
            </section>
          </GlassCard>

          <div className="flex flex-wrap items-center justify-center gap-4 py-4">
            {project.liveUrl && (
              <LinkButton href={project.liveUrl} variant="primary" size="lg" external className="cursor-grow">
                <span>Visit Live Site</span>
                <ExternalLink className="h-4 w-4" />
              </LinkButton>
            )}
            {project.githubUrl && (
              <LinkButton href={project.githubUrl} variant="secondary" size="lg" external className="cursor-grow">
                <Github className="h-4.5 w-4.5" />
                <span>Browse Source</span>
              </LinkButton>
            )}
          </div>

          <ProjectAppreciation
            projectId={project.id}
            initialCount={project.appreciations ?? 0}
          />
        </div>

        {related.length > 0 && (
          <aside className="mt-16">
            <h2 className="mb-6 text-lg font-semibold text-white">
              Other builds
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((item) => (
                <a
                  key={item.id}
                  href={`/projects/${item.id}`}
                  className="group block"
                >
                  <GlassCard hover className="h-full overflow-hidden !p-0">
                    {item.image && (
                      <div className="relative h-28 w-full bg-[#050814]">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="300px"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-xs text-slate-500">
                        {item.year} · {item.statusLabel}
                      </p>
                      <h3 className="mt-2 font-medium text-white transition-colors group-hover:text-accent-soft">
                        {item.title}
                      </h3>
                    </div>
                  </GlassCard>
                </a>
              ))}
            </div>
          </aside>
        )}
      </div>
    </article>
  );
}
