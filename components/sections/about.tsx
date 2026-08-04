"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteContent } from "@/data/content";
import { useSiteSettings } from "@/components/settings-provider";
import { Calendar, Shield, Cpu, Sparkles } from "lucide-react";

const statIcons = [Calendar, Shield, Cpu];

export function About() {
  const { settings, about: aboutState } = useSiteSettings();
  const name = settings.fullName || siteContent.name;
  const about = aboutState || siteContent.about;

  return (
    <section
      id="about"
      className="section-padding relative"
      aria-labelledby="about-heading"
    >
      <div className="container-narrow space-y-8">
        <Reveal>
          <SectionHeading
            eyebrow="Background"
            title={about.title}
            subtitle={`How ${name} approaches product work — ownership, craft, and honest delivery.`}
          />
        </Reveal>

        {/* Main Biography Card */}
        <Reveal delay={80}>
          <GlassCard interactive padding="lg" className="space-y-5">
            {about.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-base leading-relaxed text-slate-300 sm:text-[1.05rem]"
              >
                {paragraph}
              </p>
            ))}
          </GlassCard>
        </Reveal>

        {/* Spotlight Stat Cards 3-Column Grid */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-3">
          {about.stats.map((stat, index) => {
            const Icon = statIcons[index % statIcons.length] || Sparkles;
            const isLongValue = stat.value.length > 12;

            return (
              <Reveal key={stat.label + index} delay={120 + index * 80}>
                <GlassCard
                  interactive
                  hover
                  padding="lg"
                  className="group flex flex-col items-center justify-center text-center h-full min-h-[170px] cursor-grow p-6 transition-all duration-200 hover:scale-[1.02] hover:border-accent/40"
                >
                  <div className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-accent-soft transition-colors group-hover:border-accent/30 group-hover:bg-accent/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="w-full mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 leading-snug">
                    {stat.label}
                  </p>
                  <p
                    className={`w-full font-bold tracking-tight text-accent-soft transition-colors group-hover:text-white ${
                      isLongValue ? "text-base sm:text-lg" : "text-2xl sm:text-3xl"
                    }`}
                  >
                    {stat.value}
                  </p>
                </GlassCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
