"use client";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteContent } from "@/data/content";
import { useSiteSettings } from "@/components/settings-provider";
import { GraduationCap } from "lucide-react";

export function Education() {
  const { education: eduData, settings } = useSiteSettings();
  const education = eduData || siteContent.education;
  const canonicalLocation = settings?.location || siteContent.location;

  return (
    <section
      id="education"
      className="section-padding relative"
      aria-labelledby="education-heading"
    >
      <div className="container-narrow">
        <Reveal>
          <SectionHeading
            eyebrow="Learning"
            title="Education"
            subtitle="Foundations and continuous practice that inform how I build."
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {education.map((item, index) => (
            <Reveal key={item.id} delay={index * 90}>
              <GlassCard interactive hover padding="lg" className="h-full cursor-grow">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-accent-soft">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <Badge variant="muted">{item.period}</Badge>
                </div>

                <h3 className="text-xl font-semibold text-white">
                  {item.degree}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {item.institution}
                  {canonicalLocation && (
                    <> · {canonicalLocation}</>
                  )}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  {item.description}
                </p>

                {item.highlights && item.highlights.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {item.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex gap-2 text-sm text-slate-400"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-cyan/80" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
