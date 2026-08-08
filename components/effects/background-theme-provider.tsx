"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ThemeDeepSpaceNebula,
  ThemeMidnightAurora,
  ThemeQuantumPlasma,
  ThemeMatrixRain,
  ThemeCosmicFireflies,
} from "@/components/effects/background-themes";

import { useThemeMode } from "@/components/effects/theme-mode-provider";

export type BackgroundThemeId =
  | "deep-space-nebula"
  | "midnight-aurora"
  | "quantum-plasma"
  | "matrix-rain"
  | "cosmic-fireflies";

export interface BackgroundThemeDef {
  id: BackgroundThemeId;
  label: string;
  type: "static" | "animated";
  description: string;
  preview: string; // gradient CSS string for admin preview
}

export const BACKGROUND_THEMES: BackgroundThemeDef[] = [
  {
    id: "deep-space-nebula",
    label: "Deep Space Nebula",
    type: "static",
    description: "Dark deep-space atmosphere with blurred indigo/violet nebula orbs and a subtle star field.",
    preview: "linear-gradient(135deg, #030511 0%, #1a1a4e 50%, #0a0a1a 100%)",
  },
  {
    id: "midnight-aurora",
    label: "Midnight Aurora",
    type: "static",
    description: "Northern lights aurora borealis with emerald and teal ribbons across a midnight sky.",
    preview: "linear-gradient(135deg, #010a08 0%, #0d3d2a 40%, #051520 80%, #020808 100%)",
  },
  {
    id: "quantum-plasma",
    label: "Quantum Plasma",
    type: "animated",
    description: "Interactive plasma cursor halo, magnetic particle field, spark trails, and aurora wave ribbons.",
    preview: "linear-gradient(135deg, #030511 0%, #1a0a3a 40%, #0a1a2a 100%)",
  },
  {
    id: "matrix-rain",
    label: "Matrix Rain",
    type: "animated",
    description: "Cascading Japanese katakana & alphanumeric characters falling in neon green — hacker aesthetic.",
    preview: "linear-gradient(135deg, #000000 0%, #001a00 50%, #000800 100%)",
  },
  {
    id: "cosmic-fireflies",
    label: "Cosmic Fireflies",
    type: "animated",
    description: "Glowing cyan-violet fireflies floating through a dark cosmos with constellation connections.",
    preview: "linear-gradient(135deg, #080b1a 0%, #0a0e25 50%, #060810 100%)",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Context
───────────────────────────────────────────────────────────────────────────── */
interface BgThemeCtx {
  activeTheme: BackgroundThemeId;
  setActiveTheme: (id: BackgroundThemeId) => void;
}

const BgThemeContext = createContext<BgThemeCtx>({
  activeTheme: "quantum-plasma",
  setActiveTheme: () => {},
});

export function BackgroundThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeTheme, setActiveThemeState] = useState<BackgroundThemeId>("quantum-plasma");

  useEffect(() => {
    // Load active theme from API
    fetch("/api/admin/background-theme", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.theme && BACKGROUND_THEMES.find((t) => t.id === data.theme)) {
          setActiveThemeState(data.theme as BackgroundThemeId);
        }
      })
      .catch(() => {});

    // Also load from localStorage for instant render
    try {
      const saved = localStorage.getItem("bg_theme");
      if (saved && BACKGROUND_THEMES.find((t) => t.id === saved)) {
        setActiveThemeState(saved as BackgroundThemeId);
      }
    } catch {}
  }, []);

  const setActiveTheme = (id: BackgroundThemeId) => {
    setActiveThemeState(id);
    try { localStorage.setItem("bg_theme", id); } catch {}
  };

  return (
    <BgThemeContext.Provider value={{ activeTheme, setActiveTheme }}>
      {children}
    </BgThemeContext.Provider>
  );
}

export function useBgTheme() {
  return useContext(BgThemeContext);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Day Mode Ambient Background
───────────────────────────────────────────────────────────────────────────── */
export function DayModeAmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]" />
      <div className="absolute -top-40 -left-20 h-[700px] w-[700px] rounded-full bg-indigo-200/40 blur-[130px] animate-glass-blob-1" />
      <div className="absolute top-1/4 -right-20 h-[600px] w-[600px] rounded-full bg-sky-200/50 blur-[120px] animate-glass-blob-2" />
      <div className="absolute bottom-10 left-1/3 h-[500px] w-[500px] rounded-full bg-violet-200/35 blur-[110px] animate-glass-blob-3" />
      <div className="absolute top-1/2 left-10 h-[400px] w-[400px] rounded-full bg-blue-100/50 blur-[90px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_30%,black,transparent)]" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Renderer — picks the active theme component based on Day/Night theme mode
───────────────────────────────────────────────────────────────────────────── */
export function BackgroundThemeRenderer() {
  const { activeTheme } = useBgTheme();
  const { theme } = useThemeMode();

  if (theme === "light") {
    return <DayModeAmbientBackground />;
  }

  switch (activeTheme) {
    case "deep-space-nebula": return <ThemeDeepSpaceNebula />;
    case "midnight-aurora":   return <ThemeMidnightAurora />;
    case "matrix-rain":       return <ThemeMatrixRain />;
    case "cosmic-fireflies":  return <ThemeCosmicFireflies />;
    case "quantum-plasma":
    default:                  return <ThemeQuantumPlasma />;
  }
}
