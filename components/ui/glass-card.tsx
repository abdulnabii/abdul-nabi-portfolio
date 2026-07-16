"use client";

import { InteractiveSurface } from "@/components/effects/interactive-surface";
import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevated?: boolean;
  hover?: boolean;
  /** Pointer spotlight (desktop) */
  interactive?: boolean;
  /** Subtle 3D tilt (desktop, for project cards) */
  tilt?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function GlassCard({
  children,
  className,
  elevated = false,
  hover = false,
  interactive = false,
  tilt = false,
  padding = "md",
  ...props
}: GlassCardProps) {
  const classes = cn(
    "rounded-2xl md:rounded-3xl",
    elevated ? "glass-elevated" : "glass",
    paddingMap[padding],
    hover &&
      !tilt &&
      "transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-glow-sm hover:bg-white/[0.08]",
    className
  );

  if (interactive || tilt) {
    return (
      <InteractiveSurface
        spotlight={interactive || tilt}
        tilt={tilt}
        className={classes}
        {...props}
      >
        {children}
      </InteractiveSurface>
    );
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
