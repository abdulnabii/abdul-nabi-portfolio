import React from "react";

export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-inner transition-all duration-300 group-hover:border-accent/40 group-hover:bg-white/10 group-hover:shadow-glow-sm ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4.5 w-4.5 text-accent-soft group-hover:text-cyan-400 transition-colors duration-300"
      >
        {/* Shield Outline */}
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          className="opacity-30"
        />
        {/* Modern integrated AN Monogram */}
        <path
          d="M4.5 16.5 L9.5 6.5 L14.5 16.5 V6.5 L19.5 16.5 V6.5"
          strokeLinejoin="miter"
        />
        <path d="M7 12 H12" />
      </svg>
      {/* Subtle cyan glowing dot in the corner to represent high tech/security */}
      <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
    </div>
  );
}
