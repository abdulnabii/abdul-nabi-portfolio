"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownEditor } from "./markdown-editor";
import { ImageUploadWidget } from "./image-upload-widget";
import type { Project, ProjectStatus } from "@/data/content";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { X, Plus, AlertCircle, CheckCircle2 } from "lucide-react";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80";

const statusLabelSuggestions: Record<ProjectStatus, string> = {
  "case-study": "Case study · Full design & architecture",
  live: "Live demo · Shipped production app",
  github: "Open source · Public repository",
  "in-progress": "In progress · Active development",
};

interface ProjectFormProps {
  mode: "create" | "edit";
  initial?: Project;
}

function decodeEntities(str: string = ""): string {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function ProjectForm({ mode, initial }: ProjectFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [id, setId] = useState(initial?.id ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [problem, setProblem] = useState(initial?.problem ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [outcome, setOutcome] = useState(initial?.outcome ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [newTag, setNewTag] = useState("");
  const [image, setImage] = useState(initial?.image ?? DEFAULT_IMAGE);
  const [liveUrl, setLiveUrl] = useState(initial?.liveUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(initial?.githubUrl ?? "");
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? "case-study");
  const [statusLabel, setStatusLabel] = useState(initial?.statusLabel ?? "Case study · UI + data model");
  const [featured, setFeatured] = useState(initial?.featured ?? true);
  const [year, setYear] = useState(initial?.year ?? new Date().getFullYear().toString());
  const [published, setPublished] = useState(initial?.published ?? true);
  const [appreciations] = useState(initial?.appreciations ?? 0);
  // Extended case study fields
  const [architecture, setArchitecture] = useState(decodeEntities(initial?.architecture ?? ""));
  const [implementation, setImplementation] = useState(decodeEntities(initial?.implementation ?? ""));
  const [results, setResults] = useState(decodeEntities(initial?.results ?? ""));
  const [contribution, setContribution] = useState(decodeEntities(initial?.contribution ?? ""));
  const [challenges, setChallenges] = useState(decodeEntities(initial?.challenges ?? ""));
  const [privateExplanation, setPrivateExplanation] = useState(decodeEntities(initial?.privateExplanation ?? ""));

  const [previewMarkdown, setPreviewMarkdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "create" && !initial) {
      setStatusLabel(statusLabelSuggestions[status]);
    }
  }, [status, mode, initial]);

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !problem.trim() || !role.trim() || !outcome.trim()) {
      setSaveState("error");
      setError("Please complete all required fields.");
      return;
    }

    setLoading(true);
    setSaveState("saving");
    setError(null);

    const payload = {
      title,
      description,
      problem,
      role,
      outcome,
      tags,
      image: image || undefined,
      liveUrl: liveUrl || undefined,
      githubUrl: githubUrl || undefined,
      status,
      statusLabel,
      featured,
      year,
      published,
      appreciations,
      id: id || undefined,
      architecture: architecture || undefined,
      implementation: implementation || undefined,
      results: results || undefined,
      contribution: contribution || undefined,
      challenges: challenges || undefined,
      privateExplanation: privateExplanation || undefined,
    };

    try {
      const res = await fetch(
        mode === "create" ? "/api/projects" : `/api/projects/${initial?.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = (await res.json()) as {
        error?: string;
        project?: Project;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Save failed");
      }

      setSaveState("saved");
      setTimeout(() => {
        router.push("/admin/projects");
        router.refresh();
      }, 1000);
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {saveState === "saved" && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-300 animate-scale-in">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>Project saved successfully! Redirecting...</span>
        </div>
      )}

      {saveState === "error" && error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400 animate-scale-in">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
          Basic Information
        </h4>

        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label="Project Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Aurora Analytics"
          />
          <div>
            <Input
              label="Project ID / Slug"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="auto-generated-from-title"
              disabled={mode === "edit"}
            />
            {mode === "create" ? (
              <p className="mt-1.5 text-xs text-slate-500">
                Slug behaves as URL path. Cannot be changed after creation.
              </p>
            ) : (
              <p className="mt-1.5 text-xs font-medium text-amber-300/80">
                Slug is fixed after creation and cannot be changed.
              </p>
            )}
          </div>
        </div>

        <Textarea
          label="Description / Pitch"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief elevator pitch describing the application..."
        />
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
          Case Study Breakdown
        </h4>

        <div className="grid gap-5 lg:grid-cols-3">
          <Textarea
            label="Problem Definition"
            required
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="What friction or problem were they facing?"
          />
          <Textarea
            label="Your Contribution"
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="What specifically did you build or architect?"
          />
          <Textarea
            label="Engineering Outcome"
            required
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="What was the result? Use concrete metric claims."
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
          Taxonomy & Metadata
        </h4>

        <div className="grid gap-5 lg:grid-cols-3">
          <Input
            label="Delivery Year"
            required
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 2026"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Project Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none focus:border-accent/40"
            >
              <option value="case-study" className="bg-[#050814]">Case Study</option>
              <option value="live" className="bg-[#050814]">Live Demo</option>
              <option value="github" className="bg-[#050814]">Github Repository</option>
              <option value="in-progress" className="bg-[#050814]">In Progress</option>
            </select>
          </div>

          <Input
            label="Status Detail Text"
            required
            value={statusLabel}
            onChange={(e) => setStatusLabel(e.target.value)}
            placeholder="e.g. Case study · UI + data model"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Project Tags
          </label>
          <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 min-h-[50px] items-center">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-lg bg-accent/20 border border-accent/20 px-2.5 py-1 text-xs text-white"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="rounded-full p-0.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-2 flex-1 min-w-[120px]">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type tag and press enter..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder-slate-600"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
          Links & Imagery
        </h4>

        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label="Live Demo URL (optional)"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Github Repository URL (optional)"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/..."
          />
        </div>

        <ImageUploadWidget
          label="Project Cover Image"
          value={image}
          onChange={setImage}
          type="projects"
          slug={id || "project_cover"}
        />
      </div>

      {/* Extended Case Study Fields */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Deep Case Study Content
            <span className="ml-2 text-xs normal-case font-normal text-slate-600">(shown on individual project pages)</span>
          </h4>
          <button
            type="button"
            onClick={() => setPreviewMarkdown((v) => !v)}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            {previewMarkdown ? "Edit Raw Markdown" : "Live Markdown Preview"}
          </button>
        </div>

        <MarkdownEditor
          label="System Architecture"
          value={architecture}
          rows={6}
          onChange={setArchitecture}
          placeholder="Describe the system design, data flow, and technical architecture..."
        />
        <MarkdownEditor
          label="Implementation Details"
          value={implementation}
          rows={6}
          onChange={setImplementation}
          placeholder="Key technical implementation specifics, libraries used, patterns followed..."
        />
        <MarkdownEditor
          label="Results & Metrics"
          value={results}
          rows={5}
          onChange={setResults}
          placeholder="Measurable outcomes — Lighthouse scores, query times, feature counts..."
        />
        <MarkdownEditor
          label="My Exact Contribution"
          value={contribution}
          rows={5}
          onChange={setContribution}
          placeholder="Specific percentage ownership and which parts were built solo..."
        />
        <MarkdownEditor
          label="Challenges & Lessons Learned"
          value={challenges}
          rows={5}
          onChange={setChallenges}
          placeholder="Key problems encountered and how they were resolved..."
        />
        <Textarea
          label="Private Build Explanation (optional)"
          value={privateExplanation}
          rows={4}
          onChange={(e) => setPrivateExplanation(e.target.value)}
          placeholder="If repo is private, explain why professionally (IP reasons, API keys, etc.)..."
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="featured"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4.5 w-4.5 rounded border-white/20 bg-white/5 text-accent focus:ring-accent"
          />
          <label htmlFor="featured" className="text-sm text-slate-300 select-none cursor-pointer">
            Feature this project on the homepage
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4.5 w-4.5 rounded border-white/20 bg-white/5 text-accent focus:ring-accent"
          />
          <label htmlFor="published" className="text-sm text-slate-300 select-none cursor-pointer">
            Published (visible on public site)
          </label>
        </div>

        {mode === "edit" && (
          <div className="text-xs text-slate-500 font-mono sm:ml-auto">
            Appreciations: <span className="font-semibold text-indigo-300">{appreciations}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-3">
        <Button type="submit" disabled={loading} className="cursor-grow">
          {saveState === "saving" ? "Saving..." : mode === "create" ? "Create project" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/projects")}
          className="cursor-grow"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
