"use client";

import { useEffect, useState } from "react";
import type { SectionVisibility } from "@/lib/settings-store";

const SECTIONS: { key: keyof SectionVisibility; label: string; icon: string; description: string }[] = [
  { key: "hero", label: "Hero / Banner", icon: "🏠", description: "Main header with name, tagline, and CTA buttons" },
  { key: "about", label: "About", icon: "👤", description: "Biography and personal stats section" },
  { key: "skills", label: "Tech Stack", icon: "⚡", description: "Skills and technology stack display" },
  { key: "projects", label: "Featured Projects", icon: "🚀", description: "Featured project showcase cards" },
  { key: "miniProjects", label: "Mini Projects", icon: "🧪", description: "Interactive mini tools & live demo links" },
  { key: "experience", label: "Experience", icon: "💼", description: "Work experience and career timeline" },
  { key: "education", label: "Education", icon: "🎓", description: "Academic background and degrees" },
  { key: "certifications", label: "Certifications Wall", icon: "🏅", description: "Verified coursework and certificate credentials" },
  { key: "achievements", label: "Achievements", icon: "🏆", description: "Milestone badges and achievement wall" },
  { key: "process", label: "How I Work (Process)", icon: "🔄", description: "4-step engineering workflow & deliverables" },
  { key: "testimonials", label: "Testimonials & Reviews", icon: "⭐", description: "Social proof cards and client recommendations" },
  { key: "games", label: "Mini Games", icon: "🎮", description: "Interactive playable games section" },
  { key: "blog", label: "Blog Preview", icon: "📝", description: "Latest blog post previews on home page" },
  { key: "contact", label: "Contact", icon: "📬", description: "Contact form and social links" },
  { key: "themeToggle", label: "Day / Night Theme Switcher", icon: "☀️🌙", description: "Allow public website visitors to toggle between Day & Night modes" },
];

const DEFAULT_VISIBILITY: SectionVisibility = {
  hero: true, about: true, skills: true, projects: true, miniProjects: true,
  experience: true, education: true, certifications: true, process: true, testimonials: true,
  blog: true, games: true, achievements: true, contact: true, themeToggle: true,
};

export function SectionsManager() {
  const [visibility, setVisibility] = useState<SectionVisibility>(DEFAULT_VISIBILITY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/sections")
      .then((r) => r.json())
      .then((d) => { if (d.visibility) setVisibility({ ...DEFAULT_VISIBILITY, ...d.visibility }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: keyof SectionVisibility) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visibility),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { }
    setSaving(false);
  };

  const enableAll = () => {
    const all = Object.fromEntries(SECTIONS.map((s) => [s.key, true])) as unknown as SectionVisibility;
    setVisibility(all);
    setSaved(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const enabledCount = Object.values(visibility).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Section Visibility</h2>
          <p className="mt-1 text-sm text-slate-400">
            Toggle sections on/off. Changes apply instantly to the public site.{" "}
            <span className="text-indigo-400">{enabledCount}/{SECTIONS.length} enabled</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={enableAll}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition"
          >
            Enable All
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl border border-indigo-500/40 bg-indigo-500/20 px-5 py-2 text-sm font-medium text-indigo-200 hover:bg-indigo-500/30 transition disabled:opacity-50"
          >
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SECTIONS.map((section) => {
          const on = visibility[section.key];
          return (
            <div
              key={section.key}
              className={`flex items-center justify-between rounded-2xl border p-4 transition-all duration-200 ${
                on
                  ? "border-indigo-500/30 bg-indigo-500/5"
                  : "border-white/5 bg-white/[0.02] opacity-60"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0">{section.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{section.label}</p>
                  <p className="text-xs text-slate-500 truncate">{section.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggle(section.key)}
                className={`relative ml-4 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                  on ? "bg-indigo-500 border-indigo-400" : "bg-slate-700 border-slate-600"
                }`}
                role="switch"
                aria-checked={on}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out mt-0.5 ${
                    on ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-600">
        Note: Disabling the Hero section will hide the main banner. The Contact section controls the footer form.
      </p>
    </div>
  );
}
