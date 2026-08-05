"use client";

import React from "react";

/**
 * Clean Professional Neutral Glass Background.
 * Uses restrained, neutral gradient diffusion and low-opacity grid texture.
 * Free of scattered decorative dots or ambient teal fills.
 */
export function AnimatedGlassBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      {/* Base Frosted Glass Diffusion Layer */}
      <div className="absolute inset-0 bg-[#050814]/70 backdrop-blur-[80px]" />

      {/* Neutral Ambient Soft Glow 1 */}
      <div
        className="absolute -top-[10%] -left-[5%] h-[550px] w-[550px] rounded-full bg-gradient-to-br from-indigo-900/20 via-slate-800/15 to-transparent blur-[100px] will-change-transform animate-glass-blob-1 motion-reduce:animate-none"
      />

      {/* Neutral Ambient Soft Glow 2 */}
      <div
        className="absolute top-[35%] -right-[8%] h-[480px] w-[480px] rounded-full bg-gradient-to-bl from-purple-950/20 via-indigo-900/15 to-transparent blur-[110px] will-change-transform animate-glass-blob-2 motion-reduce:animate-none"
      />

      {/* Neutral Ambient Soft Glow 3 */}
      <div
        className="absolute -bottom-[8%] left-[25%] h-[580px] w-[580px] rounded-full bg-gradient-to-tr from-slate-900/25 via-indigo-950/20 to-transparent blur-[120px] will-change-transform animate-glass-blob-3 motion-reduce:animate-none"
      />

      {/* Low-Opacity Technical Grid Texture */}
      <div className="absolute inset-0 bg-grid opacity-15 mix-blend-overlay" />
    </div>
  );
}

export function GlassBackground() {
  return <AnimatedGlassBackground />;
}
