"use client";

import { siteContent } from "@/data/content";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Single professional portrait with light CSS-3D depth + parallax.
 * Degrades to a static framed photo on reduced-motion / touch.
 */
export function HeroPortrait3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const wrap = wrapRef.current;
    const frame = frameRef.current;
    if (!wrap || !frame) return;

    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      frame.style.transform = `perspective(1000px) rotateY(${px * 8}deg) rotateX(${-py * 6}deg) translateZ(0)`;
    };

    const onLeave = () => {
      frame.style.transform =
        "perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)";
    };

    wrap.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseleave", onLeave);
    return () => {
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative mx-auto w-full max-w-md">
      {/* Floating glass planes — depth without heavy WebGL */}
      <div
        aria-hidden
        className="absolute -right-4 top-8 h-28 w-28 rounded-2xl border border-white/10 bg-accent/10 blur-[1px] animate-float motion-reduce:animate-none"
        style={{ transform: "rotate(12deg)" }}
      />
      <div
        aria-hidden
        className="absolute -left-6 bottom-16 h-20 w-20 rounded-2xl border border-white/10 bg-indigo-500/10 animate-float motion-reduce:animate-none"
        style={{ animationDelay: "1.2s", transform: "rotate(-8deg)" }}
      />

      <div
        ref={frameRef}
        className="glass-elevated relative overflow-hidden rounded-[1.75rem] p-2 transition-transform duration-300 ease-out will-change-transform"
        style={{
          transformStyle: "preserve-3d",
          transform: "perspective(1000px) rotateY(0deg) rotateX(0deg)",
        }}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-indigo-900/20 blur-3xl" />

        <div className="relative overflow-hidden rounded-[1.35rem] border border-white/10">
          <div className="relative aspect-[4/5] w-full bg-[#080d1a]">
            {!imageError ? (
              <Image
                src={siteContent.portraitUrl}
                alt={siteContent.portraitAlt}
                fill
                priority
                className="object-cover object-top"
                sizes="(max-width: 768px) 90vw, 400px"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-[#0e162e] to-[#060a17] p-8 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.25)]">
                  <span className="font-mono text-3xl font-bold tracking-widest text-indigo-300">
                    AN
                  </span>
                </div>
                <p className="mt-4 text-xs font-medium uppercase tracking-widest text-slate-400">
                  Abdul Nabi
                </p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#050814] via-[#050814]/85 to-transparent pointer-events-none" />
          </div>

          <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
            <div className="rounded-2xl border border-white/15 bg-[#050814]/90 p-4 sm:p-5 backdrop-blur-xl shadow-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-soft">
                {siteContent.hero.greeting}
              </p>
              <p className="mt-0.5 text-base font-bold text-white sm:text-lg">
                {siteContent.name}
              </p>
              <p className="mt-1 text-xs text-slate-300">
                Full-Stack Engineer · AppSec Focus
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
