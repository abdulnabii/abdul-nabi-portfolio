"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import type { MiniProject } from "@/lib/mini-projects-store";
import { ArrowLeft, ExternalLink, Github, Loader2, Rocket, Search } from "lucide-react";
import Link from "next/link";

export default function MiniProjectsPage() {
  const [projects, setProjects] = useState<MiniProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetch("/api/mini-projects")
      .then((r) => r.json())
      .then((d) => {
        if (d.miniProjects) setProjects(d.miniProjects);
      })
      .catch((err) => console.error("Failed to load mini projects", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter ONLY published (Live) projects for public display
  const liveProjects = projects.filter((p) => p.status === "Live");

  const categories = ["All", ...Array.from(new Set(liveProjects.map((p) => p.category)))];

  const filtered = liveProjects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenVercel = (url: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen section-padding pt-28 pb-20">
      <div className="container-narrow space-y-8">
        {/* Top return link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Main Portfolio
          </Link>
          <span className="text-xs font-mono text-indigo-400">
            {liveProjects.length} Published Demos
          </span>
        </div>

        {/* Page Header */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-300 mb-4">
            <Rocket className="h-3.5 w-3.5" />
            Interactive Micro Tools & Demos
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Live Mini Projects & AI Micro-Tools
          </h1>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-300 max-w-3xl">
            Explore production-grade web applications, healthcare ML models, developer tools, and real-time dashboards — click Live Demo to launch any project in a new window.
          </p>
        </div>

        {/* Search & Category Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search mini projects by Title or Tech..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-md"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Content Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center">
            <p className="text-slate-400 text-sm">No live mini projects found matching your filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((proj, idx) => (
              <Reveal key={proj.id} delay={idx * 50}>
                <GlassCard
                  interactive
                  hover
                  padding="lg"
                  className="group flex flex-col justify-between h-full cursor-pointer transition-all duration-300 hover:border-indigo-500/40 hover:scale-[1.01]"
                  onClick={() => handleOpenVercel(proj.vercelUrl)}
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

                    <h2 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                      {proj.title}
                    </h2>

                    <p className="mt-2 text-xs leading-relaxed text-slate-300">
                      {proj.description}
                    </p>

                    {/* Tech Tags */}
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

                  {/* Action Buttons: Live Demo button opens new window */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                    {proj.vercelUrl ? (
                      <a
                        href={proj.vercelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenVercel(proj.vercelUrl);
                        }}
                        className="cursor-grow inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Live Demo
                      </a>
                    ) : null}

                    {proj.githubUrl ? (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-grow inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition"
                      >
                        <Github className="h-3.5 w-3.5" />
                        Source
                      </a>
                    ) : null}
                  </div>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
