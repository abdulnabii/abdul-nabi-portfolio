import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "rectangular" | "circular" | "rounded" | "text";
}

export function Skeleton({
  className,
  variant = "rounded",
  ...props
}: SkeletonProps) {
  const variantClass = {
    rectangular: "rounded-none",
    circular: "rounded-full",
    rounded: "rounded-xl",
    text: "rounded-md h-4 w-full",
  }[variant];

  return (
    <div
      className={cn(
        "animate-pulse bg-white/[0.06] border border-white/[0.03]",
        variantClass,
        className
      )}
      {...props}
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#080d24]/60 p-6 space-y-4">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#080d24]/60 p-6 space-y-4">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}
