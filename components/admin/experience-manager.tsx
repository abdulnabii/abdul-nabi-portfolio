"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ExperienceItem, EducationItem } from "@/data/content";
import { AlertCircle, CheckCircle2, Plus, Save, Trash2, ArrowUp, ArrowDown, Briefcase, GraduationCap, X } from "lucide-react";
import { FormEvent, useState } from "react";

interface ExperienceManagerProps {
  initialExperience: ExperienceItem[];
  initialEducation: EducationItem[];
}

export function ExperienceManager({
  initialExperience,
  initialEducation,
}: ExperienceManagerProps) {
  const [activeTab, setActiveTab] = useState<"experience" | "education">("experience");
  const [experience, setExperience] = useState<ExperienceItem[]>(initialExperience);
  const [education, setEducation] = useState<EducationItem[]>(initialEducation);

  const [loading, setLoading] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Experience handlers
  const handleExpChange = (index: number, field: keyof ExperienceItem, value: any) => {
    const next = [...experience];
    next[index] = { ...next[index], [field]: value };
    setExperience(next);
  };

  const handleAddExpHighlight = (expIdx: number, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const next = [...experience];
    next[expIdx] = {
      ...next[expIdx],
      highlights: [...next[expIdx].highlights, trimmed],
    };
    setExperience(next);
  };

  const handleRemoveExpHighlight = (expIdx: number, hlIdx: number) => {
    const next = [...experience];
    next[expIdx] = {
      ...next[expIdx],
      highlights: next[expIdx].highlights.filter((_, i) => i !== hlIdx),
    };
    setExperience(next);
  };

  const handleAddExperienceItem = () => {
    const newItem: ExperienceItem = {
      id: "exp_" + Date.now(),
      role: "Full-Stack Engineer",
      company: "Company Name",
      location: "Remote / Larkana",
      period: "2026 – Present",
      description: "Brief role summary...",
      highlights: ["Built key features using Next.js and TypeScript."],
    };
    setExperience([newItem, ...experience]);
  };

  const handleRemoveExp = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleMoveExp = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= experience.length) return;
    const next = [...experience];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setExperience(next);
  };

  // Education handlers
  const handleEduChange = (index: number, field: keyof EducationItem, value: any) => {
    const next = [...education];
    next[index] = { ...next[index], [field]: value };
    setEducation(next);
  };

  const handleAddEduHighlight = (eduIdx: number, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const next = [...education];
    const highlights = next[eduIdx].highlights || [];
    next[eduIdx] = {
      ...next[eduIdx],
      highlights: [...highlights, trimmed],
    };
    setEducation(next);
  };

  const handleRemoveEduHighlight = (eduIdx: number, hlIdx: number) => {
    const next = [...education];
    const highlights = next[eduIdx].highlights || [];
    next[eduIdx] = {
      ...next[eduIdx],
      highlights: highlights.filter((_, i) => i !== hlIdx),
    };
    setEducation(next);
  };

  const handleAddEducationItem = () => {
    const newItem: EducationItem = {
      id: "edu_" + Date.now(),
      degree: "B.S. Computer Science / Software Engineering",
      institution: "University / Institute Name",
      location: "Location",
      period: "2022 – 2026",
      description: "Field of study and focus areas...",
      highlights: ["Graduated with distinction."],
    };
    setEducation([newItem, ...education]);
  };

  const handleRemoveEdu = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleMoveEdu = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= education.length) return;
    const next = [...education];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setEducation(next);
  };

  // Save current active tab
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaveState("saving");
    setError(null);

    try {
      const endpoint = activeTab === "experience" ? "/api/admin/experience" : "/api/admin/education";
      const payload = activeTab === "experience" ? experience : education;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to save ${activeTab}`);
      }

      if (typeof window !== "undefined") {
        try {
          if (activeTab === "experience") {
            localStorage.setItem("an_experience_data", JSON.stringify(experience));
          } else {
            localStorage.setItem("an_education_data", JSON.stringify(education));
          }
        } catch {}
      }

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Experience & Education Manager</h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage your career history, job entries, role responsibilities, and education milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/5">
            <button
              type="button"
              onClick={() => setActiveTab("experience")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition ${
                activeTab === "experience"
                  ? "bg-accent/20 text-white border border-accent/20"
                  : "text-slate-400 border border-transparent hover:text-white"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              Experience ({experience.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("education")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition ${
                activeTab === "education"
                  ? "bg-accent/20 text-white border border-accent/20"
                  : "text-slate-400 border border-transparent hover:text-white"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Education ({education.length})
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : `Save ${activeTab === "experience" ? "Experience" : "Education"}`}
          </Button>
        </div>
      </div>

      {saveState === "saved" && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>{activeTab === "experience" ? "Experience" : "Education"} entries saved successfully! Public site revalidated.</span>
        </div>
      )}

      {saveState === "error" && error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* EXPERIENCE TAB */}
      {activeTab === "experience" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={handleAddExperienceItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add Job Entry
            </Button>
          </div>

          {experience.map((item, idx) => (
            <div key={item.id || idx} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  Job Entry #{idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveExp(idx, "up")}
                    disabled={idx === 0}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveExp(idx, "down")}
                    disabled={idx === experience.length - 1}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveExp(idx)}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 transition"
                    title="Delete Entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Role / Title"
                  value={item.role}
                  onChange={(e) => handleExpChange(idx, "role", e.target.value)}
                  placeholder="e.g. Full-Stack Developer"
                />
                <Input
                  label="Company / Organization"
                  value={item.company}
                  onChange={(e) => handleExpChange(idx, "company", e.target.value)}
                  placeholder="e.g. Company Name"
                />
                <Input
                  label="Date Range / Period"
                  value={item.period}
                  onChange={(e) => handleExpChange(idx, "period", e.target.value)}
                  placeholder="e.g. 2026 – Present"
                />
                <Input
                  label="Location (Remote / On-site)"
                  value={item.location}
                  onChange={(e) => handleExpChange(idx, "location", e.target.value)}
                  placeholder="e.g. Remote · Larkana, Pakistan"
                />
              </div>

              <Textarea
                label="Role Description"
                value={item.description}
                rows={3}
                onChange={(e) => handleExpChange(idx, "description", e.target.value)}
                placeholder="High-level description of responsibilities..."
              />

              {/* Highlights Bullet Points */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Key Achievements / Bullet Points ({item.highlights.length})
                </label>
                <div className="space-y-2">
                  {item.highlights.map((hl, hlIdx) => (
                    <div key={hlIdx} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0 ml-1" />
                      <input
                        type="text"
                        value={hl}
                        onChange={(e) => {
                          const nextHl = [...item.highlights];
                          nextHl[hlIdx] = e.target.value;
                          handleExpChange(idx, "highlights", nextHl);
                        }}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-2 text-xs text-white outline-none focus:border-accent/40"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExpHighlight(idx, hlIdx)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      id={`new_hl_${idx}`}
                      placeholder="Add bullet point & press Enter..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value;
                          handleAddExpHighlight(idx, val);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-2 text-xs text-white placeholder-slate-600 outline-none focus:border-accent/40"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDUCATION TAB */}
      {activeTab === "education" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={handleAddEducationItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add Education Entry
            </Button>
          </div>

          {education.map((item, idx) => (
            <div key={item.id || idx} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  Education Entry #{idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveEdu(idx, "up")}
                    disabled={idx === 0}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveEdu(idx, "down")}
                    disabled={idx === education.length - 1}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveEdu(idx)}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 transition"
                    title="Delete Entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Degree / Course Title"
                  value={item.degree}
                  onChange={(e) => handleEduChange(idx, "degree", e.target.value)}
                  placeholder="e.g. B.S. Software Engineering"
                />
                <Input
                  label="Institution / University"
                  value={item.institution}
                  onChange={(e) => handleEduChange(idx, "institution", e.target.value)}
                  placeholder="e.g. University Name"
                />
                <Input
                  label="Date Range / Period"
                  value={item.period}
                  onChange={(e) => handleEduChange(idx, "period", e.target.value)}
                  placeholder="e.g. 2022 – 2026"
                />
                <Input
                  label="Location"
                  value={item.location}
                  onChange={(e) => handleEduChange(idx, "location", e.target.value)}
                  placeholder="e.g. Larkana, Pakistan"
                />
              </div>

              <Textarea
                label="Summary / Focus Areas"
                value={item.description}
                rows={3}
                onChange={(e) => handleEduChange(idx, "description", e.target.value)}
                placeholder="Field of study overview..."
              />

              {/* Highlights Bullet Points */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Key Coursework / Achievements ({(item.highlights || []).length})
                </label>
                <div className="space-y-2">
                  {(item.highlights || []).map((hl, hlIdx) => (
                    <div key={hlIdx} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan shrink-0 ml-1" />
                      <input
                        type="text"
                        value={hl}
                        onChange={(e) => {
                          const nextHl = [...(item.highlights || [])];
                          nextHl[hlIdx] = e.target.value;
                          handleEduChange(idx, "highlights", nextHl);
                        }}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-2 text-xs text-white outline-none focus:border-accent/40"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveEduHighlight(idx, hlIdx)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add highlight & press Enter..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value;
                          handleAddEduHighlight(idx, val);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-2 text-xs text-white placeholder-slate-600 outline-none focus:border-accent/40"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}
