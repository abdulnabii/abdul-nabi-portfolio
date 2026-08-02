"use client";

import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectAppreciationProps {
  projectId: string;
  initialCount: number;
}

export function ProjectAppreciation({
  projectId,
  initialCount,
}: ProjectAppreciationProps) {
  const [count, setCount] = useState(initialCount);
  const [appreciated, setAppreciated] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAppreciate() {
    if (appreciated || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/appreciate`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setCount(data.appreciations);
        setAppreciated(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center max-w-sm mx-auto">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        Appreciate this build
      </p>
      <button
        disabled={appreciated || loading}
        onClick={handleAppreciate}
        className={cn(
          "cursor-grow flex items-center justify-center gap-2 rounded-2xl border px-6 py-3 font-semibold text-sm transition duration-300 shadow-glass",
          appreciated
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
            : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-white hover:-translate-y-0.5 hover:shadow-glow-sm"
        )}
      >
        {appreciated ? (
          <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
        ) : (
          <Heart className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition" />
        )}
        <span>{appreciated ? "Thank you!" : "Appreciate Project"}</span>
      </button>
      <span className="text-xs text-slate-400 font-mono">
        {count} {count === 1 ? "appreciation" : "appreciations"}
      </span>
    </div>
  );
}
