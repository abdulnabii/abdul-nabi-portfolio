import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ProjectAppreciation } from "@/components/project-appreciation";
import { getProjectById } from "@/lib/project-store";
import { isPublicUrl } from "@/lib/links";
import { ArrowLeft, ArrowUpRight, Github, Heart } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import seedProjects from "@/data/projects.json";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let project = await getProjectById(params.id);
  if (!project) {
    project = (seedProjects as any[]).find((p) => p.id === params.id || p.id === decodeURIComponent(params.id));
  }
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} | Case Study — Abdul Nabi`,
    description: project.description,
    openGraph: {
      title: `${project.title} | Case Study — Abdul Nabi`,
      description: project.description,
      url: `https://aiwithab.site/projects/${project.id}`,
    },
  };
}

export default async function DynamicProjectPage({ params }: Props) {
  let project = await getProjectById(params.id);
  if (!project) {
    project = (seedProjects as any[]).find((p) => p.id === params.id || p.id === decodeURIComponent(params.id));
  }
  if (!project) notFound();

  const live = isPublicUrl(project.liveUrl);
  const code = isPublicUrl(project.githubUrl);
  const tags: string[] = Array.isArray(project.tags) ? project.tags : [];

  return (
    <div className="relative min-h-screen pt-28 md:pt-36">
      <div className="section-padding pb-20">
        <div className="container-narrow">
          {/* Back link */}
          <Link
            href="/projects"
            className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Showcase
          </Link>

          {/* Header */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{project.year || "2024"}</Badge>
              <Badge variant="muted">{project.statusLabel || "Completed"}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {project.title}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {project.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {live && project.liveUrl && (
                <LinkButton href={project.liveUrl} variant="primary" size="md" external>
                  Live demo <ArrowUpRight className="h-4 w-4" />
                </LinkButton>
              )}
              {code && project.githubUrl && (
                <LinkButton href={project.githubUrl} variant="secondary" size="md" external>
                  <Github className="h-4 w-4" /> Source code
                </LinkButton>
              )}
              <ProjectAppreciation projectId={project.id} initialCount={project.appreciations ?? 0} />
            </div>
          </div>

          {/* Preview Image */}
          {project.image && (
            <div className="relative mb-12 min-h-[300px] sm:min-h-[420px] overflow-hidden rounded-2xl border border-white/10 bg-[#060a17] p-4">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-contain object-center p-4"
                sizes="100vw"
              />
            </div>
          )}

          {/* Details Card */}
          <GlassCard className="p-6 sm:p-8 space-y-6">
            <dl className="grid gap-6 sm:grid-cols-3">
              {project.problem && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-widest text-slate-500">Problem</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate-200">{project.problem}</dd>
                </div>
              )}
              {project.role && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-widest text-slate-500">Role</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate-200">{project.role}</dd>
                </div>
              )}
              {project.outcome && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-widest text-slate-500">Outcome</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate-200">{project.outcome}</dd>
                </div>
              )}
            </dl>

            {tags.length > 0 && (
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-2">Technologies Used</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          {/* Architecture / Deep Dive if available */}
          {project.architecture && (
            <div className="mt-8">
              <GlassCard className="p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-white mb-3">System Architecture</h2>
                <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">{project.architecture}</p>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
