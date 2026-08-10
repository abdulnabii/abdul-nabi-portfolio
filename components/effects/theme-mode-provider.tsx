"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSiteSettings } from "@/components/settings-provider";

export type ThemeMode = "dark" | "light";

interface ThemeModeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const { sectionVisibility } = useSiteSettings();
  const [theme, setThemeState] = useState<ThemeMode>("dark");

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    if (mode === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
  };

  const syncServerThemeMode = async () => {
    if (sectionVisibility?.themeToggle === false) {
      setThemeState("dark");
      applyTheme("dark");
      return;
    }

    try {
      const res = await fetch(`/api/admin/background-theme?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.defaultMode === "light" || data?.defaultMode === "dark") {
          const userExplicit = localStorage.getItem("app_theme_explicit");
          if (!userExplicit) {
            setThemeState(data.defaultMode as ThemeMode);
            applyTheme(data.defaultMode as ThemeMode);
            try { localStorage.setItem("app_theme", data.defaultMode); } catch {}
          }
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (sectionVisibility?.themeToggle === false) {
      setThemeState("dark");
      applyTheme("dark");
      return;
    }

    try {
      const savedTheme = localStorage.getItem("app_theme") as ThemeMode | null;
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } else {
        setThemeState("dark");
        applyTheme("dark");
      }
    } catch {
      applyTheme("dark");
    }

    syncServerThemeMode();

    const handleModeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.mode === "light" || detail?.mode === "dark") {
        setThemeState(detail.mode);
        applyTheme(detail.mode);
      }
    };

    window.addEventListener("theme-mode-changed", handleModeChange);
    return () => window.removeEventListener("theme-mode-changed", handleModeChange);
  }, [sectionVisibility?.themeToggle]);

  const setTheme = (mode: ThemeMode) => {
    if (sectionVisibility?.themeToggle === false) {
      setThemeState("dark");
      applyTheme("dark");
      return;
    }
    setThemeState(mode);
    applyTheme(mode);
    try {
      localStorage.setItem("app_theme", mode);
      localStorage.setItem("app_theme_explicit", "true");
    } catch {}

    // Save to server DB via API
    fetch("/api/admin/background-theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultMode: mode }),
    }).catch(() => {});
  };

  const toggleTheme = () => {
    if (sectionVisibility?.themeToggle === false) return;
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeModeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
