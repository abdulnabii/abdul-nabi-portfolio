"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Star, Quote, ShieldCheck, Linkedin, Award, Briefcase } from "lucide-react";
import testimonialsData from "@/data/testimonials.json";

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="section-padding relative overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      <div className="container-narrow space-y-10">
        <Reveal>
          <SectionHeading
            eyebrow="Social Proof & Endorsements"
            title="What Collaborators & Clients Say"
            subtitle="Feedback from engineering leads, startup founders, and project stakeholders on code quality, speed, and delivery."
          />
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonialsData.map((item, index) => {
            return (
              <Reveal key={item.id} delay={index * 80} className="h-full">
                <GlassCard
                  interactive
                  tilt
                  hover
                  padding="lg"
                  className="h-full flex flex-col justify-between p-6 sm:p-7 relative group border-white/10 hover:border-indigo-500/40"
                >
                  <div>
                    {/* Top row: stars + quote mark */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                      <Quote className="h-6 w-6 text-indigo-400/20 group-hover:text-indigo-400/40 transition-colors" />
                    </div>

                    {/* Testimonial Quote */}
                    <p className="text-sm sm:text-base leading-relaxed text-slate-300 italic mb-6">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  {/* Author Meta */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 font-semibold text-xs text-indigo-200">
                        {item.avatar}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {item.role} · <span className="text-indigo-300">{item.company}</span>
                        </p>
                      </div>
                    </div>

                    <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-400">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      {item.platform}
                    </span>
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
