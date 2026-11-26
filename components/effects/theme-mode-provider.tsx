"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

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

  // Immediate client hydration from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("app_theme") as ThemeMode | null;
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
        applyTheme(saved);
      }
    } catch {}
  }, []);

  const syncServerThemeMode = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/background-theme?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.defaultMode === "light" || data?.defaultMode === "dark") {
          setThemeState(data.defaultMode as ThemeMode);
          applyTheme(data.defaultMode as ThemeMode);
          try { localStorage.setItem("app_theme", data.defaultMode); } catch {}
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    syncServerThemeMode();

    const handleModeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.mode === "light" || detail?.mode === "dark") {
        setThemeState(detail.mode);
        applyTheme(detail.mode);
      } else {
        syncServerThemeMode();
      }
    };

    // Cross-tab sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "app_theme" && (e.newValue === "light" || e.newValue === "dark")) {
        setThemeState(e.newValue);
        applyTheme(e.newValue);
      }
    };

    window.addEventListener("theme-mode-changed", handleModeChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("theme-mode-changed", handleModeChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [syncServerThemeMode]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    applyTheme(mode);
    try {
      localStorage.setItem("app_theme", mode);
    } catch {}
  };

  const toggleTheme = () => {
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
