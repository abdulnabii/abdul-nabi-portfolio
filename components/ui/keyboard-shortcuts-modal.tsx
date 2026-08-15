"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useThemeMode } from "@/components/effects/theme-mode-provider";
import { useCommandPalette } from "@/components/command-palette";
import { playTactileClick } from "@/components/effects/sound-effects";
import { Keyboard, X, Command, Sun, Moon, ArrowRight } from "lucide-react";

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { toggleTheme } = useThemeMode();
  const { open: openPalette } = useCommandPalette();
  const [gPressed, setGPressed] = useState(false);

  useEffect(() => {
    let gTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      // 1. '?' key toggles shortcut modal
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        playTactileClick("pop");
        setIsOpen((prev) => !prev);
        return;
      }

      // 2. 'Escape' closes modal
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        return;
      }

      // 3. 't' or 'T' toggles theme
      if (e.key.toLowerCase() === "t" && !e.metaKey && !e.ctrlKey && !isOpen) {
        e.preventDefault();
        playTactileClick("switch");
        toggleTheme();
        return;
      }

      // 4. Vim-style 'g' sequence navigation
      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey) {
        if (!gPressed) {
          setGPressed(true);
          clearTimeout(gTimeout);
          gTimeout = setTimeout(() => setGPressed(false), 1200);
          return;
        }
      }

      if (gPressed) {
        const k = e.key.toLowerCase();
        setGPressed(false);
        clearTimeout(gTimeout);

        if (k === "h") {
          e.preventDefault();
          router.push("/#home");
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (k === "p") {
          e.preventDefault();
          router.push("/projects");
        } else if (k === "m") {
          e.preventDefault();
          router.push("/mini-projects");
        } else if (k === "b") {
          e.preventDefault();
          router.push("/blog");
        } else if (k === "c") {
          e.preventDefault();
          const el = document.getElementById("contact");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          else router.push("/#contact");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(gTimeout);
    };
  }, [isOpen, gPressed, router, toggleTheme]);

  if (!isOpen) return null;

  const SHORTCUTS = [
    { key: "⌘ K / Ctrl K", label: "Open Command Palette" },
    { key: "T", label: "Toggle Day / Night Theme" },
    { key: "?", label: "Toggle Keyboard Shortcuts Cheat Sheet" },
    { key: "G then H", label: "Go to Home / Hero" },
    { key: "G then P", label: "Go to All Projects" },
    { key: "G then M", label: "Go to 30 Days 30 Projects" },
    { key: "G then B", label: "Go to Technical Blog" },
    { key: "G then C", label: "Go to Contact & Hire" },
    { key: "ESC", label: "Close Any Open Modal / Drawer" },
  ];

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-[#080d24]/95 text-slate-100 shadow-[0_20px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <Keyboard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Keyboard Shortcuts</h3>
              <p className="text-[11px] text-slate-400">Power-user developer navigation</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {SHORTCUTS.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-2.5 text-xs"
            >
              <span className="text-slate-300 font-medium">{s.label}</span>
              <kbd className="rounded-lg border border-white/10 bg-white/[0.08] px-2 py-0.5 font-mono text-[11px] text-indigo-300 font-semibold shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 px-5 py-3 text-[11px] text-slate-500 text-center">
          Press <kbd className="font-mono text-slate-400">?</kbd> anywhere to dismiss.
        </div>
      </div>
    </div>
  );
}
