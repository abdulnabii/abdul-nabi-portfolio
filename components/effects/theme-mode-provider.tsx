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

  useEffect(() => {
    if (sectionVisibility?.themeToggle === false) {
      // If admin turned off theme toggle, force Night Mode (Dark Theme) immediately!
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
    } catch {}
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
