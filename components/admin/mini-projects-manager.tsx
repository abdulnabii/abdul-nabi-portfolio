"use client";

import React, { useEffect, useState } from "react";
import type { MiniProject } from "@/lib/mini-projects-store";
import {
  ExternalLink,
  Github,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  Rocket,
  Search,
} from "lucide-react";

export function MiniProjectsManager() {
  const [projects, setProjects] = useState<MiniProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formDayNumber, setFormDayNumber] = useState<number>(1);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formVercelUrl, setFormVercelUrl] = useState("");
  const [formGithubUrl, setFormGithubUrl] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formStatus, setFormStatus] = useState<"Live" | "In Progress" | "Planned">("Live");
  const [formFeatured, setFormFeatured] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/mini-projects", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.miniProjects || []);
      }
    } catch (err) {
      console.error("Failed to load mini projects", err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingId(null);
    const nextDay = projects.length > 0 ? Math.max(...projects.map((p) => p.dayNumber)) + 1 : 1;
    setFormDayNumber(nextDay);
    setFormTitle("");
    setFormCategory("Full-Stack Web App");
    setFormDescription("");
    setFormVercelUrl("");
    setFormGithubUrl("");
    setFormTags("Next.js 14, TailwindCSS, TypeScript");
    setFormStatus("Live");
    setFormFeatured(false);
    setIsModalOpen(true);
  }

  function openEditModal(project: MiniProject) {
    setEditingId(project.id);
    setFormDayNumber(project.dayNumber);
    setFormTitle(project.title);
    setFormCategory(project.category);
    setFormDescription(project.description);
    setFormVercelUrl(project.vercelUrl);
    setFormGithubUrl(project.githubUrl || "");
    setFormTags(project.tags.join(", "));
    setFormStatus(project.status);
    setFormFeatured(Boolean(project.featured));
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      id: editingId || undefined,
      dayNumber: Number(formDayNumber),
      title: formTitle,
      category: formCategory,
      description: formDescription,
      vercelUrl: formVercelUrl,
      githubUrl: formGithubUrl,
      tags: formTags.split(",").map((t) => t.trim()).filter(Boolean),
      status: formStatus,
      featured: formFeatured,
    };

    try {
      const method = editingId ? "PUT" : "POST";
      const res = await fetch("/api/admin/mini-projects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchProjects();
      }
    } catch (err) {
      console.error("Failed to save mini project", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this mini project?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/mini-projects?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete project", err);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `day ${p.dayNumber}`.includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Mini Projects</h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Manage your mini projects, live demo links, and source code repositories.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Mini Project
        </button>
      </div>

      {/* Search Bar & Filter Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Day, Title, or Category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 font-medium text-indigo-300 border border-indigo-500/30">
            {projects.length} Total Mini Projects
          </span>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-medium text-emerald-300 border border-emerald-500/30">
            {projects.filter((p) => p.status === "Live").length} Live Deployments
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center">
          <p className="text-slate-400 text-sm">No mini projects found matching your search.</p>
        </div>
      ) : (
        /* Mini Projects Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition-all duration-200 hover:border-indigo-500/40 hover:bg-white/[0.06]"
            >
              <div>
                {/* Card Header Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30 font-mono">
                    Day {String(project.dayNumber).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                      {project.category}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                        project.status === "Live"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : project.status === "In Progress"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-slate-700/50 text-slate-400 border-slate-600"
                      }`}
                    >
                      {project.status === "Live" ? "🟢 Live" : project.status}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {project.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300 line-clamp-3">
                  {project.description}
                </p>

                {/* Tech Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-slate-400 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Links & Action Buttons */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {project.vercelUrl && (
                    <a
                      href={project.vercelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600/80 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-600 transition"
                      title="Open Live Vercel App"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Live Demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white transition"
                      title="View GitHub Code"
                    >
                      <Github className="h-3 w-3" />
                      Code
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(project)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition"
                    title="Edit Mini Project"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    disabled={deletingId === project.id}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition"
                    title="Delete Mini Project"
                  >
                    {deletingId === project.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Form Editor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#0a0f1e] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">
                {editingId ? "Edit Mini Project" : "Add New Mini Project"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Day #
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formDayNumber}
                    onChange={(e) => setFormDayNumber(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Healthcare AI, FinTech"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Symptom Checker & Triage Assistant"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Briefly describe what this project does and key features..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Vercel Live URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://symptom-checker.aiwithab.site or vercel link"
                  value={formVercelUrl}
                  onChange={(e) => setFormVercelUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  GitHub Code Repo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/abdulnabii/day-01-ai-symptom-checker"
                  value={formGithubUrl}
                  onChange={(e) => setFormGithubUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tech Stack (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Next.js 14, Gemini AI, TailwindCSS"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as "Live" | "In Progress" | "Planned")
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0a0f1e] px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Live">🟢 Live</option>
                    <option value="In Progress">🟡 In Progress</option>
                    <option value="Planned">⚪ Planned</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="formFeatured"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="rounded border-white/10 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="formFeatured" className="text-xs text-slate-300 cursor-pointer">
                  Feature this mini project on main homepage showcase
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {editingId ? "Update Project" : "Create Project"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
