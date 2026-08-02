"use client";

import { GlassCard } from "@/components/ui/glass-card";
import type { AnalyticsSummary } from "@/lib/analytics-store";
import { BarChart3, Eye, MousePointerClick, RefreshCw, TrendingUp } from "lucide-react";
import { useState } from "react";

interface AnalyticsDashboardOverviewProps {
  initialSummary: AnalyticsSummary;
}

export function AnalyticsDashboardOverview({ initialSummary }: AnalyticsDashboardOverviewProps) {
  const [summary, setSummary] = useState<AnalyticsSummary>(initialSummary);
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/summary");
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error("Failed to refresh analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Page Views & CTA Analytics
        </p>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh analytics
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase tracking-wider text-slate-500">Total Visits</span>
            <Eye className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">{summary.totalViews}</p>
          <p className="mt-1 text-xs text-slate-500">All-time deduplicated views</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase tracking-wider text-slate-500">This Week</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-emerald-300">{summary.viewsThisWeek}</p>
          <p className="mt-1 text-xs text-slate-500">Last 7 days activity</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase tracking-wider text-slate-500">Top Blog Post</span>
            <BarChart3 className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-2 truncate text-lg font-semibold text-indigo-200">
            {summary.topBlogs[0]?.title || "N/A"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {summary.topBlogs[0]?.views || 0} views
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase tracking-wider text-slate-500">Top CTA Button</span>
            <MousePointerClick className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 truncate text-lg font-semibold text-amber-200 font-medium">
            {summary.topCtas[0]?.label || "N/A"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {summary.topCtas[0]?.clicks || 0} clicks
          </p>
        </GlassCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Top Performing Case Studies
          </h4>
          <div className="space-y-2">
            {summary.topProjects.map((p, idx) => (
              <div
                key={p.slug + idx}
                className="flex items-center justify-between rounded-xl bg-white/[0.03] p-2.5 text-xs border border-white/5"
              >
                <span className="font-medium text-slate-200 truncate">{p.title}</span>
                <span className="text-slate-400 font-mono">{p.views} views</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Top Clicked Actions (CTAs)
          </h4>
          <div className="space-y-2">
            {summary.topCtas.map((c, idx) => (
              <div
                key={c.label + idx}
                className="flex items-center justify-between rounded-xl bg-white/[0.03] p-2.5 text-xs border border-white/5"
              >
                <span className="font-medium text-slate-200 truncate">{c.label}</span>
                <span className="text-amber-300/90 font-mono">{c.clicks} clicks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
