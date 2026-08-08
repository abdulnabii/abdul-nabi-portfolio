"use client";

import { useThemeMode } from "@/components/effects/theme-mode-provider";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("h-9 w-9 rounded-full border border-white/10 bg-white/5", className)} />
    );
  }

  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to Night Mode (Dark)" : "Switch to Day Mode (Light)"}
      title={isLight ? "Switch to Night Mode (Dark)" : "Switch to Day Mode (Light)"}
      className={cn(
        "group relative flex items-center gap-2 rounded-full border transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 select-none",
        showLabel ? "px-3 py-1.5 text-xs font-medium" : "h-9 w-9 justify-center",
        isLight
          ? "border-slate-300/80 bg-white/90 text-indigo-600 shadow-sm hover:bg-slate-100 hover:border-slate-400 hover:scale-105"
          : "border-white/15 bg-white/5 text-amber-300 shadow-sm hover:bg-white/10 hover:border-white/30 hover:scale-105",
        className
      )}
    >
      <div className="relative h-4 w-4 shrink-0 overflow-hidden">
        {/* Sun Icon for Night mode (click to go Day) */}
        <Sun
          className={cn(
            "absolute inset-0 h-4 w-4 transition-all duration-300 text-amber-400",
            isLight
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 group-hover:rotate-45"
          )}
        />
        {/* Moon Icon for Day mode (click to go Night) */}
        <Moon
          className={cn(
            "absolute inset-0 h-4 w-4 transition-all duration-300 text-indigo-600",
            isLight
              ? "rotate-0 scale-100 opacity-100 group-hover:-rotate-12"
              : "-rotate-90 scale-0 opacity-0"
          )}
        />
      </div>

      {showLabel && (
        <span className={cn("transition-colors duration-200", isLight ? "text-slate-800" : "text-slate-200")}>
          {isLight ? "Day Mode" : "Night Mode"}
        </span>
      )}
    </button>
  );
}
