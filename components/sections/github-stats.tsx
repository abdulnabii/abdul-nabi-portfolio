"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Github, Star, GitFork, Flame, Code2, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";

interface GitHubStatsData {
  login: string;
  name: string;
  bio: string;
  publicReposCount: number;
  followers: number;
  streakDays: number;
  languages: { name: string; percentage: number }[];
  recentRepos: {
    name: string;
    description: string;
    url: string;
    language: string;
    stars: number;
    forks: number;
    updatedAt: string;
  }[];
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-indigo-500",
  JavaScript: "bg-amber-400",
  Python: "bg-emerald-500",
  SQL: "bg-cyan-400",
  HTML: "bg-orange-500",
  CSS: "bg-pink-500",
};

export function GitHubStats() {
  const [data, setData] = useState<GitHubStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/github-stats")
      .then((r) => r.json())
      .then((d) => {
        if (d && d.login) {
          setData(d);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="github" className="section-padding relative overflow-hidden" aria-labelledby="github-heading">
      <div className="container-narrow space-y-10">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Open Source & Activity"
              title="GitHub Velocity & Code Activity"
              subtitle="Live repository metrics, language distribution, and public engineering commits."
              className="mb-0"
            />
            <a
              href="https://github.com/abdulnabii"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:border-indigo-400 hover:bg-white/10"
            >
              <Github className="h-4 w-4" />
              <span>Follow on GitHub</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>
          </div>
        </Reveal>

        {/* Highlight Metrics Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Reveal delay={0}>
            <GlassCard padding="md" className="border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Public Repositories</span>
                <Code2 className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {data ? data.publicReposCount : "10+"}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Open source systems & tools</p>
            </GlassCard>
          </Reveal>

          <Reveal delay={60}>
            <GlassCard padding="md" className="border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Daily Commit Streak</span>
                <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
              </div>
              <div className="text-3xl font-extrabold text-amber-400 flex items-center gap-2">
                <span>{data ? data.streakDays : "40+"}</span>
                <span className="text-xs font-semibold text-amber-300/80 uppercase">Days</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Active shipping discipline</p>
            </GlassCard>
          </Reveal>

          <Reveal delay={120}>
            <GlassCard padding="md" className="border-white/10 sm:col-span-2">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Language Composition</span>
                <Sparkles className="h-4 w-4 text-emerald-400" />
              </div>
              {/* Stacked Progress Bar */}
              <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden flex my-2">
                {(data?.languages || [
                  { name: "TypeScript", percentage: 65 },
                  { name: "Python", percentage: 20 },
                  { name: "JavaScript", percentage: 10 },
                  { name: "SQL", percentage: 5 },
                ]).map((lang) => (
                  <div
                    key={lang.name}
                    className={`h-full ${LANG_COLORS[lang.name] || "bg-indigo-400"}`}
                    style={{ width: `${lang.percentage}%` }}
                    title={`${lang.name}: ${lang.percentage}%`}
                  />
                ))}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                {(data?.languages || [
                  { name: "TypeScript", percentage: 65 },
                  { name: "Python", percentage: 20 },
                  { name: "JavaScript", percentage: 10 },
                  { name: "SQL", percentage: 5 },
                ]).map((lang) => (
                  <span key={lang.name} className="inline-flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${LANG_COLORS[lang.name] || "bg-indigo-400"}`} />
                    <span className="font-medium text-white">{lang.name}</span>
                    <span className="text-slate-500 font-mono">{lang.percentage}%</span>
                  </span>
                ))}
              </div>
            </GlassCard>
          </Reveal>
        </div>

        {/* Featured Open Source Repositories */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Public Repositories
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(data?.recentRepos || [
              {
                name: "abdul-nabi-portfolio",
                description: "Full-stack production portfolio with auto-blog, analytics & AppSec guards.",
                url: "https://github.com/abdulnabii/abdul-nabi-portfolio",
                language: "TypeScript",
                stars: 4,
                forks: 1,
                updatedAt: new Date().toISOString(),
              },
              {
                name: "pawlink",
                description: "Veterinary telehealth and clinical booking platform with Next.js & Supabase.",
                url: "https://github.com/abdulnabii/pawlink",
                language: "TypeScript",
                stars: 2,
                forks: 0,
                updatedAt: new Date().toISOString(),
              },
              {
                name: "priv",
                description: "Data privacy policy analyzer and compliance assessment toolkit.",
                url: "https://github.com/abdulnabii/priv",
                language: "Python",
                stars: 1,
                forks: 0,
                updatedAt: new Date().toISOString(),
              },
            ]).map((repo, i) => (
              <Reveal key={repo.name} delay={i * 60}>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full"
                >
                  <GlassCard
                    interactive
                    hover
                    padding="md"
                    className="h-full flex flex-col justify-between border-white/10 hover:border-indigo-500/40"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Github className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                          <h4 className="text-sm font-semibold text-white group-hover:text-accent-soft transition-colors truncate">
                            {repo.name}
                          </h4>
                        </div>
                        <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {repo.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-300">
                        <span className={`h-2 w-2 rounded-full ${LANG_COLORS[repo.language] || "bg-indigo-400"}`} />
                        {repo.language}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 hover:text-amber-300 transition-colors">
                          <Star className="h-3 w-3" />
                          {repo.stars}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <GitFork className="h-3 w-3" />
                          {repo.forks}
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
