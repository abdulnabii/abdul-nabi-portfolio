"use client";

import { useThemeMode } from "@/components/effects/theme-mode-provider";
import { useEffect, useRef, useState } from "react";

export type CursorStyleId =
  | "halo-ring"
  | "cyber-dot"
  | "tech-crosshair"
  | "spotlight-aura"
  | "orbital-particles";

export interface CursorStyleDef {
  id: CursorStyleId;
  label: string;
  description: string;
  icon: string;
  previewClass: string;
}

export const CURSOR_STYLES: CursorStyleDef[] = [
  {
    id: "halo-ring",
    label: "Halo Ambient Ring",
    description: "Smooth LERP tracking outer ambient halo ring with soft hover glow",
    icon: "⭕",
    previewClass: "border-indigo-400 bg-indigo-500/10 shadow-[0_0_12px_rgba(99,102,241,0.5)]",
  },
  {
    id: "cyber-dot",
    label: "Cyber Neon Pulse Dot",
    description: "Instant precision center dot with a lagging cyber pulse ring",
    icon: "🎯",
    previewClass: "bg-cyan-400 shadow-[0_0_15px_#22d3ee]",
  },
  {
    id: "tech-crosshair",
    label: "Precision Tech Crosshair",
    description: "Futuristic HUD crosshair reticle that rotates and locks onto elements",
    icon: "➕",
    previewClass: "border-indigo-400 border-dashed",
  },
  {
    id: "spotlight-aura",
    label: "Fluid Glow Spotlight",
    description: "Soft ambient radial spotlight aura that illuminates text & cards",
    icon: "💡",
    previewClass: "bg-gradient-to-r from-indigo-500/40 to-cyan-400/40 blur-sm",
  },
  {
    id: "orbital-particles",
    label: "Dual Orbital Satellites",
    description: "Core center dot with 2 miniature satellite particles orbiting around it",
    icon: "🪐",
    previewClass: "border-violet-400 bg-violet-500/20 shadow-[0_0_10px_#a855f7]",
  },
];

export function CustomCursor() {
  const { theme } = useThemeMode();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cursorStyle, setCursorStyle] = useState<CursorStyleId>("halo-ring");

  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const orbitAngle = useRef(0);

  const target = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Load saved cursor style from API or localStorage
    fetch("/api/admin/background-theme", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.cursorStyle) setCursorStyle(d.cursorStyle as CursorStyleId);
      })
      .catch(() => {});

    function handleCursorChanged(e: Event) {
      const customEvent = e as CustomEvent<{ style: CursorStyleId }>;
      if (customEvent.detail?.style) {
        setCursorStyle(customEvent.detail.style);
      }
    }

    window.addEventListener("cursor-style-changed", handleCursorChanged);
    return () => window.removeEventListener("cursor-style-changed", handleCursorChanged);
  }, []);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    if (!fine || reduce || !wide) return;

    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    let raf = 0;

    const loop = () => {
      const t = target.current;
      const c = current.current;

      // LERP tracking
      c.x += (t.x - c.x) * 0.16;
      c.y += (t.y - c.y) * 0.16;

      const ringEl = ringRef.current;
      if (ringEl) {
        ringEl.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
      }

      const dotEl = dotRef.current;
      if (dotEl) {
        dotEl.style.transform = `translate3d(${t.x}px, ${t.y}px, 0)`;
      }

      orbitAngle.current += 0.04;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      setVisible(true);
    };

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(
        "a, button, [role='button'], input, textarea, select, label, .cursor-grow, article, [data-hover]"
      );
      setHovering(Boolean(el));
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  if (!enabled) return null;

  const isLight = theme === "light";

  return (
    <>
      {/* Instant Precision Dot (used in cyber-dot, tech-crosshair, orbital-particles) */}
      {(cursorStyle === "cyber-dot" || cursorStyle === "tech-crosshair" || cursorStyle === "orbital-particles") && (
        <div
          ref={dotRef}
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-[99999] hidden lg:block"
          style={{ opacity: visible ? 1 : 0, willChange: "transform" }}
        >
          <div
            className={`-translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-150 ${
              isLight
                ? "h-2 w-2 bg-indigo-600 shadow-[0_0_8px_#4f46e5]"
                : "h-2 w-2 bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
            } ${hovering ? "scale-150" : "scale-100"}`}
          />
        </div>
      )}

      {/* Main LERP Ring Container */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] hidden lg:block"
        style={{
          opacity: visible ? 1 : 0,
          willChange: "transform",
        }}
      >
        {/* Style 1: Halo Ring */}
        {cursorStyle === "halo-ring" && (
          <div
            className={`-translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300 ease-out ${
              isLight
                ? hovering
                  ? "h-9 w-9 border-indigo-600/90 bg-indigo-500/15 shadow-[0_0_20px_rgba(79,70,229,0.25)] scale-110"
                  : "h-5 w-5 border-slate-700/70 bg-slate-900/10 shadow-[0_0_10px_rgba(15,23,42,0.15)] scale-100"
                : hovering
                  ? "h-9 w-9 border-indigo-400/80 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.35)] scale-110"
                  : "h-5 w-5 border-white/40 bg-white/[0.04] shadow-[0_0_10px_rgba(255,255,255,0.08)] scale-100"
            }`}
            style={{ mixBlendMode: isLight ? "normal" : "screen" }}
          />
        )}

        {/* Style 2: Cyber Pulse Ring */}
        {cursorStyle === "cyber-dot" && (
          <div
            className={`-translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300 ${
              hovering
                ? "h-10 w-10 border-cyan-400/90 bg-cyan-400/15 shadow-[0_0_25px_#22d3ee] scale-125"
                : "h-7 w-7 border-cyan-400/50 bg-cyan-400/5 shadow-[0_0_12px_rgba(34,211,238,0.4)] scale-100"
            }`}
          />
        )}

        {/* Style 3: Precision Tech Crosshair */}
        {cursorStyle === "tech-crosshair" && (
          <div
            className={`-translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 ${
              hovering ? "h-10 w-10 rotate-45 scale-110" : "h-8 w-8 rotate-0 scale-100"
            }`}
          >
            <div className={`relative h-full w-full rounded-lg border ${
              isLight ? "border-indigo-600/80 bg-indigo-500/10" : "border-indigo-400/80 bg-indigo-500/10"
            }`}>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-1.5 w-0.5 bg-indigo-400" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-0.5 bg-indigo-400" />
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 h-0.5 w-1.5 bg-indigo-400" />
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 h-0.5 w-1.5 bg-indigo-400" />
            </div>
          </div>
        )}

        {/* Style 4: Fluid Glow Spotlight Aura */}
        {cursorStyle === "spotlight-aura" && (
          <div
            className={`-translate-x-1/2 -translate-y-1/2 rounded-full blur-xl transition-all duration-300 ${
              hovering
                ? "h-36 w-36 bg-gradient-to-r from-indigo-500/35 via-cyan-400/35 to-violet-500/35 scale-125"
                : "h-24 w-24 bg-gradient-to-r from-indigo-500/20 via-cyan-400/20 to-violet-500/20 scale-100"
            }`}
            style={{ mixBlendMode: isLight ? "multiply" : "screen" }}
          />
        )}

        {/* Style 5: Dual Orbital Satellites */}
        {cursorStyle === "orbital-particles" && (
          <div className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div
              className={`rounded-full border transition-all duration-300 ${
                hovering
                  ? "h-9 w-9 border-violet-400/80 bg-violet-500/15 shadow-[0_0_20px_#a855f7]"
                  : "h-6 w-6 border-violet-400/50 bg-violet-500/10"
              }`}
            />
            {/* Satellite 1 */}
            <div
              className="absolute h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-spin-slow"
              style={{
                transform: `rotate(${orbitAngle.current * 40}deg) translate(${hovering ? 20 : 14}px)`,
              }}
            />
            {/* Satellite 2 */}
            <div
              className="absolute h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_8px_#a855f7]"
              style={{
                transform: `rotate(${orbitAngle.current * 40 + 180}deg) translate(${hovering ? 20 : 14}px)`,
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
