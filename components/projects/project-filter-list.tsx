"use client";

import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { isPublicUrl } from "@/lib/links";
import { ArrowUpRight, Github, Star, Search, Filter, Sparkles, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProjectFilterListProps {
  initialProjects: any[];
}

const CATEGORIES = [
  { id: "all", label: "All Projects" },
  { id: "featured", label: "⭐ Featured" },
  { id: "fullstack", label: "Next.js & Full-Stack" },
  { id: "ml", label: "Python & ML" },
  { id: "security", label: "AppSec & APIs" },
];

export function ProjectFilterList({ initialProjects }: ProjectFilterListProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(() => {
    return initialProjects.filter((project) => {
      // Category filter
      if (selectedCategory === "featured" && !project.featured) return false;
      
      const allTags = (project.tags || []).map((t: string) => t.toLowerCase());
      const titleLower = (project.title || "").toLowerCase();
      const descLower = (project.description || "").toLowerCase();
      const textCorpus = `${titleLower} ${descLower} ${allTags.join(" ")}`;

      if (selectedCategory === "fullstack") {
        const isFullstack = allTags.some((t: string) => t.includes("next") || t.includes("react") || t.includes("full-stack") || t.includes("web"));
        if (!isFullstack && !textCorpus.includes("next.js") && !textCorpus.includes("react")) return false;
      }

      if (selectedCategory === "ml") {
        const isML = allTags.some((t: string) => t.includes("ml") || t.includes("python") || t.includes("ai") || t.includes("model"));
        if (!isML && !textCorpus.includes("python") && !textCorpus.includes("machine learning") && !textCorpus.includes("glucose")) return false;
      }

      if (selectedCategory === "security") {
        const isSec = allTags.some((t: string) => t.includes("security") || t.includes("appsec") || t.includes("api") || t.includes("auth"));
        if (!isSec && !textCorpus.includes("appsec") && !textCorpus.includes("owasp") && !textCorpus.includes("security") && !textCorpus.includes("api")) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return textCorpus.includes(q);
      }

      return true;
    });
  }, [initialProjects, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 cursor-pointer ${
                  active
                    ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400/40"
                    : "border border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by tech, title..."
            className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2 pl-9.5 pr-4 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white/[0.08] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400">
          No projects found matching the current filters.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProjects.map((project, index) => {
            const live = isPublicUrl(project.liveUrl);
            const code = isPublicUrl(project.githubUrl);
            const tags: string[] = Array.isArray(project.tags) ? project.tags : [];

            return (
              <Reveal key={project.id} delay={index * 40}>
                <GlassCard interactive tilt hover padding="none" className="group overflow-hidden">
                  <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <Link
                      href={`/projects/${project.id}`}
                      className="relative block min-h-[220px] overflow-hidden border-b border-white/5 lg:min-h-[300px] lg:border-b-0 lg:border-r cursor-grow group/img bg-[#060a17] p-2 sm:p-3"
                    >
                      {project.image ? (
                        <Image
                          src={project.image}
                          alt={`${project.title} preview`}
                          fill
                          className="object-contain object-top p-2 transition-transform duration-700 group-hover/img:scale-[1.02]"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-accent-cyan/10" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/40 to-transparent pointer-events-none" />
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {project.featured && (
                            <Badge variant="accent" className="bg-amber-500/20 text-amber-300 border-amber-500/30 gap-1">
                              <Star className="h-3 w-3 fill-amber-300" /> Featured
                            </Badge>
                          )}
                          <Badge variant="accent">{project.year || "2024"}</Badge>
                          {live ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Live System
                            </span>
                          ) : (
                            <Badge variant="muted">{project.statusLabel || "Completed"}</Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl group-hover/img:text-accent-soft transition-colors">
                          {project.title}
                        </h3>
                      </div>
                    </Link>

                    <div className="flex flex-col justify-between gap-5 p-5 sm:p-7">
                      <p className="text-sm leading-relaxed text-slate-300">{project.description}</p>
                      <dl className="space-y-3">
                        {project.problem && (
                          <div>
                            <dt className="text-xs font-medium uppercase tracking-widest text-slate-500">Problem</dt>
                            <dd className="mt-1 text-sm leading-relaxed text-slate-300">{project.problem}</dd>
                          </div>
                        )}
                        {project.outcome && (
                          <div>
                            <dt className="text-xs font-medium uppercase tracking-widest text-slate-500">Outcome</dt>
                            <dd className="mt-1 text-sm leading-relaxed text-slate-300">{project.outcome}</dd>
                          </div>
                        )}
                      </dl>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {tags.slice(0, 5).map((tag) => (
                            <Badge key={tag}>{tag}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/5">
                        {live && project.liveUrl && (
                          <LinkButton href={project.liveUrl} variant="primary" size="sm" external className="cursor-grow">
                            Live demo <ArrowUpRight className="h-3.5 w-3.5" />
                          </LinkButton>
                        )}
                        {code && project.githubUrl && (
                          <LinkButton href={project.githubUrl} variant="secondary" size="sm" external className="cursor-grow">
                            <Github className="h-3.5 w-3.5" /> Source
                          </LinkButton>
                        )}
                        <LinkButton href={`/projects/${project.id}`} variant="ghost" size="sm" className="text-indigo-400 hover:text-white cursor-grow gap-1 ml-auto">
                          Case study →
                        </LinkButton>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
