import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteContent } from "@/data/content";
import { getFeaturedProjects, getAllProjects } from "@/lib/project-store";
import { isPublicUrl } from "@/lib/links";
import { ArrowRight, ArrowUpRight, Github, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export async function Projects() {
  const [featured, all] = await Promise.all([
    getFeaturedProjects(),
    getAllProjects(),
  ]);
  const { projectsIntro } = siteContent;
  const totalCount = all.length;

  return (
    <section
      id="projects"
      className="section-padding relative"
      aria-labelledby="projects-heading"
    >
      <div className="container-narrow">
        <Reveal>
          <div className="mb-12 flex flex-col gap-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Portfolio"
              title={projectsIntro.title}
              subtitle={projectsIntro.subtitle}
              className="mb-0"
            />
            <LinkButton href="/projects" variant="secondary" size="sm">
              View all projects
              <ArrowRight className="h-3.5 w-3.5" />
            </LinkButton>
          </div>
        </Reveal>

        <div className="space-y-6">
          {featured.map((project, index) => {
            const live = isPublicUrl(project.liveUrl);
            const code = isPublicUrl(project.githubUrl);

            return (
              <Reveal key={project.id} delay={index * 70}>
                <GlassCard
                  interactive
                  tilt
                  hover
                  padding="none"
                  className="group overflow-hidden"
                >
                  <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <Link
                      href={`/projects/${project.id}`}
                      className="relative block min-h-[260px] overflow-hidden border-b border-white/5 lg:min-h-[340px] lg:border-b-0 lg:border-r cursor-grow group/img bg-[#060a17] p-2 sm:p-3"
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
                      <div className="absolute inset-x-0 bottom-0 p-6">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Badge variant="accent">{project.year}</Badge>
                          <Badge variant="muted">{project.statusLabel}</Badge>
                          {project.appreciations !== undefined && project.appreciations > 0 && (
                            <Badge variant="muted" className="gap-1 text-indigo-300">
                              <Heart className="h-3 w-3 fill-indigo-400/40" />
                              {project.appreciations}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl group-hover/img:text-accent-soft transition-colors">
                          {project.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-300">
                          {project.description}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <Badge key={tag}>{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </Link>

                    <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
                      <dl className="space-y-5">
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                            Problem
                          </dt>
                          <dd className="mt-1.5 text-sm leading-relaxed text-slate-300">
                            {project.problem}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                            Role
                          </dt>
                          <dd className="mt-1.5 text-sm leading-relaxed text-slate-300">
                            {project.role}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                            Outcome
                          </dt>
                          <dd className="mt-1.5 text-sm leading-relaxed text-slate-300">
                            {project.outcome}
                          </dd>
                        </div>
                      </dl>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                        <div className="flex flex-wrap gap-3">
                          {live && project.liveUrl && (
                            <LinkButton
                              href={project.liveUrl}
                              variant="primary"
                              size="sm"
                              external
                              className="cursor-grow"
                            >
                              Live demo
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </LinkButton>
                          )}
                          {code && project.githubUrl && (
                            <LinkButton
                              href={project.githubUrl}
                              variant="secondary"
                              size="sm"
                              external
                              className="cursor-grow"
                            >
                              <Github className="h-3.5 w-3.5" />
                              Source
                            </LinkButton>
                          )}
                        </div>
                        <LinkButton
                          href={`/projects/${project.id}`}
                          variant="ghost"
                          size="sm"
                          className="text-indigo-400 hover:text-white cursor-grow gap-1"
                        >
                          <span>View case study</span>
                          <span>→</span>
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
  );
}
