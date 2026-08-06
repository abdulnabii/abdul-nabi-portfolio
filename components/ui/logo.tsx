import React from "react";

/**
 * Premium AN / AB Monogram Brand Emblem Logo.
 * Features glowing glassmorphic hexagon badge with interlocking AN/AB geometric typography
 * and cyan security indicator node.
 */
export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-cyan-500/10 shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] select-none ${className}`}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 transition-colors duration-300"
      >
        <defs>
          <linearGradient id="anGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="50%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Outer Tech Hexagon / Shield Frame */}
        <polygon
          points="20,2 36,10 36,30 20,38 4,30 4,10"
          fill="url(#shieldGrad)"
          stroke="url(#anGrad)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          className="opacity-80"
        />

        {/* Geometric Interlocking AN / AB Monogram */}
        {/* Letter 'A' Left Pillar and Crossbar */}
        <path
          d="M 11 29 L 20 10 L 25 21"
          stroke="url(#anGrad)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 14.5 22 H 21.5"
          stroke="url(#anGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Letter 'B' / 'N' Right Loop & Vertical Stem */}
        <path
          d="M 23.5 10 V 29"
          stroke="url(#anGrad)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M 23.5 11 C 31 11 31 19 23.5 19 C 32 19 32 28.5 23.5 28.5"
          stroke="url(#anGrad)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Pulsing Cyan Tech Indicator Node */}
      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)] animate-pulse" />
    </div>
  );
}
