"use client";

import React from "react";

/**
 * Site-wide animated glass background with GPU-accelerated floating ambient color blobs.
 * Renders once in SiteChrome for all public pages.
 */
export function AnimatedGlassBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      {/* Soft Frosted Glass Diffusion Overlay */}
      <div className="absolute inset-0 bg-[#050814]/40 backdrop-blur-[60px]" />

      {/* Blob 1: Purple Ambient Orb */}
      <div
        className="absolute -top-[10%] -left-[5%] h-[480px] w-[480px] rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-600/15 to-transparent blur-[80px] will-change-transform animate-glass-blob-1 motion-reduce:animate-none"
      />

      {/* Blob 2: Cyan/Teal Ambient Orb */}
      <div
        className="absolute top-[35%] -right-[8%] h-[420px] w-[420px] rounded-full bg-gradient-to-bl from-cyan-400/18 via-teal-500/12 to-transparent blur-[90px] will-change-transform animate-glass-blob-2 motion-reduce:animate-none"
      />

      {/* Blob 3: Violet/Magenta Ambient Orb */}
      <div
        className="absolute -bottom-[8%] left-[20%] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-fuchsia-500/15 via-violet-600/12 to-transparent blur-[100px] will-change-transform animate-glass-blob-3 motion-reduce:animate-none"
      />

      {/* Blob 4: Deep Indigo Accent Orb */}
      <div
        className="absolute top-[60%] right-[25%] h-[360px] w-[360px] rounded-full bg-gradient-to-tl from-indigo-600/16 via-blue-500/10 to-transparent blur-[75px] will-change-transform animate-glass-blob-4 motion-reduce:animate-none"
      />

      {/* Subtle Noise / Grid Texture */}
      <div className="absolute inset-0 bg-grid opacity-30 mix-blend-overlay" />
    </div>
  );
}

export function GlassBackground() {
  return <AnimatedGlassBackground />;
}
