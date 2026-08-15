"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Github, Flame, GitCommit, GitPullRequest, ExternalLink, Sparkles } from "lucide-react";

interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export function GitHubHeatmap() {
  const [totalContributions, setTotalContributions] = useState(148);
  const [currentStreak, setCurrentStreak] = useState(24);
  const [longestStreak, setLongestStreak] = useState(45);
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  // Generate 20 weeks of contribution squares with realistic developer activity
  const weeks = useMemo(() => {
    const today = new Date();
    const result: HeatmapDay[][] = [];

    // 20 weeks * 7 days = 140 days
    for (let w = 19; w >= 0; w--) {
      const week: HeatmapDay[] = [];
      for (let d = 0; d < 7; d++) {
        const dayOffset = w * 7 + (6 - d);
        const dayDate = new Date(today);
        dayDate.setDate(dayDate.getDate() - dayOffset);

        const dateStr = dayDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        // Deterministic pseudo-random commit distribution based on day of year
        const dayOfYear = Math.floor((dayDate.getTime() - new Date(dayDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const pseudoRand = ((dayOfYear * 9301 + 49297) % 233280) / 233280;
        
        let count = 0;
        let level: 0 | 1 | 2 | 3 | 4 = 0;

        if (pseudoRand > 0.4) {
          count = Math.floor(pseudoRand * 6) + 1;
          if (count === 1) level = 1;
          else if (count <= 3) level = 2;
          else if (count <= 5) level = 3;
          else level = 4;
        }

        week.push({
          date: dateStr,
          count,
          level,
        });
      }
      result.push(week);
    }
    return result;
  }, []);

  const LEVEL_COLORS: Record<number, string> = {
    0: "bg-white/[0.04] border border-white/[0.03]",
    1: "bg-emerald-950/80 border border-emerald-800/40 text-emerald-300",
    2: "bg-emerald-700/80 border border-emerald-600/50 text-emerald-200",
    3: "bg-emerald-500 border border-emerald-400/60 text-white shadow-[0_0_6px_rgba(16,185,129,0.5)]",
    4: "bg-emerald-400 border border-emerald-300 text-slate-900 shadow-[0_0_10px_rgba(52,211,153,0.8)]",
  };

  return (
    <GlassCard padding="lg" interactive hover className="p-6 sm:p-7 border-white/10 mt-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white">
            <Github className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">GitHub Activity & Contributions</h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Streak
              </span>
            </div>
            <a
              href="https://github.com/abdulnabii"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
            >
              @abdulnabii
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>

        {/* Quick Stats Pill Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-center">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Total Commits</div>
            <div className="text-sm font-bold text-white font-mono">{totalContributions}+</div>
          </div>
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-center">
            <div className="text-[10px] uppercase font-semibold text-orange-400 flex items-center justify-center gap-1">
              <Flame className="h-3 w-3" /> Streak
            </div>
            <div className="text-sm font-bold text-orange-300 font-mono">{currentStreak} Days</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-center">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Longest</div>
            <div className="text-sm font-bold text-indigo-300 font-mono">{longestStreak} Days</div>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="pt-5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
        <div className="inline-block min-w-full">
          <div className="flex items-center gap-1.5">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day, dIdx) => (
                  <div
                    key={dIdx}
                    onMouseEnter={() => setHoveredDay({ date: day.date, count: day.count })}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-sm transition-transform duration-150 hover:scale-125 cursor-pointer ${LEVEL_COLORS[day.level]}`}
                    title={`${day.count} contributions on ${day.date}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Footer legend */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-white/5">
            <div className="h-4">
              {hoveredDay ? (
                <span className="font-mono text-slate-200">
                  <span className="font-semibold text-emerald-400">{hoveredDay.count}</span> contributions on{" "}
                  {hoveredDay.date}
                </span>
              ) : (
                <span>Hover over squares to inspect daily contributions</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <span>Less</span>
              <span className="h-2.5 w-2.5 rounded-sm bg-white/[0.04] border border-white/[0.03]" />
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-950/80 border border-emerald-800/40" />
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-700/80 border border-emerald-600/50" />
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
