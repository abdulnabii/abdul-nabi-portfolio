"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project } from "@/data/content";
import { Pencil, Trash2, Search, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { DeleteModal } from "./delete-modal";

interface ProjectListProps {
  projects: Project[];
}

type TabType = "all" | "featured" | "regular";

export function ProjectList({ projects: initial }: ProjectListProps) {
  const [projects, setProjects] = useState(initial);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const router = useRouter();

  // Sync internal state when initial prop changes and merge localStorage projects
  useEffect(() => {
    let merged = initial;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("an_local_projects");
        if (raw) {
          const localProjects = JSON.parse(raw) as Project[];
          if (localProjects.length > 0) {
            const map = new Map<string, Project>();
            initial.forEach((p) => map.set(p.id, p));
            localProjects.forEach((p) => map.set(p.id, p));
            merged = Array.from(map.values()).sort((a, b) => {
              if (a.featured !== b.featured) {
                return a.featured ? -1 : 1;
              }
              return b.year.localeCompare(a.year);
            });
          }
        }
      } catch {
        // LocalStorage fallback
      }
    }
    setProjects(merged);
  }, [initial]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "featured" && project.featured) ||
        (activeTab === "regular" && !project.featured);

      return matchesSearch && matchesTab;
    });
  }, [projects, searchTerm, activeTab]);

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setLoadingDelete(true);
    try {
      const res = await fetch(`/api/projects/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Delete failed");
      }
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("an_local_projects");
          if (raw) {
            const localProjects = (JSON.parse(raw) as Project[]).filter((p) => p.id !== deleteTarget.id);
            localStorage.setItem("an_local_projects", JSON.stringify(localProjects));
          }
        } catch {}
      }
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoadingDelete(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/5">
          {(["all", "featured", "regular"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition ${
                activeTab === tab
                  ? "bg-accent/20 text-white border border-accent/20"
                  : "text-slate-400 border border-transparent hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-accent/40 focus:bg-white/[0.07]"
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-12 text-center backdrop-blur-xl">
          <p className="text-slate-400">No projects found matching your criteria.</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-2 text-sm text-accent-soft hover:underline"
            >
              Clear search query
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredProjects.map((project) => (
            <li
              key={project.id}
              className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 sm:flex-row sm:items-center transition hover:border-white/10 hover:bg-white/[0.05]"
            >
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl border border-white/10 sm:h-20 sm:w-32 bg-[#050814]">
                <Image
                  src={
                    project.image ||
                    (project as any).image_url ||
                    (project.id.includes("aegis")
                      ? "/projects/aegis.jpg"
                      : project.id.includes("aurora")
                      ? "/projects/aurora.jpg"
                      : project.id.includes("pulse")
                      ? "/projects/pulse.jpg"
                      : project.id.includes("nova")
                      ? "/projects/nova.jpg"
                      : project.id.includes("sugar")
                      ? "/blood_sugar_banner.jpg"
                      : "/projects/ops.jpg")
                  }
                  alt={project.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-medium text-white">{project.title}</h3>
                  <Badge variant={project.featured ? "accent" : "muted"}>
                    {project.featured ? "Featured" : "Regular"}
                  </Badge>
                  <Badge variant={project.published !== false ? "accent" : "muted"}>
                    {project.published !== false ? "Published" : "Draft"}
                  </Badge>
                  <Badge variant="muted">{project.statusLabel}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500 font-mono">
                  Year: {project.year} · ID: {project.id} · Likes: {project.appreciations ?? 0}
                </p>
                <p className="mt-1.5 line-clamp-1 text-sm text-slate-400">
                  {project.description}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                {project.published === false && (
                  <Link
                    href={`/api/preview?secret=${process.env.NEXT_PUBLIC_PREVIEW_SECRET || "default_preview_secret"}&type=project&slug=${project.id}`}
                    target="_blank"
                  >
                    <Button variant="secondary" size="sm" type="button" className="text-amber-300 border-amber-500/20 hover:bg-amber-500/10">
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                  </Link>
                )}
                <Link href={`/admin/projects/${project.id}/edit`}>
                  <Button variant="secondary" size="sm" type="button">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setDeleteTarget(project)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <DeleteModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        itemTitle={deleteTarget?.title ?? ""}
        loading={loadingDelete}
      />
    </div>
  );
}
