import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "accent" | "muted";
}

const variants = {
  default: "border-white/10 bg-white/[0.06] text-slate-300",
  accent: "border-accent/30 bg-accent/15 text-accent-soft",
  muted: "border-white/5 bg-white/[0.03] text-slate-400",
};

export function Badge({
  children,
  className,
  variant = "default",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
        "backdrop-blur-sm transition-colors duration-200",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
