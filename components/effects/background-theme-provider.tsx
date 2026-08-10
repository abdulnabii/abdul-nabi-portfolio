"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ThemeDeepSpaceNebula,
  ThemeMidnightAurora,
  ThemeQuantumPlasma,
  ThemeMatrixRain,
  ThemeCosmicFireflies,
  ThemeCyberpunkGrid,
  ThemeEmeraldMatrix,
  ThemeSolarFlare,
  ThemeObsidianGlass,
  ThemeVelvetNight,
  ThemeDaySunriseDawn,
  ThemeDaySkyBreeze,
  ThemeDayMintFresh,
  ThemeDaySunsetPastel,
  ThemeDayCyberLight,
  ThemeDayGoldenHour,
  ThemeDayNordicFrost,
  ThemeDayMinimalTitanium,
} from "@/components/effects/background-themes";

import { useThemeMode } from "@/components/effects/theme-mode-provider";

export type NightThemeId =
  | "deep-space-nebula"
  | "midnight-aurora"
  | "quantum-plasma"
  | "matrix-rain"
  | "cosmic-fireflies"
  | "cyberpunk-grid"
  | "emerald-matrix"
  | "solar-flare"
  | "obsidian-glass"
  | "velvet-night";

export type DayThemeId =
  | "day-sunrise-dawn"
  | "day-sky-breeze"
  | "day-mint-fresh"
  | "day-sunset-pastel"
  | "day-cyber-light"
  | "day-golden-hour"
  | "day-nordic-frost"
  | "day-minimal-titanium"
  | "day-clean-minimal";

export type BackgroundThemeId = NightThemeId | DayThemeId;

export interface BackgroundThemeDef {
  id: BackgroundThemeId;
  label: string;
  type: "static" | "animated" | "minimal";
  mode: "night" | "day";
  description: string;
  preview: string;
}

export const NIGHT_BACKGROUND_THEMES: BackgroundThemeDef[] = [
  {
    id: "quantum-plasma",
    label: "Quantum Plasma",
    mode: "night",
    type: "animated",
    description: "Interactive plasma cursor halo, magnetic particle field, spark trails, and aurora wave ribbons.",
    preview: "linear-gradient(135deg, #030511 0%, #1a0a3a 40%, #0a1a2a 100%)",
  },
  {
    id: "cyberpunk-grid",
    label: "Cyberpunk Synthwave Grid",
    mode: "night",
    type: "animated",
    description: "Holographic synthwave cyber grid floor with floating magenta-cyan data nodes and horizon beam.",
    preview: "linear-gradient(135deg, #070210 0%, #2e0854 50%, #06b6d4 100%)",
  },
  {
    id: "emerald-matrix",
    label: "Emerald Matrix Stream",
    mode: "night",
    type: "animated",
    description: "High-density digital matrix rain & cascading green telemetry nodes with soft emerald glow.",
    preview: "linear-gradient(135deg, #02120a 0%, #041a0f 50%, #10b981 100%)",
  },
  {
    id: "solar-flare",
    label: "Solar Corona Flare",
    mode: "night",
    type: "animated",
    description: "Warm solar corona aura with golden ember sparks floating across a deep volcanic cosmos.",
    preview: "linear-gradient(135deg, #0c0402 0%, #2a0c04 50%, #d97706 100%)",
  },
  {
    id: "matrix-rain",
    label: "Classic Matrix Code Rain",
    mode: "night",
    type: "animated",
    description: "Cascading Japanese katakana & alphanumeric characters falling in neon green — hacker aesthetic.",
    preview: "linear-gradient(135deg, #000000 0%, #001a00 50%, #000800 100%)",
  },
  {
    id: "cosmic-fireflies",
    label: "Cosmic Fireflies",
    mode: "night",
    type: "animated",
    description: "Glowing cyan-violet fireflies floating through a dark cosmos with constellation connections.",
    preview: "linear-gradient(135deg, #080b1a 0%, #0a0e25 50%, #060810 100%)",
  },
  {
    id: "deep-space-nebula",
    label: "Deep Space Nebula",
    mode: "night",
    type: "static",
    description: "Dark deep-space atmosphere with blurred indigo/violet nebula orbs and a subtle star field.",
    preview: "linear-gradient(135deg, #030511 0%, #1a1a4e 50%, #0a0a1a 100%)",
  },
  {
    id: "midnight-aurora",
    label: "Midnight Aurora",
    mode: "night",
    type: "static",
    description: "Northern lights aurora borealis with emerald and teal ribbons across a midnight sky.",
    preview: "linear-gradient(135deg, #010a08 0%, #0d3d2a 40%, #051520 80%, #020808 100%)",
  },
  {
    id: "obsidian-glass",
    label: "Obsidian Minimal Glass",
    mode: "night",
    type: "static",
    description: "Minimalist obsidian dark backdrop with dark indigo glass ambient orbs and fine geometry lines.",
    preview: "linear-gradient(135deg, #05060b 0%, #0f172a 50%, #020617 100%)",
  },
  {
    id: "velvet-night",
    label: "Velvet Violet Night",
    mode: "night",
    type: "static",
    description: "Deep midnight-violet velvet dark theme with soft radial ambient purple lighting.",
    preview: "linear-gradient(135deg, #0c061a 0%, #2e1065 50%, #1e1b4b 100%)",
  },
];

export const DAY_BACKGROUND_THEMES: BackgroundThemeDef[] = [
  {
    id: "day-sunrise-dawn",
    label: "Sunrise Dawn",
    mode: "day",
    type: "animated",
    description: "Warm golden morning sunbeam flares, peach clouds, and rising amber sun dust.",
    preview: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #f8fafc 100%)",
  },
  {
    id: "day-golden-hour",
    label: "Golden Hour Amber",
    mode: "day",
    type: "animated",
    description: "Luminous warm amber & honey gold daylight gradient with floating golden dust particles.",
    preview: "linear-gradient(135deg, #fffbeb 0%, #fde68a 50%, #fbbf24 100%)",
  },
  {
    id: "day-nordic-frost",
    label: "Nordic Arctic Frost",
    mode: "day",
    type: "animated",
    description: "Crisp ice-blue & icy cyan glass aesthetic with drifting crystalline frost particles.",
    preview: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #99f6e4 100%)",
  },
  {
    id: "day-sky-breeze",
    label: "Sky Blue Breeze",
    mode: "day",
    type: "animated",
    description: "Azure blue sky atmosphere with floating cloud orbs and gentle drifting breeze particles.",
    preview: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)",
  },
  {
    id: "day-mint-fresh",
    label: "Fresh Mint Garden",
    mode: "day",
    type: "animated",
    description: "Lush spring mint & teal ambient glass gradient with floating organic leaf-green particles.",
    preview: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #f8fafc 100%)",
  },
  {
    id: "day-sunset-pastel",
    label: "Sunset Pastel Glow",
    mode: "day",
    type: "animated",
    description: "Soft lavender, peach, and coral pastel gradient with dreamlike sparkle particles.",
    preview: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #fff1f2 100%)",
  },
  {
    id: "day-cyber-light",
    label: "Cyber Light Matrix",
    mode: "day",
    type: "animated",
    description: "Crisp light-gray background with a subtle slate technical grid and floating data nodes.",
    preview: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)",
  },
  {
    id: "day-minimal-titanium",
    label: "Minimal Titanium Silver",
    mode: "day",
    type: "minimal",
    description: "Professional corporate titanium silver light background with subtle slate accent grid lines.",
    preview: "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 50%, #e2e8f0 100%)",
  },
  {
    id: "day-clean-minimal",
    label: "Solid Minimal (No Effect)",
    mode: "day",
    type: "minimal",
    description: "Clean solid daylight background (#f8fafc) without any animated canvas or background themes.",
    preview: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  },
];

export const BACKGROUND_THEMES: BackgroundThemeDef[] = [
  ...NIGHT_BACKGROUND_THEMES,
  ...DAY_BACKGROUND_THEMES,
];

interface BgThemeCtx {
  nightTheme: NightThemeId;
  dayTheme: DayThemeId;
  setNightTheme: (id: NightThemeId) => void;
  setDayTheme: (id: DayThemeId) => void;
}

const BgThemeContext = createContext<BgThemeCtx>({
  nightTheme: "quantum-plasma",
  dayTheme: "day-sunrise-dawn",
  setNightTheme: () => {},
  setDayTheme: () => {},
});

export function BackgroundThemeProvider({ children }: { children: React.ReactNode }) {
  const [nightTheme, setNightThemeState] = useState<NightThemeId>("quantum-plasma");
  const [dayTheme, setDayThemeState] = useState<DayThemeId>("day-sunrise-dawn");

  const syncServerTheme = async () => {
    try {
      const res = await fetch(`/api/admin/background-theme?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        const nTheme = data?.nightTheme || data?.theme;
        if (nTheme && NIGHT_BACKGROUND_THEMES.some((t) => t.id === nTheme)) {
          setNightThemeState(nTheme as NightThemeId);
          try { localStorage.setItem("bg_theme_night", nTheme); } catch {}
        }
        if (data?.dayTheme && DAY_BACKGROUND_THEMES.some((t) => t.id === data.dayTheme)) {
          setDayThemeState(data.dayTheme as DayThemeId);
          try { localStorage.setItem("bg_theme_day", data.dayTheme); } catch {}
        }
      }
    } catch {}
  };

  useEffect(() => {
    syncServerTheme();

    const handleBgChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.nightTheme) setNightThemeState(detail.nightTheme);
      if (detail?.dayTheme) setDayThemeState(detail.dayTheme);
      syncServerTheme();
    };

    window.addEventListener("bg-theme-changed", handleBgChange);
    window.addEventListener("focus", syncServerTheme);

    const interval = setInterval(syncServerTheme, 4000);

    return () => {
      window.removeEventListener("bg-theme-changed", handleBgChange);
      window.removeEventListener("focus", syncServerTheme);
      clearInterval(interval);
    };
  }, []);

  const setNightTheme = (id: NightThemeId) => {
    setNightThemeState(id);
    try { localStorage.setItem("bg_theme_night", id); } catch {}
  };

  const setDayTheme = (id: DayThemeId) => {
    setDayThemeState(id);
    try { localStorage.setItem("bg_theme_day", id); } catch {}
  };

  return (
    <BgThemeContext.Provider value={{ nightTheme, dayTheme, setNightTheme, setDayTheme }}>
      {children}
    </BgThemeContext.Provider>
  );
}

export function useBgTheme() {
  return useContext(BgThemeContext);
}

export function BackgroundThemeRenderer() {
  const { nightTheme, dayTheme } = useBgTheme();
  const { theme } = useThemeMode();

  if (theme === "light") {
    switch (dayTheme) {
      case "day-sunrise-dawn":     return <ThemeDaySunriseDawn />;
      case "day-golden-hour":      return <ThemeDayGoldenHour />;
      case "day-nordic-frost":     return <ThemeDayNordicFrost />;
      case "day-sky-breeze":       return <ThemeDaySkyBreeze />;
      case "day-mint-fresh":       return <ThemeDayMintFresh />;
      case "day-sunset-pastel":    return <ThemeDaySunsetPastel />;
      case "day-cyber-light":      return <ThemeDayCyberLight />;
      case "day-minimal-titanium": return <ThemeDayMinimalTitanium />;
      case "day-clean-minimal":
      default:                     return null;
    }
  }

  switch (nightTheme) {
    case "cyberpunk-grid":    return <ThemeCyberpunkGrid />;
    case "emerald-matrix":    return <ThemeEmeraldMatrix />;
    case "solar-flare":       return <ThemeSolarFlare />;
    case "obsidian-glass":    return <ThemeObsidianGlass />;
    case "velvet-night":      return <ThemeVelvetNight />;
    case "deep-space-nebula": return <ThemeDeepSpaceNebula />;
    case "midnight-aurora":   return <ThemeMidnightAurora />;
    case "matrix-rain":       return <ThemeMatrixRain />;
    case "cosmic-fireflies":  return <ThemeCosmicFireflies />;
    case "quantum-plasma":
    default:                  return <ThemeQuantumPlasma />;
  }
}
