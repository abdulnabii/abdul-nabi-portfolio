"use client";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteContent } from "@/data/content";
import { useSiteSettings } from "@/components/settings-provider";
import { Code2, Layers, ShieldAlert, Wrench, Cpu } from "lucide-react";

const icons = [Code2, Layers, ShieldAlert, Wrench, Cpu];

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
            eyebrow="Stack"
            title="Tools I use in production"
            subtitle="A focused toolkit for product UI, APIs, application security, and reliable delivery — not an endless logo wall."
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((category, index) => {
            const Icon = icons[index % icons.length];
            return (
              <Reveal key={category.title} delay={index * 80}>
                <GlassCard interactive hover padding="lg" className="h-full cursor-grow">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-accent-soft">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-lg font-semibold text-white">
                      {category.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
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
