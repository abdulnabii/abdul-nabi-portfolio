"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  RefreshCw,
  SkipForward,
  Zap,
  Power,
  PowerOff,
} from "lucide-react";

interface CronLog {
  lastRun: string | null;
  created: string[];
  skipped: string[];
  errors: string[];
  durationSeconds: number;
}

export function AutoBlogPanel() {
  const [log, setLog] = useState<CronLog | null>(null);
  const [running, setRunning] = useState(false);
  const [loadingLog, setLoadingLog] = useState(true);
  const [runResult, setRunResult] = useState<CronLog | null>(null);

  // Enable / disable toggle state
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [togglingEnabled, setTogglingEnabled] = useState(false);

  async function fetchLog() {
    try {
      setLoadingLog(true);
      const res = await fetch("/api/admin/auto-blog/log", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setLog(data);
      }
    } catch {}
    finally {
      setLoadingLog(false);
    }
  }

  async function fetchEnabled() {
    try {
      const res = await fetch("/api/admin/auto-blog/toggle", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setEnabled(data.enabled);
      }
    } catch {}
  }

  async function handleToggle() {
    if (enabled === null) return;
    setTogglingEnabled(true);
    try {
      const next = !enabled;
      const res = await fetch("/api/admin/auto-blog/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      if (res.ok) {
        setEnabled(next);
      }
    } catch {}
    finally {
      setTogglingEnabled(false);
    }
  }

  async function handleRunNow() {
    setRunning(true);
    setRunResult(null);
    try {
      const cronSecret = process.env.NEXT_PUBLIC_CRON_SECRET || "auto-blog-secret-2025";
      const res = await fetch("/api/cron/auto-blog", {
        method: "POST",
        headers: { Authorization: `Bearer ${cronSecret}` },
      });
      const data = await res.json();
      if (res.ok) {
        setRunResult({
          lastRun: new Date().toISOString(),
          created: data.created || [],
          skipped: data.skipped || [],
          errors: data.errors || [],
          durationSeconds: data.durationSeconds || 0,
        });
        await fetchLog();
      } else {
        setRunResult({
          lastRun: new Date().toISOString(),
          created: [],
          skipped: [],
          errors: [data.error || "Unknown error"],
          durationSeconds: 0,
        });
      }
    } catch {
      setRunResult({
        lastRun: new Date().toISOString(),
        created: [],
        skipped: [],
        errors: ["Network error — check OPENAI_API_KEY env variable"],
        durationSeconds: 0,
      });
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    fetchLog();
    fetchEnabled();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">AI Auto-Blog</h3>
            <Badge variant="accent" className="text-[10px]">DAILY CRON</Badge>
          </div>
          <p className="text-sm text-slate-400">
            Automatically discovers trending AI/ML news and publishes 2–3 blog posts daily at 8:00 AM PKT.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLog}
            disabled={loadingLog}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className={`h-3 w-3 ${loadingLog ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Button
            onClick={handleRunNow}
            disabled={running || enabled === false}
            className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white border-0 disabled:opacity-40"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Now
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Enable / Disable toggle card */}
      <div
        className={`relative flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-300 ${
          enabled
            ? "border-emerald-500/25 bg-emerald-500/5"
            : "border-red-500/20 bg-red-500/5"
        }`}
      >
        <div className="flex items-start gap-3">
          {enabled ? (
            <Power className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <PowerOff className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          )}
          <div>
            <p className="text-sm font-medium text-white">
              {enabled === null
                ? "Loading…"
                : enabled
                ? "Automation is enabled"
                : "Automation is disabled"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {enabled
                ? "Vercel cron runs daily at 8:00 AM PKT and auto-publishes AI/ML posts."
                : "The daily cron will be skipped until you re-enable it. Run Now is also paused."}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          onClick={handleToggle}
          disabled={togglingEnabled || enabled === null}
          aria-label={enabled ? "Disable auto blog" : "Enable auto blog"}
          className="relative shrink-0 focus:outline-none"
        >
          <div
            className={`h-7 w-12 rounded-full transition-colors duration-300 ${
              enabled ? "bg-emerald-500" : "bg-slate-600"
            } ${togglingEnabled ? "opacity-50" : ""}`}
          />
          <div
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${
              enabled ? "left-6" : "left-1"
            }`}
          />
          {togglingEnabled && (
            <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin text-slate-800" />
          )}
        </button>
      </div>

      {/* Status cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard>
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span className="text-xs uppercase tracking-wider text-slate-500">Last Run</span>
          </div>
          <p className="text-sm font-medium text-white mt-1">
            {log?.lastRun
              ? new Date(log.lastRun).toLocaleString("en-PK", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Karachi",
                })
              : "Never"}
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <FileText className="h-4 w-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider text-slate-500">Last Batch</span>
          </div>
          <p className="text-2xl font-semibold text-emerald-300 mt-1">
            {log?.created?.length ?? 0} posts
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-xs uppercase tracking-wider text-slate-500">Schedule</span>
          </div>
          <p className="text-sm font-medium text-amber-200 mt-1">Daily 8:00 AM PKT</p>
          <p className="text-[10px] text-slate-500 mt-0.5">3:00 AM UTC via Vercel Cron</p>
        </GlassCard>
      </div>

      {/* Running indicator */}
      {running && (
        <GlassCard className="border-indigo-500/20 bg-indigo-500/5">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Generating blog posts…</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Fetching RSS feeds, calling OpenAI GPT-4o, and publishing. This takes up to 60 seconds.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Run result */}
      {runResult && !running && (
        <GlassCard
          className={
            runResult.errors.length === 0 && runResult.created.length > 0
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-amber-500/20 bg-amber-500/5"
          }
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {runResult.errors.length > 0 ? (
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              )}
              <p className="text-sm font-medium text-white">
                {runResult.created.length > 0
                  ? `${runResult.created.length} post${runResult.created.length > 1 ? "s" : ""} published!`
                  : runResult.errors.length > 0
                  ? "Run completed with errors"
                  : "No new posts (all topics already published)"}
              </p>
              {runResult.durationSeconds > 0 && (
                <span className="text-xs text-slate-500 ml-auto">{runResult.durationSeconds}s</span>
              )}
            </div>

            {runResult.created.length > 0 && (
              <div className="space-y-1">
                {runResult.created.map((slug) => (
                  <a
                    key={slug}
                    href={`/blog/${slug}`}
                    target="_blank"
                    className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-indigo-300 hover:text-white hover:bg-white/10 transition"
                  >
                    <FileText className="h-3 w-3 shrink-0" />
                    /blog/{slug}
                  </a>
                ))}
              </div>
            )}

            {runResult.skipped.length > 0 && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <SkipForward className="h-3 w-3" />
                {runResult.skipped.length} topic{runResult.skipped.length > 1 ? "s" : ""} skipped (already published)
              </p>
            )}

            {runResult.errors.length > 0 && (
              <div className="space-y-1">
                {runResult.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {e}
                  </p>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Last run details */}
      {log && !runResult && (log.created.length > 0 || log.errors.length > 0) && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Last Run Details
          </h4>
          {log.created.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Published:</p>
              {log.created.map((slug) => (
                <a
                  key={slug}
                  href={`/blog/${slug}`}
                  target="_blank"
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-indigo-300 hover:text-white hover:bg-white/10 transition"
                >
                  <FileText className="h-3 w-3 shrink-0" />
                  /blog/{slug}
                </a>
              ))}
            </div>
          )}
          {log.errors.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Errors:</p>
              {log.errors.map((e, i) => (
                <p key={i} className="text-xs text-red-400">{e}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* How it works */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          How It Works
        </h4>
        <ol className="space-y-2 text-xs text-slate-400 list-none">
          {[
            "Fetches trending AI/ML stories from HuggingFace, ArXiv, TechCrunch, ML Mastery & HackerNews RSS feeds",
            "Filters for AI, ML, LLM, and healthcare technology relevance",
            "Generates 2–3 full SEO-optimized articles via OpenAI GPT-4o (1800–2500 words each)",
            "Auto-publishes posts with SEO-friendly slugs, excerpts, and tags",
            "Revalidates /blog and homepage so posts appear instantly",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[9px] font-bold text-indigo-300 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
