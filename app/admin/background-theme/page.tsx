"use client";

import React, { useEffect, useState } from "react";
import {
  BACKGROUND_THEMES,
  BackgroundThemeId,
} from "@/components/effects/background-theme-provider";
import { Check, Loader2, Monitor, Sparkles } from "lucide-react";

export default function AdminBackgroundThemePage() {
  const [active, setActive] = useState<BackgroundThemeId>("quantum-plasma");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/background-theme", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (d.theme) setActive(d.theme); })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (id: BackgroundThemeId) => {
    setActive(id);
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/background-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: id }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b18] text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30">
              <Monitor className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Background Theme</h1>
              <p className="text-sm text-slate-400">Choose the visual background displayed on the public portfolio site</p>
            </div>
          </div>

          {/* Status bar */}
          <div className="mt-4 flex items-center gap-3">
            {saving && (
              <div className="flex items-center gap-2 text-sm text-amber-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving theme…
              </div>
            )}
            {saved && !saving && (
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <Check className="h-4 w-4" />
                Theme saved & live on site!
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Static Themes Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Static Themes</h2>
                <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-xs text-slate-400">2</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BACKGROUND_THEMES.filter((t) => t.type === "static").map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isActive={active === theme.id}
                    onSelect={handleSelect}
                    disabled={saving}
                  />
                ))}
              </div>
            </div>

            {/* Animated Themes Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-indigo-400">Animated Themes</h2>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-400">3</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {BACKGROUND_THEMES.filter((t) => t.type === "animated").map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isActive={active === theme.id}
                    onSelect={handleSelect}
                    disabled={saving}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        <p className="mt-10 text-xs text-slate-600">
          Changes are saved immediately and reflected live on the public portfolio. Reload the public site to see the new theme.
        </p>
      </div>
    </div>
  );
}

/* ─── Theme Card ─── */
function ThemeCard({
  theme,
  isActive,
  onSelect,
  disabled,
}: {
  theme: typeof BACKGROUND_THEMES[0];
  isActive: boolean;
  onSelect: (id: BackgroundThemeId) => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={() => onSelect(theme.id as BackgroundThemeId)}
      disabled={disabled}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        isActive
          ? "border-indigo-500/70 shadow-[0_0_20px_rgba(99,102,241,0.35)]"
          : "border-white/10 hover:border-white/25 hover:shadow-lg"
      } ${disabled ? "cursor-wait opacity-60" : "cursor-pointer"}`}
    >
      {/* Preview swatch */}
      <div
        className="h-28 w-full transition-all duration-300 group-hover:scale-[1.02] relative overflow-hidden"
        style={{ background: theme.preview }}
      >
        {/* Animated shimmer for animated themes */}
        {theme.type === "animated" && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
        )}
        {/* Active checkmark badge */}
        {isActive && (
          <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.7)]">
            <Check className="h-4 w-4 text-white" />
          </div>
        )}
        {/* Type badge */}
        <div className={`absolute bottom-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${
          theme.type === "animated"
            ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/40"
            : "bg-slate-700/60 text-slate-300 border border-white/10"
        }`}>
          {theme.type === "animated" ? "✨ Animated" : "📷 Static"}
        </div>
      </div>

      {/* Info */}
      <div className={`p-4 ${isActive ? "bg-indigo-950/30" : "bg-white/[0.03]"}`}>
        <p className={`text-sm font-semibold ${isActive ? "text-indigo-200" : "text-white"}`}>
          {theme.label}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {theme.description}
        </p>
      </div>

      {/* Active glow border */}
      {isActive && (
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-indigo-500/40 pointer-events-none" />
      )}
    </button>
  );
}
