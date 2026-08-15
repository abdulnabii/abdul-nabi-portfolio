"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { AchievementItem } from "@/lib/settings-store";
import { GitHubHeatmap } from "@/components/ui/github-heatmap";

const COLOR_MAP: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  indigo: { bg: "from-indigo-500/15 to-indigo-900/5", border: "border-indigo-500/30", glow: "hover:shadow-[0_0_25px_rgba(99,102,241,0.3)]", text: "text-indigo-300" },
  violet: { bg: "from-violet-500/15 to-violet-900/5", border: "border-violet-500/30", glow: "hover:shadow-[0_0_25px_rgba(139,92,246,0.3)]", text: "text-violet-300" },
  orange: { bg: "from-orange-500/15 to-orange-900/5", border: "border-orange-500/30", glow: "hover:shadow-[0_0_25px_rgba(249,115,22,0.3)]", text: "text-orange-300" },
  cyan: { bg: "from-cyan-500/15 to-cyan-900/5", border: "border-cyan-500/30", glow: "hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]", text: "text-cyan-300" },
  emerald: { bg: "from-emerald-500/15 to-emerald-900/5", border: "border-emerald-500/30", glow: "hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]", text: "text-emerald-300" },
  purple: { bg: "from-purple-500/15 to-purple-900/5", border: "border-purple-500/30", glow: "hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]", text: "text-purple-300" },
  yellow: { bg: "from-yellow-500/15 to-yellow-900/5", border: "border-yellow-500/30", glow: "hover:shadow-[0_0_25px_rgba(234,179,8,0.3)]", text: "text-yellow-300" },
  blue: { bg: "from-blue-500/15 to-blue-900/5", border: "border-blue-500/30", glow: "hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]", text: "text-blue-300" },
  red: { bg: "from-red-500/15 to-red-900/5", border: "border-red-500/30", glow: "hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]", text: "text-red-300" },
};

const DEFAULT_ACHIEVEMENTS: AchievementItem[] = [
  { id: "1", title: "FYP Completed", description: "Delivered Blood Sugar Tracker ML system as Final Year Project using Flask & scikit-learn", icon: "🎓", date: "2024", color: "indigo", category: "Academic" },
  { id: "2", title: "First Production Deployment", description: "Shipped first full-stack Next.js + Supabase app to Vercel with live users", icon: "🚀", date: "2024", color: "violet", category: "Dev" },
  { id: "3", title: "GitHub Streak", description: "Maintained consistent GitHub contribution streak across multiple repositories", icon: "🔥", date: "2024", color: "orange", category: "Dev" },
  { id: "4", title: "Full-Stack Stack Mastered", description: "Proficient in Next.js, TypeScript, Supabase, TailwindCSS, PostgreSQL end-to-end", icon: "⚡", date: "2024", color: "cyan", category: "Skills" },
  { id: "5", title: "AppSec Learning Journey", description: "Actively studying Application Security — OWASP Top 10, authentication, and threat modeling", icon: "🛡️", date: "2025", color: "emerald", category: "Learning" },
  { id: "6", title: "ML Model Shipped", description: "Built and deployed ElasticNet regression model predicting glucose levels with real accuracy", icon: "🧠", date: "2024", color: "purple", category: "ML" },
  { id: "7", title: "Portfolio Launched", description: "Built premium portfolio with admin CMS, real-time DB, AI chatbot, and mini games", icon: "🌟", date: "2025", color: "yellow", category: "Dev" },
  { id: "8", title: "Open Source Contributor", description: "Published projects on GitHub with clean READMEs and documentation", icon: "💻", date: "2024", color: "blue", category: "Dev" },
];

export function Achievements() {
  const [achievements, setAchievements] = useState<AchievementItem[]>(DEFAULT_ACHIEVEMENTS);

  useEffect(() => {
    fetch("/api/admin/achievements")
      .then((r) => r.json())
      .then((d) => { if (d.achievements?.length) setAchievements(d.achievements); })
      .catch(() => {});
  }, []);

  const categories = Array.from(new Set(achievements.map((a) => a.category)));

  return (
    <section id="achievements" className="section-padding relative" aria-labelledby="achievements-heading">
      <div className="container-narrow">
        <Reveal>
          <SectionHeading
            eyebrow="Achievements"
            title="Milestones & badges"
            subtitle="A wall of earned achievements — from academic milestones to shipped products and mastered skills."
          />
        </Reveal>

        {/* Category filter */}
        <Reveal delay={100}>
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <span key={cat} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
                {cat}
              </span>
            ))}
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {achievements.map((achievement, i) => {
            const colors = COLOR_MAP[achievement.color] ?? COLOR_MAP.indigo;
            return (
              <Reveal key={achievement.id} delay={i * 60}>
                <div
                  className={`group relative rounded-2xl border bg-gradient-to-br ${colors.bg} ${colors.border} p-5 transition-all duration-300 ${colors.glow} hover:-translate-y-0.5`}
                >
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.04),transparent_60%)]" />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div className="text-right">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${colors.text}`}>
                          {achievement.category}
                        </span>
                        <p className="text-[10px] text-slate-600 mt-0.5">{achievement.date}</p>
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-white leading-tight mb-2">{achievement.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{achievement.description}</p>

                    {/* Unlock indicator */}
                    <div className="mt-3 flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${colors.text.replace("text-", "bg-")}`} />
                      <span className="text-[10px] text-slate-600">Unlocked</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* GitHub Live Contribution Heatmap */}
        <Reveal delay={200}>
          <GitHubHeatmap />
        </Reveal>
      </div>
    </section>
  );
}
