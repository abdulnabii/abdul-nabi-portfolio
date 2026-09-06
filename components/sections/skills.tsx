"use client";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteContent } from "@/data/content";
import { useSiteSettings } from "@/components/settings-provider";
import { Code2, Layers, ShieldAlert, Wrench, Cpu, Sparkles } from "lucide-react";

const icons = [Code2, Layers, ShieldAlert, Cpu, Wrench];

const CATEGORY_COLORS: Record<string, { bar: string; badge: string; text: string }> = {
  "Frontend & UI": {
    bar: "from-indigo-500 to-cyan-400",
    badge: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
    text: "text-indigo-400",
  },
  "Backend & APIs": {
    bar: "from-emerald-500 to-teal-400",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    text: "text-emerald-400",
  },
  "AppSec & DevSecOps": {
    bar: "from-rose-500 to-red-400",
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    text: "text-rose-400",
  },
  "Data & ML": {
    bar: "from-amber-500 to-orange-400",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    text: "text-amber-400",
  },
  Delivery: {
    bar: "from-purple-500 to-pink-400",
    badge: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    text: "text-purple-400",
  },
};

// Qualitative proficiency — honest and interview-defensible
const SKILL_PROFICIENCY: Record<string, { label: string; level: 1 | 2 | 3 }> = {
  "Next.js (App Router)": { label: "Advanced", level: 3 },
  React:                  { label: "Advanced", level: 3 },
  TypeScript:             { label: "Advanced", level: 3 },
  "Tailwind CSS":         { label: "Advanced", level: 3 },
  "Web Development":      { label: "Advanced", level: 3 },
  "Responsive design":    { label: "Advanced", level: 3 },
  "Node.js":              { label: "Proficient", level: 2 },
  "REST APIs":            { label: "Advanced", level: 3 },
  PostgreSQL:             { label: "Proficient", level: 2 },
  Supabase:               { label: "Proficient", level: 2 },
  Python:                 { label: "Proficient", level: 2 },
  "ML model training":    { label: "Proficient", level: 2 },
  Pandas:                 { label: "Proficient", level: 2 },
  "OWASP Top 10":         { label: "Proficient", level: 2 },
  "Auth & RBAC design":   { label: "Proficient", level: 2 },
  "Git / GitHub":         { label: "Advanced", level: 3 },
};

const LEVEL_DOT_COLORS: Record<1 | 2 | 3, string> = {
  1: "bg-slate-500",
  2: "bg-amber-400",
  3: "bg-emerald-400",
};

const LEVEL_TEXT_COLORS: Record<1 | 2 | 3, string> = {
  1: "text-slate-400",
  2: "text-amber-300",
  3: "text-emerald-300",
};

function SkillProficiencyBadge({ name }: { name: string }) {
  const proficiency = SKILL_PROFICIENCY[name];
  if (!proficiency) return null;

  const dotColor = LEVEL_DOT_COLORS[proficiency.level];
  const textColor = LEVEL_TEXT_COLORS[proficiency.level];

  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs">
      <span className="font-medium text-slate-200">{name}</span>
      <span className={`flex items-center gap-1.5 font-semibold ${textColor}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        {proficiency.label}
      </span>
    </div>
  );
}

export function Skills() {
  const { skills: skillsData } = useSiteSettings();
  const categories = skillsData || siteContent.skills;

  return (
    <section
      id="stack"
      className="section-padding relative"
      aria-labelledby="skills-heading"
    >
      <div className="container-narrow">
        <Reveal>
          <SectionHeading
            eyebrow="Stack & Capabilities"
            title="Tools & Technologies I Ship With"
            subtitle="Engineered for high-performance frontend interfaces, robust backend APIs, verified ML pipelines, and secure architectures."
          />
        </Reveal>

        <div className="grid gap-6 items-stretch md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const Icon = icons[index % icons.length] || Sparkles;
            const categoryConfig = CATEGORY_COLORS[category.title] || {
              bar: "from-indigo-500 to-purple-500",
              badge: "border-white/10 bg-white/[0.04] text-slate-300",
              text: "text-accent-soft",
            };

            // Top 3 skills that have proficiency labels
            const scoredSkills = category.skills
              .filter((s) => SKILL_PROFICIENCY[s])
              .slice(0, 3);

            return (
              <Reveal key={category.title} delay={index * 70} className="h-full">
                <GlassCard interactive hover padding="lg" className="h-full flex flex-col justify-between cursor-grow p-6">
                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-accent-soft">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="text-base font-semibold text-white">
                            {category.title}
                          </h3>
                          <span className="text-[11px] text-slate-400">
                            {category.skills.length} competencies
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Qualitative Proficiency Labels */}
                    {scoredSkills.length > 0 && (
                      <div className="mb-5 space-y-1.5">
                        {scoredSkills.map((skill) => (
                          <SkillProficiencyBadge key={skill} name={skill} />
                        ))}
                      </div>
                    )}

                    {/* All skill badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {category.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                        >
                          {skill}
                        </span>
                      ))}
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
