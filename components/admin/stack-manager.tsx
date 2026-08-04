"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SkillCategory } from "@/data/content";
import { AlertCircle, CheckCircle2, Plus, Save, Trash2, X, ArrowUp, ArrowDown } from "lucide-react";
import { FormEvent, useState } from "react";

interface StackManagerProps {
  initialSkills: SkillCategory[];
}

export function StackManager({ initialSkills }: StackManagerProps) {
  const [categories, setCategories] = useState<SkillCategory[]>(initialSkills);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [newSkillInputs, setNewSkillInputs] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleCategoryTitleChange = (index: number, title: string) => {
    const next = [...categories];
    next[index] = { ...next[index], title };
    setCategories(next);
  };

  const handleAddCategory = () => {
    const title = newCategoryTitle.trim();
    if (!title) return;
    setCategories([...categories, { title, skills: [] }]);
    setNewCategoryTitle("");
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleMoveCategory = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setCategories(next);
  };

  const handleAddSkill = (categoryIndex: number) => {
    const skillText = (newSkillInputs[categoryIndex] || "").trim();
    if (!skillText) return;

    const next = [...categories];
    if (!next[categoryIndex].skills.includes(skillText)) {
      next[categoryIndex] = {
        ...next[categoryIndex],
        skills: [...next[categoryIndex].skills, skillText],
      };
      setCategories(next);
    }
    setNewSkillInputs((prev) => ({ ...prev, [categoryIndex]: "" }));
  };

  const handleRemoveSkill = (categoryIndex: number, skillToRemove: string) => {
    const next = [...categories];
    next[categoryIndex] = {
      ...next[categoryIndex],
      skills: next[categoryIndex].skills.filter((s) => s !== skillToRemove),
    };
    setCategories(next);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaveState("saving");
    setError(null);

    try {
      const res = await fetch("/api/admin/stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categories),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save skills stack");
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("an_skills_data", JSON.stringify(categories));
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
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Tech Stack & Tools Manager</h2>
          <p className="mt-1 text-sm text-slate-400">
            Customize technology categories and skill tags displayed on your public stack section.
          </p>
        </div>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save Tech Stack"}
        </Button>
      </div>

      {saveState === "saved" && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>Tech stack categories updated successfully! Public site revalidated.</span>
        </div>
      )}

      {saveState === "error" && error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add New Category Control */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
        <Input
          placeholder="New Category Title (e.g. Delivery & DevOps)"
          value={newCategoryTitle}
          onChange={(e) => setNewCategoryTitle(e.target.value)}
          className="flex-1"
        />
        <Button type="button" variant="secondary" onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-1" />
          Add Category
        </Button>
      </div>

      {/* Stack Categories */}
      <div className="space-y-6">
        {categories.map((cat, catIdx) => (
          <div
            key={catIdx}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-xs font-mono font-bold text-accent-soft">
                  #{catIdx + 1}
                </span>
                <Input
                  value={cat.title}
                  onChange={(e) => handleCategoryTitleChange(catIdx, e.target.value)}
                  placeholder="Category Title"
                />
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveCategory(catIdx, "up")}
                  disabled={catIdx === 0}
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveCategory(catIdx, "down")}
                  disabled={catIdx === categories.length - 1}
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(catIdx)}
                  className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 transition"
                  title="Delete Category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Skill Tags List */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Skills & Tool Badges ({cat.skills.length})
              </label>
              <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 min-h-[50px] items-center">
                {cat.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent/20 border border-accent/30 px-3 py-1 text-xs font-medium text-white"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(catIdx, skill)}
                      className="rounded-full p-0.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}

                <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                  <input
                    type="text"
                    value={newSkillInputs[catIdx] || ""}
                    onChange={(e) =>
                      setNewSkillInputs((prev) => ({ ...prev, [catIdx]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill(catIdx);
                      }
                    }}
                    placeholder="Type skill tag & press Enter..."
                    className="w-full bg-transparent text-xs text-white outline-none placeholder-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(catIdx)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </form>
  );
}
