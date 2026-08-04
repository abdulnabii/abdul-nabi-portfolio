"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AboutData } from "@/lib/settings-store";
import { AlertCircle, CheckCircle2, Plus, Save, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { FormEvent, useState } from "react";

interface AboutManagerProps {
  initialAbout: AboutData;
}

export function AboutManager({ initialAbout }: AboutManagerProps) {
  const [about, setAbout] = useState<AboutData>(initialAbout);
  const [loading, setLoading] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleParagraphChange = (index: number, val: string) => {
    const next = [...about.paragraphs];
    next[index] = val;
    setAbout((prev) => ({ ...prev, paragraphs: next }));
  };

  const handleAddParagraph = () => {
    setAbout((prev) => ({
      ...prev,
      paragraphs: [...prev.paragraphs, ""],
    }));
  };

  const handleRemoveParagraph = (index: number) => {
    setAbout((prev) => ({
      ...prev,
      paragraphs: prev.paragraphs.filter((_, i) => i !== index),
    }));
  };

  const handleMoveParagraph = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= about.paragraphs.length) return;
    const next = [...about.paragraphs];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setAbout((prev) => ({ ...prev, paragraphs: next }));
  };

  const handleStatChange = (index: number, field: "label" | "value", val: string) => {
    const next = [...about.stats];
    next[index] = { ...next[index], [field]: val };
    setAbout((prev) => ({ ...prev, stats: next }));
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaveState("saving");
    setError(null);

    try {
      const res = await fetch("/api/admin/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(about),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save about content");
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("an_about_data", JSON.stringify(about));
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
          <h2 className="text-2xl font-semibold text-white">About Bio & Stat Cards</h2>
          <p className="mt-1 text-sm text-slate-400">
            Edit the multi-paragraph biography and the 3 spotlight metrics on your About section.
          </p>
        </div>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save About Content"}
        </Button>
      </div>

      {saveState === "saved" && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>About section updated successfully! Public site revalidated.</span>
        </div>
      )}

      {saveState === "error" && error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
          Section Title
        </h3>
        <Input
          label="About Heading"
          value={about.title}
          onChange={(e) => setAbout((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="e.g. About"
        />
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Biography Paragraphs ({about.paragraphs.length})
          </h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddParagraph}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Paragraph
          </Button>
        </div>

        <div className="space-y-4">
          {about.paragraphs.map((para, idx) => (
            <div key={idx} className="flex gap-3 items-start rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-mono font-bold text-slate-300">
                {idx + 1}
              </span>
              <div className="flex-1">
                <Textarea
                  value={para}
                  rows={3}
                  onChange={(e) => handleParagraphChange(idx, e.target.value)}
                  placeholder={`Paragraph ${idx + 1}...`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveParagraph(idx, "up")}
                  disabled={idx === 0}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveParagraph(idx, "down")}
                  disabled={idx === about.paragraphs.length - 1}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveParagraph(idx)}
                  className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 transition"
                  title="Delete Paragraph"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
          Spotlight Stat Cards (3 Cards)
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          {about.stats.map((stat, idx) => (
            <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Stat #{idx + 1}
              </p>
              <Input
                label="Label"
                value={stat.label}
                onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                placeholder="e.g. Primary identity"
              />
              <Input
                label="Value Claim"
                value={stat.value}
                onChange={(e) => handleStatChange(idx, "value", e.target.value)}
                placeholder="e.g. FS Dev + AppSec"
              />
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
