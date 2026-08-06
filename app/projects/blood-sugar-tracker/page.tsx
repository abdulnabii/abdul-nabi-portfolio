import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ProjectAppreciation } from "@/components/project-appreciation";
import { getProjectById, getPublishedProjects } from "@/lib/project-store";
import {
  ArrowLeft,
  Github,
  Brain,
  Database,
  Shield,
  Activity,
  FileText,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const project = await getProjectById("blood-sugar-tracker");
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} — FYP Case Study | Abdul Nabi`,
    description: project.description,
    keywords: [
      "Blood Sugar Tracker FYP",
      "Blood Sugar Tracker Abdul Nabi",
      "Glucose Prediction ML",
      "Python Flask Healthcare",
      "ElasticNet Regression",
      "Abdul Nabi",
      "aiwithab.site",
    ],
    openGraph: {
      title: `${project.title} — FYP Case Study | Abdul Nabi`,
      description: project.description,
      url: "https://www.aiwithab.site/projects/blood-sugar-tracker",
      images: [{ url: "/profile.jpg", alt: project.title }],
    },
  };
}

function RenderMarkdown({ text }: { text?: string }) {
  if (!text) return null;
  const parts = text.split("\n\n");
  return (
    <div className="space-y-4 text-slate-300 leading-relaxed text-sm md:text-base">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          const lines = part
            .split("\n")
            .filter((l) => !l.startsWith("```") && !l.endsWith("```"));
          return (
            <pre
              key={index}
              className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60 p-4 font-mono text-xs text-indigo-300"
            >
              <code>{lines.join("\n")}</code>
            </pre>
          );
        }
        if (part.startsWith("### ")) {
          return (
            <h3
              key={index}
              className="text-lg font-semibold text-white mt-6 mb-2 border-b border-white/5 pb-1"
            >
              {part.replace("### ", "")}
            </h3>
          );
        }
        if (part.includes("\n- ") || part.startsWith("- ")) {
          const items = part
            .split("\n")
            .map((item) => item.replace(/^- /, "").trim())
            .filter(Boolean);
          return (
            <ul key={index} className="list-disc pl-5 space-y-2">
              {items.map((item, i) => {
                const match = item.match(/^\*\*(.*?)\*\*(.*)/);
                if (match) {
                  return (
                    <li key={i}>
                      <strong className="text-white">{match[1]}</strong>
                      {match[2]}
                    </li>
                  );
                }
                return <li key={i}>{item}</li>;
              })}
            </ul>
          );
        }
        return <p key={index}>{part}</p>;
      })}
    </div>
  );
}

export default async function BloodSugarTrackerPage() {
  const project = await getProjectById("blood-sugar-tracker");

  if (!project || project.published === false) {
    notFound();
  }

  const all = await getPublishedProjects();
  const related = all.filter((p) => p.id !== project.id).slice(0, 2);

  return (
    <article className="section-padding pt-32 md:pt-36 bg-gradient-to-b from-[#0a0f1e] via-[#050814] to-[#0a0f1e]">
      <div className="container-narrow max-w-4xl">
        <LinkButton
          href="/#projects"
          variant="secondary"
          size="md"
          className="mb-8 font-medium text-slate-200 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white hover:-translate-x-1 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to work
        </LinkButton>

        {/* Header */}
        <header className="mb-12">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                <span>FYP Case Study</span>
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
            </div>

            {/* Spec Sheet */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 border-b border-white/5 pb-2">
                Project Spec Sheet
              </h3>
              <dl className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div>
                  <dt className="text-slate-500 font-medium">Type</dt>
                  <dd className="text-slate-300 mt-0.5">Final Year Project</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Year</dt>
                  <dd className="text-slate-300 font-mono mt-0.5">{project.year}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Backend</dt>
                  <dd className="text-slate-300 mt-0.5">Python / Flask</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">ML Model</dt>
                  <dd className="text-slate-300 mt-0.5">ElasticNet</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-slate-500 font-medium">Tech Stack</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </dd>
                </div>
              </dl>

              {project.githubUrl && (
                <LinkButton
                  href={project.githubUrl}
                  variant="secondary"
                  size="sm"
                  external
                  className="mt-2 w-full justify-center"
                >
                  <Github className="h-3.5 w-3.5" />
                  View on GitHub
                </LinkButton>
              )}
            </div>
          </div>
        </header>

        {/* ML Feature Highlights */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">
            Key Features
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Brain,
                title: "ML Glucose Prediction",
                desc: "ElasticNet regression model predicts blood glucose (mg/dL) from patient vitals with clinical precision.",
                color: "text-indigo-400",
                bg: "bg-indigo-900/20 border-indigo-500/20",
              },
              {
                icon: Users,
                title: "Patient Dashboard",
                desc: "Manage patient records, view prediction history, and track health trends over time.",
                color: "text-cyan-400",
                bg: "bg-cyan-900/20 border-cyan-500/20",
              },
              {
                icon: Activity,
                title: "Daily Health Logs",
                desc: "Staff log weight, macros (carbs, protein, fat), activity calories, and heart rate per patient per day.",
                color: "text-emerald-400",
                bg: "bg-emerald-900/20 border-emerald-500/20",
              },
              {
                icon: Shield,
                title: "Role-Based Auth",
                desc: "Flask-Login with admin and staff roles. All forms protected by CSRF tokens via Flask-WTF.",
                color: "text-violet-400",
                bg: "bg-violet-900/20 border-violet-500/20",
              },
              {
                icon: Database,
                title: "Smart Alert Flags",
                desc: "Patients with high-risk predicted glucose readings are auto-flagged in the dashboard for immediate attention.",
                color: "text-rose-400",
                bg: "bg-rose-900/20 border-rose-500/20",
              },
              {
                icon: FileText,
                title: "Report Export",
                desc: "Generate per-patient PDF clinical reports and CSV data exports for offline analysis.",
                color: "text-amber-400",
                bg: "bg-amber-900/20 border-amber-500/20",
              },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <GlassCard
                key={title}
                padding="md"
                className={`border ${bg} space-y-2`}
              >
                <Icon className={`h-5 w-5 ${color}`} />
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <p className="text-xs leading-relaxed text-slate-400">{desc}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Core Sections */}
        {[
          { label: "Problem", content: project.problem },
          { label: "My Role", content: project.role },
          { label: "Outcome", content: project.outcome },
        ].map(({ label, content }) => (
          <GlassCard key={label} padding="lg" className="mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 mb-3">
              {label}
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">{content}</p>
          </GlassCard>
        ))}

        {/* Architecture */}
        {project.architecture && (
          <GlassCard padding="lg" className="mb-6">
            <RenderMarkdown text={project.architecture} />
          </GlassCard>
        )}

        {/* Implementation */}
        {project.implementation && (
          <GlassCard padding="lg" className="mb-6">
            <RenderMarkdown text={project.implementation} />
          </GlassCard>
        )}

        {/* Results */}
        {project.results && (
          <GlassCard padding="lg" className="mb-6">
            <RenderMarkdown text={project.results} />
          </GlassCard>
        )}

        {/* Challenges */}
        {project.challenges && (
          <GlassCard padding="lg" className="mb-6">
            <RenderMarkdown text={project.challenges} />
          </GlassCard>
        )}

        {/* Contribution */}
        {project.contribution && (
          <GlassCard padding="lg" className="mb-10">
            <RenderMarkdown text={project.contribution} />
          </GlassCard>
        )}

        {/* Appreciation */}
        <div className="mb-12 flex justify-center">
          <ProjectAppreciation projectId={project.id} initialCount={project.appreciations ?? 0} />
        </div>

        {/* Related Projects */}
        {related.length > 0 && (
          <section>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Other Projects
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((rel) => (
                <Link key={rel.id} href={`/projects/${rel.id}`}>
                  <GlassCard
                    interactive
                    hover
                    padding="md"
                    className="h-full"
                  >
                    <p className="text-xs text-slate-500 mb-1">{rel.year}</p>
                    <h3 className="font-semibold text-white mb-1">{rel.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {rel.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {rel.tags.slice(0, 3).map((t) => (
                        <Badge key={t} className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
