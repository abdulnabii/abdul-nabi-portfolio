"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Award, ExternalLink, CheckCircle2, Shield, Sparkles } from "lucide-react";
import certsData from "@/data/certifications.json";

export function Certifications() {
  return (
    <section
      id="certifications"
      className="section-padding relative"
      aria-labelledby="certifications-heading"
    >
      <div className="container-narrow space-y-10">
        <Reveal>
          <SectionHeading
            eyebrow="Continuous Learning & Credentials"
            title="Certifications & Technical Specializations"
            subtitle="Verified coursework and professional certificates in modern full-stack development, ML pipelines, and application security."
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {certsData.map((cert, index) => {
            return (
              <Reveal key={cert.id} delay={index * 70} className="h-full">
                <GlassCard
                  interactive
                  hover
                  padding="lg"
                  className="h-full flex flex-col justify-between p-6 cursor-grow border-white/10 hover:border-indigo-500/40 transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                          <Award className="h-5 w-5" />
                        </span>
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                            {cert.issuer}
                          </span>
                          <h3 className="text-base font-semibold text-white group-hover:text-accent-soft transition-colors">
                            {cert.title}
                          </h3>
                        </div>
                      </div>

                      <span className="text-xs font-mono text-slate-400 shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                        {cert.date}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/5">
                      {cert.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[11px] text-slate-300"
                        >
                          <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <Shield className="h-3 w-3" />
                      Verified Curriculum
                    </span>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        Credential Info
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
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
