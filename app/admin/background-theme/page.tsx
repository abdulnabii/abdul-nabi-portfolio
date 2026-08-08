"use client";

import React, { useEffect, useState } from "react";
import {
  NIGHT_BACKGROUND_THEMES,
  DAY_BACKGROUND_THEMES,
  NightThemeId,
  DayThemeId,
  BackgroundThemeDef,
} from "@/components/effects/background-theme-provider";
import { Check, Loader2, Monitor, Moon, Sun } from "lucide-react";

export default function AdminBackgroundThemePage() {
  const [activeNight, setActiveNight] = useState<NightThemeId>("quantum-plasma");
  const [activeDay, setActiveDay] = useState<DayThemeId>("day-sunrise-dawn");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/background-theme", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.nightTheme) setActiveNight(d.nightTheme);
        else if (d.theme) setActiveNight(d.theme);
        if (d.dayTheme) setActiveDay(d.dayTheme);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectNight = async (id: NightThemeId) => {
    setActiveNight(id);
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/background-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nightTheme: id, dayTheme: activeDay }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectDay = async (id: DayThemeId) => {
    setActiveDay(id);
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/background-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nightTheme: activeNight, dayTheme: id }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b18] text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30">
              <Monitor className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Background Themes (Night & Day Mode)</h1>
              <p className="text-sm text-slate-400">Configure visual themes for both Night (Dark) and Day (Light) modes on the public site</p>
            </div>
          </div>

          {/* Status bar */}
          <div className="mt-4 flex items-center gap-3">
            {saving && (
              <div className="flex items-center gap-2 text-sm text-amber-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving theme choices…
              </div>
            )}
            {saved && !saving && (
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <Check className="h-4 w-4" />
                Themes saved & live on site!
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
        ) : (
          <div className="space-y-12">
            {/* 🌙 Night Mode Themes */}
            <div className="rounded-3xl border border-indigo-500/20 bg-indigo-950/10 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-indigo-500/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-amber-300">
                    <Moon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">🌙 Night Mode Themes (Dark Site)</h2>
                    <p className="text-xs text-slate-400">Active when public site is in Night Mode</p>
                  </div>
                </div>
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 border border-indigo-500/30">
                  5 Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {NIGHT_BACKGROUND_THEMES.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isActive={activeNight === theme.id}
                    onSelect={(id) => handleSelectNight(id as NightThemeId)}
                    disabled={saving}
                  />
                ))}
              </div>
            </div>

            {/* ☀️ Day Mode Themes */}
            <div className="rounded-3xl border border-amber-500/20 bg-amber-950/10 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                    <Sun className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">☀️ Day Mode Themes (Light Site)</h2>
                    <p className="text-xs text-slate-400">Active when public site is in Day Mode</p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300 border border-amber-500/30">
                  6 Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DAY_BACKGROUND_THEMES.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isActive={activeDay === theme.id}
                    onSelect={(id) => handleSelectDay(id as DayThemeId)}
                    disabled={saving}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        <p className="mt-10 text-xs text-slate-500">
          Changes are saved immediately and updated in real-time. The admin panel maintains its dedicated dark interface and is unaffected by public theme toggles.
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
  theme: BackgroundThemeDef;
  isActive: boolean;
  onSelect: (id: string) => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={() => onSelect(theme.id)}
      disabled={disabled}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        isActive
          ? "border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.3)] bg-amber-950/20"
          : "border-white/10 hover:border-white/25 hover:shadow-lg bg-white/[0.02]"
      } ${disabled ? "cursor-wait opacity-60" : "cursor-pointer"}`}
    >
      {/* Preview swatch */}
      <div
        className="h-28 w-full transition-all duration-300 group-hover:scale-[1.02] relative overflow-hidden"
        style={{ background: theme.preview }}
      >
        {/* Active checkmark badge */}
        {isActive && (
          <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-bold shadow-lg">
            <Check className="h-4 w-4 stroke-[3]" />
          </div>
        )}
        {/* Type badge */}
        <div className={`absolute bottom-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-medium backdrop-blur-md ${
          theme.type === "animated"
            ? "bg-amber-500/30 text-amber-200 border border-amber-500/40"
            : theme.type === "minimal"
            ? "bg-slate-800/80 text-slate-300 border border-slate-700"
            : "bg-slate-900/70 text-slate-200 border border-white/20"
        }`}>
          {theme.type === "animated" ? "✨ Animated" : theme.type === "minimal" ? "⚡ Solid Minimal" : "📷 Static"}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className={`text-sm font-semibold ${isActive ? "text-amber-200" : "text-white"}`}>
          {theme.label}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          {theme.description}
        </p>
      </div>

      {/* Active ring */}
      {isActive && (
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-amber-400/50 pointer-events-none" />
      )}
    </button>
  );
}
