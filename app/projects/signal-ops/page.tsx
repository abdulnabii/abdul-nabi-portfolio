import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ProjectAppreciation } from "@/components/project-appreciation";
import { OpsDemo } from "@/components/projects/ops-demo";
import { getProjectById, getPublishedProjects } from "@/lib/project-store";
import { ArrowLeft, ExternalLink, Github, Lock, AlertCircle, Sparkles, Code, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const project = await getProjectById("signal-ops");
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

function RenderMarkdown({ text }: { text?: string }) {
  if (!text) return null;
  const parts = text.split("\n\n");
  return (
    <div className="space-y-4 text-slate-300 leading-relaxed text-sm md:text-base">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          const lines = part
            .split("\n")
            .map((l) => l.trim())
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

export default async function SignalOpsPage() {
  const project = await getProjectById("signal-ops");

  if (!project || project.published === false) {
    notFound();
  }

  const all = await getPublishedProjects();
  const related = all.filter((p) => p.id !== project.id).slice(0, 2);

  const isPrivate = project.status === "in-progress" || !project.liveUrl;

  return (
    <article className="section-padding pt-32 md:pt-36 bg-gradient-to-b from-[#0a0f1e] via-[#050814] to-[#0a0f1e]">
      <div className="container-narrow max-w-4xl">
        <LinkButton
          href="/#projects"
          variant="ghost"
          size="sm"
          className="mb-8 -ml-2 hover:translate-x-[-4px] transition-transform duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to work
        </LinkButton>

        {/* Top Header Section */}
        <header className="mb-12">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
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
            </div>

            {/* Quick Spec Sheet */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 border-b border-white/5 pb-2">
                Project Spec Sheet
              </h3>
              <dl className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div>
                  <dt className="text-slate-500 font-medium">Timeline</dt>
                  <dd className="text-slate-300 font-mono mt-0.5">{project.year}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-medium">Platform</dt>
                  <dd className="text-slate-300 mt-0.5">{project.tags[0]}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-slate-500 font-medium">Primary Technologies</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="accent" className="!px-2 !py-0.5 text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          {project.image && (
            <div className="relative mt-10 h-64 overflow-hidden rounded-3xl border border-white/10 sm:h-96 bg-[#050814] shadow-glass-lg group">
              <Image
                src={project.image}
                alt={`${project.title} screenshot`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/80 via-transparent to-transparent" />
            </div>
          )}
        </header>

        {/* Detailed Sections Grid */}
        <div className="grid gap-8 lg:grid-cols-[1.95fr_1fr] items-start">
          
          {/* Main Case Study Body */}
          <div className="space-y-8">
            <GlassCard padding="lg" elevated className="space-y-8">
              
              {/* Problem Section */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <AlertCircle className="h-4.5 w-4.5" />
                  <h2 className="text-xs font-semibold uppercase tracking-[0.16em]">
                    The Challenge & Problem
                  </h2>
                </div>
                <p className="text-base leading-relaxed text-slate-300">
                  {project.problem}
                </p>
              </section>

              {/* Execution / Role Section */}
              <section className="space-y-3 border-t border-white/5 pt-6">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Code className="h-4.5 w-4.5" />
                  <h2 className="text-xs font-semibold uppercase tracking-[0.16em]">
                    Execution & My Role
                  </h2>
                </div>
                <p className="text-base leading-relaxed text-slate-300">
                  {project.role}
                </p>
              </section>

              {/* Outcome Section */}
              <section className="space-y-3 border-t border-white/5 pt-6">
                <div className="flex items-center gap-2 text-indigo-400">
                  <ShieldCheck className="h-4.5 w-4.5" />
                  <h2 className="text-xs font-semibold uppercase tracking-[0.16em]">
                    Outcome & Engineering Impact
                  </h2>
                </div>
                <p className="text-base leading-relaxed text-slate-300">
                  {project.outcome}
                </p>
              </section>
            </GlassCard>

            {/* Interactive Sandbox Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Interactive Live Sandbox
                </h2>
              </div>
              <OpsDemo />
            </section>

            {/* Core Architecture Section */}
            {project.architecture && (
              <section className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  System Architecture
                </h2>
                <GlassCard padding="lg" className="border-t border-indigo-500/10">
                  <div className="w-full rounded-2xl border border-white/5 bg-slate-950/40 p-5 mb-6">
                    <div className="mb-4 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>DB STATE-DURATION COMPRESSION MODEL</span>
                      <span className="text-cyan-400">STATUS: AUDIT LOG PIPELINE ON-LINE</span>
                    </div>
                    <svg viewBox="0 0 600 160" className="w-full text-slate-400">
                      <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#818cf8" />
                        </marker>
                        <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                        </marker>
                      </defs>
                      <rect x="10" y="50" width="110" height="60" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      <text x="65" y="80" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">Health Monitors</text>
                      <text x="65" y="95" textAnchor="middle" fill="#64748b" fontSize="9">Polls State (10s)</text>

                      <line x1="120" y1="80" x2="175" y2="80" stroke="#818cf8" strokeWidth="1.5" markerEnd="url(#arrow)" strokeDasharray="4 2" />

                      <rect x="185" y="50" width="110" height="60" rx="8" fill="rgba(129,140,248,0.05)" stroke="rgba(129,140,248,0.2)" strokeWidth="1" />
                      <text x="240" y="75" textAnchor="middle" fill="#818cf8" fontSize="11" fontWeight="600">Compactor API</text>
                      <text x="240" y="90" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="600">Check State Shifts</text>
                      <text x="240" y="101" textAnchor="middle" fill="#64748b" fontSize="8">Filters Duplicates</text>

                      <line x1="295" y1="80" x2="350" y2="80" stroke="#818cf8" strokeWidth="1.5" markerEnd="url(#arrow)" />

                      <rect x="360" y="50" width="110" height="60" rx="8" fill="rgba(34,211,238,0.05)" stroke="rgba(34,211,238,0.2)" strokeWidth="1" />
                      <text x="415" y="80" textAnchor="middle" fill="#22d3ee" fontSize="11" fontWeight="600">PostgreSQL Log</text>
                      <text x="415" y="95" textAnchor="middle" fill="#64748b" fontSize="9">Writes Transition Only</text>

                      <line x1="470" y1="80" x2="515" y2="80" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow-green)" />

                      <rect x="525" y="50" width="65" height="60" rx="6" fill="rgba(16,185,129,0.05)" stroke="rgba(16,185,129,0.2)" strokeWidth="1" />
                      <text x="557" y="75" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="600">On-Call UI</text>
                      <text x="557" y="90" textAnchor="middle" fill="#64748b" fontSize="8">Alert Console</text>
                    </svg>
                  </div>
                  <RenderMarkdown text={project.architecture} />
                </GlassCard>
              </section>
            )}

            {/* Technical Implementation details */}
            {project.implementation && (
              <section className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Implementation Detail
                </h2>
                <GlassCard padding="lg">
                  <RenderMarkdown text={project.implementation} />
                </GlassCard>
              </section>
            )}

            {/* Results metrics */}
            {project.results && (
              <section className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Technical Validation & Metrics
                </h2>
                <GlassCard padding="lg">
                  <RenderMarkdown text={project.results} />
                </GlassCard>
              </section>
            )}

            {/* Contribution details */}
            {project.contribution && (
              <section className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  My Exact Contribution
                </h2>
                <GlassCard padding="lg">
                  <RenderMarkdown text={project.contribution} />
                </GlassCard>
              </section>
            )}

            {/* Challenges & Lessons Learned */}
            {project.challenges && (
              <section className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Challenges & Lessons Learned
                </h2>
                <GlassCard padding="lg">
                  <RenderMarkdown text={project.challenges} />
                </GlassCard>
              </section>
            )}
          </div>

          {/* Sidebar Widgets & Links */}
          <div className="space-y-6 lg:sticky lg:top-24">
            
            {/* Live Links Card */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Project Assets
              </h3>
              <div className="flex flex-col gap-3">
                {project.liveUrl ? (
                  <LinkButton
                    href={project.liveUrl}
                    variant="primary"
                    size="md"
                    external
                    className="w-full justify-between"
                  >
                    <span>Visit Live Site</span>
                    <ExternalLink className="h-4 w-4" />
                  </LinkButton>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-700/30 bg-slate-800/10 px-4 py-3 text-xs text-slate-400">
                    <Lock className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>Live demo is internal / restricted</span>
                  </div>
                )}

                {project.githubUrl ? (
                  <LinkButton
                    href={project.githubUrl}
                    variant="secondary"
                    size="md"
                    external
                    className="w-full justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Github className="h-4.5 w-4.5" />
                      Browse Source
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-55" />
                  </LinkButton>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-700/30 bg-slate-800/10 px-4 py-3 text-xs text-slate-400">
                    <Lock className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>Private enterprise repository</span>
                  </div>
                )}
              </div>
            </div>

            {/* Appreciation widget */}
            <ProjectAppreciation
              projectId={project.id}
              initialCount={project.appreciations ?? 0}
            />
          </div>
        </div>

        {/* Polished Related Projects Section */}
        {related.length > 0 && (
          <aside className="mt-20 border-t border-white/5 pt-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Other Selected Builds
              </h2>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              {related.map((item) => (
                <a
                  key={item.id}
                  href={`/projects/${item.id}`}
                  className="group block relative"
                >
                  <GlassCard
                    hover
                    className="h-full overflow-hidden !p-0"
                  >
                    {item.image && (
                      <div className="relative h-36 w-full bg-[#050814]">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 100vw, 350px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/40 to-transparent" />
                      </div>
                    )}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{item.year}</span>
                        <Badge variant="muted" className="text-[10px] !px-2 !py-0">
                          {item.statusLabel}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg text-white transition-colors group-hover:text-accent-soft">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="accent" className="text-[9px] !px-1.5 !py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="pt-1.5 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-white transition-colors border-t border-white/5">
                        <span>Read Case Study</span>
                        <span>→</span>
                      </div>
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
