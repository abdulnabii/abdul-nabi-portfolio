import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ProjectAppreciation } from "@/components/project-appreciation";
import { AegisAppSecDemo } from "@/components/projects/aegis-appsec-demo";
import { getProjectById, getPublishedProjects } from "@/lib/project-store";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Key,
  Database,
  Sliders,
  FileCode,
  Terminal,
  Activity,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import seedProjects from "@/data/projects.json";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  let project = await getProjectById("aegis-appsec");
  if (!project) {
    project = (seedProjects as any[]).find((p) => p.id === "aegis-appsec");
  }
  if (!project) return { title: "Project not found" };

  return {
    title: `${project.title} — Live Full-Stack AppSec Studio | Abdul Nabi`,
    description: project.description,
    keywords: [
      "Aegis AppSec Sentinel",
      "Application Security",
      "OWASP Top 10",
      "Next.js AppSec",
      "Supabase RLS Policy Validator",
      "JWT Security Auditor",
      "Abdul Nabi",
      "aiwithab.site",
    ],
    openGraph: {
      title: `${project.title} — Live Full-Stack AppSec Studio | Abdul Nabi`,
      description: project.description,
      url: "https://www.aiwithab.site/projects/aegis-appsec",
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
        return <p key={index}>{part}</p>;
      })}
    </div>
  );
}

export default async function AegisAppSecPage() {
  const published = await getPublishedProjects();
  let project = published.find((p) => p.id === "aegis-appsec");
  if (!project) {
    project = (seedProjects as any[]).find((p) => p.id === "aegis-appsec");
  }

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* ── Navigation Breadcrumb ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Featured Projects
        </Link>

        <div className="flex items-center gap-2">
          <ProjectAppreciation projectId={project.id} initialCount={project.appreciations || 24} />
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
            >
              <Github className="h-4 w-4" />
              Source Code
            </a>
          )}
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent" className="text-xs">
            {project.year || "2025"}
          </Badge>
          <Badge variant="muted" className="text-xs">
            {project.statusLabel || "Live Production Application"}
          </Badge>
          <Badge variant="accent" className="text-xs bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
            OWASP Top 10 Aligned
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {project.title}
        </h1>

        <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Live Interactive Full-Stack Application Sandbox ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            Live Full-Stack Interactive Sandbox
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Next.js App Router · API Routes Active
          </span>
        </div>

        <GlassCard padding="lg" elevated className="border-emerald-500/30 bg-[#070d1d]/90 shadow-2xl backdrop-blur-2xl">
          <AegisAppSecDemo />
        </GlassCard>
      </div>

      {/* ── Case Study Breakdown ── */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Problem, Role, Outcome */}
        <div className="space-y-6 lg:col-span-1">
          <GlassCard padding="md" className="space-y-4 border-white/10 bg-slate-900/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              The Engineering Problem
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {project.problem}
            </p>
          </GlassCard>

          <GlassCard padding="md" className="space-y-4 border-white/10 bg-slate-900/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              My Engineering Role
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {project.role}
            </p>
          </GlassCard>

          <GlassCard padding="md" className="space-y-4 border-white/10 bg-slate-900/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Key Outcome
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {project.outcome}
            </p>
          </GlassCard>
        </div>

        {/* Right Column: Deep Architectural Specs */}
        <div className="space-y-8 lg:col-span-2">
          {project.architecture && (
            <GlassCard padding="lg" className="space-y-4 border-white/10 bg-slate-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                System Architecture &amp; Threat Model
              </h2>
              <RenderMarkdown text={project.architecture} />
            </GlassCard>
          )}

          {project.implementation && (
            <GlassCard padding="lg" className="space-y-4 border-white/10 bg-slate-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileCode className="h-5 w-5 text-indigo-400" />
                Technical Implementation &amp; OWASP Defenses
              </h2>
              <RenderMarkdown text={project.implementation} />
            </GlassCard>
          )}

          {project.results && (
            <GlassCard padding="lg" className="space-y-4 border-white/10 bg-slate-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" />
                Security Benchmark Results
              </h2>
              <RenderMarkdown text={project.results} />
            </GlassCard>
          )}

          {project.challenges && (
            <GlassCard padding="lg" className="space-y-4 border-white/10 bg-slate-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-400" />
                Key Security Decisions &amp; Trade-offs
              </h2>
              <RenderMarkdown text={project.challenges} />
            </GlassCard>
          )}
        </div>
      </div>

      {/* ── Footer CTA ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-6 md:p-8 backdrop-blur-xl gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Interested in AppSec audits or full-stack engineering?</h3>
          <p className="text-xs text-slate-300 mt-0.5">Let&apos;s build fast, secure, and resilient applications together.</p>
        </div>
        <LinkButton href="/#contact" variant="primary">
          Start a Conversation
        </LinkButton>
      </div>
    </div>
  );
}
