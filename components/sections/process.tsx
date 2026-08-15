"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Compass, Server, Code2, Rocket, ArrowRight, ShieldCheck } from "lucide-react";

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Discovery & Requirements",
    icon: Compass,
    description: "Deep dive into your product vision, edge cases, target audience, and database schema requirements to build a rock-solid roadmap.",
    deliverables: ["Product Specification", "Data Model", "API Contract"],
    accent: "from-indigo-500 to-blue-500",
  },
  {
    step: "02",
    title: "Architecture & Security",
    icon: Server,
    description: "Designing scalable Next.js App Router architecture, Supabase RLS security policies, RBAC auth flows, and resilient API routes.",
    deliverables: ["DB Architecture", "Security Audit Plan", "Component Tree"],
    accent: "from-blue-500 to-cyan-500",
  },
  {
    step: "03",
    title: "Agile Build & Testing",
    icon: Code2,
    description: "Writing clean, type-safe TypeScript with responsive Tailwind styling, micro-animations, comprehensive error boundaries, and unit verification.",
    deliverables: ["Type-Safe Codebase", "Zero Regression Builds", "Interactive Demos"],
    accent: "from-cyan-500 to-emerald-500",
  },
  {
    step: "04",
    title: "Deployment & Handoff",
    icon: Rocket,
    description: "Production Vercel deployment, automated CI/CD GitHub Actions, custom domain configuration, and complete developer handoff documentation.",
    deliverables: ["Production URL", "Admin Guide", "Ongoing Support"],
    accent: "from-emerald-500 to-teal-500",
  },
];

export function Process() {
  return (
    <section
      id="process"
      className="section-padding relative"
      aria-labelledby="process-heading"
    >
      <div className="container-narrow space-y-10">
        <Reveal>
          <SectionHeading
            eyebrow="Workflow & Methodology"
            title="How I Build & Ship Production Software"
            subtitle="A disciplined 4-stage engineering process ensuring zero-defect deployments, watertight security, and transparent client communication."
          />
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
          {PROCESS_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.step} delay={index * 90} className="h-full">
                <GlassCard
                  interactive
                  hover
                  padding="lg"
                  className="h-full flex flex-col justify-between p-6 cursor-grow border-white/10 hover:border-indigo-500/40 transition-all group relative overflow-hidden"
                >
                  {/* Top Step Number & Icon */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-2xl font-black text-white/20 group-hover:text-indigo-400/40 transition-colors">
                        {step.step}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-accent-soft transition-colors">
                      {step.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                      {step.description}
                    </p>
                  </div>

                  {/* Deliverables List */}
                  <div className="pt-3 border-t border-white/5 space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Deliverables:
                    </span>
                    <ul className="space-y-1">
                      {step.deliverables.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-1.5 text-xs text-slate-400"
                        >
                          <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
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
