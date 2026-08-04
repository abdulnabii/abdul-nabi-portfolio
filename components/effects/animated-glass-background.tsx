"use client";

import React from "react";

/**
 * Premium Futuristic Animated Glass Background for Full-Stack / AppSec / Data & ML Portfolio.
 * Combines GPU-accelerated organic gradient blobs, subtle laser scanline ray, and floating data nodes.
 */
export function AnimatedGlassBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      {/* Base Frosted Glass Diffusion Layer */}
      <div className="absolute inset-0 bg-[#050814]/50 backdrop-blur-[70px]" />

      {/* Blob 1: Deep Indigo / AppSec Cyber Orb */}
      <div
        className="absolute -top-[10%] -left-[5%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-indigo-500/22 via-purple-600/18 to-transparent blur-[85px] will-change-transform animate-glass-blob-1 motion-reduce:animate-none"
      />

      {/* Blob 2: Data & Analytics Cyan Glow */}
      <div
        className="absolute top-[32%] -right-[8%] h-[440px] w-[440px] rounded-full bg-gradient-to-bl from-cyan-400/20 via-teal-500/14 to-transparent blur-[90px] will-change-transform animate-glass-blob-2 motion-reduce:animate-none"
      />

      {/* Blob 3: Futuristic Deep Violet / Magenta Mesh */}
      <div
        className="absolute -bottom-[8%] left-[22%] h-[540px] w-[540px] rounded-full bg-gradient-to-tr from-fuchsia-500/16 via-violet-600/14 to-transparent blur-[100px] will-change-transform animate-glass-blob-3 motion-reduce:animate-none"
      />

      {/* Blob 4: Security Emerald Accent Pulse */}
      <div
        className="absolute top-[62%] right-[22%] h-[380px] w-[380px] rounded-full bg-gradient-to-tl from-emerald-500/14 via-indigo-600/14 to-transparent blur-[80px] will-change-transform animate-glass-blob-4 motion-reduce:animate-none"
      />

      {/* Technical Cyber Scanline Ray */}
      <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent pointer-events-none will-change-transform animate-scanline motion-reduce:hidden" />

      {/* Floating Data Node Particles */}
      <div className="absolute inset-0 pointer-events-none motion-reduce:hidden">
        <div className="absolute top-[18%] left-[15%] h-1.5 w-1.5 rounded-full bg-cyan-400/50 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-particle-1" />
        <div className="absolute top-[45%] left-[80%] h-2 w-2 rounded-full bg-indigo-400/50 shadow-[0_0_10px_rgba(129,140,248,0.8)] animate-particle-2" />
        <div className="absolute top-[75%] left-[30%] h-1.5 w-1.5 rounded-full bg-purple-400/50 shadow-[0_0_8px_rgba(192,132,252,0.8)] animate-particle-3" />
        <div className="absolute top-[60%] left-[65%] h-1 w-1 rounded-full bg-emerald-400/60 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-particle-1" style={{ animationDelay: "4s" }} />
        <div className="absolute top-[30%] left-[45%] h-2 w-2 rounded-full bg-cyan-300/40 shadow-[0_0_10px_rgba(34,211,238,0.6)] animate-particle-2" style={{ animationDelay: "2s" }} />
      </div>

      {/* Subtle Noise & Tech Grid Overlay */}
      <div className="absolute inset-0 bg-grid opacity-25 mix-blend-overlay" />
    </div>
  );
}

export function GlassBackground() {
  return <AnimatedGlassBackground />;
}
