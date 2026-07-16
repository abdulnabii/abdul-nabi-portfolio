"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Desktop-only soft cursor halo. Disabled on touch devices and reduced-motion.
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
      c.x += (t.x - c.x) * 0.16;
      c.y += (t.y - c.y) * 0.16;
      const el = ringRef.current;
      if (el) {
        el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) translate(-50%, -50%)`;
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
        "a, button, [role='button'], input, textarea, select, label, .cursor-grow"
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
      className={`pointer-events-none fixed left-0 top-0 z-[9999] hidden rounded-full border transition-[width,height,background-color,border-color,box-shadow,opacity] duration-300 ease-out lg:block ${
        hovering
          ? "h-14 w-14 border-accent-soft/50 bg-accent/15 shadow-[0_0_28px_rgba(99,102,241,0.28)]"
          : "h-9 w-9 border-white/25 bg-white/[0.05] shadow-[0_0_18px_rgba(0,0,0,0.25)]"
      }`}
      style={{
        opacity: visible ? 1 : 0,
        mixBlendMode: "screen",
        willChange: "transform",
      }}
    />
  );
}
