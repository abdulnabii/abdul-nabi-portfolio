"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Desktop-only premium custom cursor.
 * Features a single, subtle, downsized custom ring that tracks the pointer rapidly (0.32 lerp).
 * Auto-disabled on mobile, touch devices, and prefers-reduced-motion.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  
  const ringRef = useRef<HTMLDivElement>(null);
  
  const target = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });

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
      
      // Smoothly lerped outer halo cursor (~0.14 LERP factor)
      c.x += (t.x - c.x) * 0.14;
      c.y += (t.y - c.y) * 0.14;
      
      const ringEl = ringRef.current;
      if (ringEl) {
        ringEl.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
      }
      
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

  return (
    <div
      ref={ringRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden lg:block"
      style={{
        opacity: visible ? 1 : 0,
        willChange: "transform",
      }}
    >
      {/* Soft ambient halo ring with LERP 0.14 tracking */}
      <div
        className={`-translate-x-1/2 -translate-y-1/2 rounded-full border transition-[width,height,background-color,border-color,box-shadow,transform,opacity] duration-300 ease-out ${
          hovering
            ? "h-9 w-9 border-indigo-400/80 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.35)] scale-110"
            : "h-5 w-5 border-white/40 bg-white/[0.04] shadow-[0_0_10px_rgba(255,255,255,0.08)] scale-100"
        }`}
        style={{
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
