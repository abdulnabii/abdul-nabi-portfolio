"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { MiniProject } from "@/lib/mini-projects-store";
import { MiniProjectPreviewModal } from "@/components/mini-project-preview-modal";
import { ArrowRight, ExternalLink, Eye, Github } from "lucide-react";

export function MiniProjects() {
  const [projects, setProjects] = useState<MiniProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPreview, setSelectedPreview] = useState<MiniProject | null>(null);

  useEffect(() => {
    fetch("/api/mini-projects")
      .then((r) => r.json())
      .then((d) => {
        if (d.miniProjects) setProjects(d.miniProjects);
      })
      .catch((err) => console.error("Failed to load mini projects", err))
      .finally(() => setLoading(false));
  }, []);

  // Show ONLY published (Live) projects on public site
  const publishedProjects = projects.filter((p) => p.status === "Live");
  const displayProjects = publishedProjects.slice(0, 6);

  const handleLiveDemoClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section
      id="mini-projects"
      className="section-padding relative"
      aria-labelledby="mini-projects-heading"
    >
      <div className="container-narrow space-y-10">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <SectionHeading
              eyebrow="Micro Tools & Demos"
              title="Mini Projects & Interactive Tools"
              subtitle="Production-grade micro applications, AI tools, and healthcare predictors — deployed live."
              className="mb-0"
            />
            <LinkButton href="/mini-projects" variant="secondary" size="sm" className="shrink-0 cursor-grow">
              Explore All Mini Projects
              <ArrowRight className="h-3.5 w-3.5" />
            </LinkButton>
          </div>
        </Reveal>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : displayProjects.length === 0 ? null : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayProjects.map((proj, idx) => (
              <Reveal key={proj.id} delay={idx * 60}>
                <GlassCard
                  interactive
                  hover
                  padding="lg"
                  className="group flex flex-col justify-between h-full cursor-pointer transition-all duration-300 hover:border-indigo-500/40"
                  onClick={() => setSelectedPreview(proj)}
                >
                  <div>
                    {/* Category & Status badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                        {proj.category}
                      </span>
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                        🟢 Live
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                      {proj.title}
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-slate-300 line-clamp-3">
                      {proj.description}
                    </p>

                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {proj.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-slate-300 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons: Primary "Live Demo" opens new window, Secondary "Preview" opens modal */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                    {proj.vercelUrl ? (
                      <a
                        href={proj.vercelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleLiveDemoClick(e, proj.vercelUrl)}
                        className="cursor-grow inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Live Demo
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPreview(proj);
                      }}
                      className="cursor-grow inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </button>
                  </div>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Preview Modal */}
      <MiniProjectPreviewModal
        project={selectedPreview}
        onClose={() => setSelectedPreview(null)}
      />
    </section>
  );
}
