"use client";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteContent } from "@/data/content";
import { useSiteSettings } from "@/components/settings-provider";
import { Code2, Layers, ShieldAlert, Wrench, Cpu, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

const SKILL_PROFICIENCY: Record<string, number> = {
  "Next.js (App Router)": 92,
  React: 90,
  TypeScript: 88,
  "Tailwind CSS": 92,
  "Web Development": 94,
  "Responsive design": 95,
  "Node.js": 86,
  "REST APIs": 90,
  PostgreSQL: 84,
  Supabase: 88,
  Python: 85,
  "ML model training": 80,
  Pandas: 82,
  "OWASP Top 10": 82,
  "Auth & RBAC design": 85,
  "Git / GitHub": 90,
};

function SkillProgressBar({ name, level, colorClass }: { name: string; level: number; colorClass: string }) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.2 }
    );

    const el = ref.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <div ref={ref} className="space-y-1.5 py-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-200">{name}</span>
        <span className="font-mono text-slate-400">{level}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: inView ? `${level}%` : "0%" }}
        />
      </div>
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

            // Get top highlighted skills that have progress bars
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

                    {/* Animated Progress Bars for key skills */}
                    {scoredSkills.length > 0 && (
                      <div className="mb-5 space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                        {scoredSkills.map((skill) => (
                          <SkillProgressBar
                            key={skill}
                            name={skill}
                            level={SKILL_PROFICIENCY[skill]}
                            colorClass={categoryConfig.bar}
                          />
                        ))}
                      </div>
                    )}

                    {/* All Badges in Category */}
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
