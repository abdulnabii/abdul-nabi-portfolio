"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
  Flame,
  GitCommit,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Sparkles,
  Shield,
  Terminal,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Key,
  Lock,
  Check,
} from "lucide-react";

export function StreakKeeperPanel() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [streakData, setStreakData] = useState<any>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [gitOutput, setGitOutput] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  async function loadStreakInfo() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/streak-keeper");
      const data = await res.json();
      if (data.ok) {
        setStreakData(data.data);
        if (!data.data.hasGitHubToken) {
          setShowTokenInput(true);
        }
      }
    } catch (err) {
      console.error("[StreakKeeperPanel] load error", err);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    loadStreakInfo();
  }, []);

  async function triggerStreakPush() {
    setLoading(true);
    setGitOutput(null);
    setSuccessToast(null);

    try {
      const res = await fetch("/api/admin/streak-keeper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: customMessage.trim() || undefined,
          githubToken: githubToken.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to push streak ping");
      }

      setGitOutput(data.gitLog || "GitHub commit & push completed successfully!");
      setSuccessToast(`🎉 Streak kept alive! Pushed commit ${data.commitHash} (Day ${data.streakDays})`);
      setCustomMessage("");
      if (githubToken) {
        setGithubToken("");
      }
      loadStreakInfo();
    } catch (err: any) {
      setGitOutput(`Error: ${err.message}`);
      alert(err.message || "Failed to push streak");
    } finally {
      setLoading(false);
    }
  }

  const isTodayActive = streakData?.isPushedToday;
  const streakCount = streakData?.streakDays || 42;
  const hasToken = streakData?.hasGitHubToken;

  return (
    <GlassCard padding="lg" elevated className="border-indigo-500/20 bg-[#080d1e]/80 space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-rose-500/10 text-amber-400 shadow-lg shadow-amber-500/20">
            <Flame className="h-6 w-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">GitHub Streak Keeper</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                  isTodayActive
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : "border-amber-500/40 bg-amber-500/15 text-amber-300"
                }`}
              >
                {isTodayActive ? "🟢 Active Today" : "⏳ Pending Today"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cloud GitHub REST API 1-click commit engine + daily automated scheduler.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadStreakInfo}
            disabled={fetching}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10"
            title="Refresh status"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${fetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <a
            href="https://github.com/abdulnabii/abdul-nabi-portfolio/commits/main"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
          >
            <span>GitHub Commits</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* ── Status Metrics Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            Current Streak
          </p>
          <p className="text-2xl font-extrabold text-white">
            {streakCount} <span className="text-xs font-normal text-slate-400">Days</span>
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Today&apos;s Status
          </p>
          <p className={`text-sm font-bold mt-1 ${isTodayActive ? "text-emerald-300" : "text-amber-300"}`}>
            {isTodayActive ? "Logged & Pushed" : "Commit Needed"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <GitCommit className="h-3.5 w-3.5 text-indigo-400" />
            Latest Commit
          </p>
          <p className="text-xs font-mono font-bold text-indigo-300 truncate">
            {streakData?.currentHash || streakData?.lastCommitHash || "HEAD"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-purple-400" />
            Daily Auto-Cron
          </p>
          <p className="text-xs font-bold text-purple-300">
            00:05 UTC (05:05 PKT)
          </p>
        </div>
      </div>

      {/* ── 1-Click Push Control Area ── */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/30 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              1-Click Cloud GitHub Streak Push
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Pushes a verified commit directly to your GitHub repository using the GitHub REST API.
            </p>
          </div>

          <Button
            onClick={triggerStreakPush}
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Pushing to GitHub...
              </>
            ) : (
              <>
                <Flame className="h-4 w-4 fill-amber-400 text-amber-400" />
                Push Daily Streak Ping Now
              </>
            )}
          </Button>
        </div>

        {/* ── GitHub Personal Access Token Configuration ── */}
        <div className="pt-2 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowTokenInput((v) => !v)}
              className="text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition"
            >
              <Key className="h-3 w-3 text-indigo-400" />
              <span>GitHub API Token Configuration</span>
              {hasToken ? (
                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.2 text-[10px] text-emerald-300 flex items-center gap-0.5">
                  <Check className="h-2.5 w-2.5" /> Connected
                </span>
              ) : (
                <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 text-[10px] text-amber-300">
                  Required for Cloud Push
                </span>
              )}
              {showTokenInput ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </button>

            <a
              href="https://github.com/settings/tokens/new?description=Abdul+Nabi+Portfolio+Streak+Keeper&scopes=repo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5"
            >
              <span>Create GitHub Token (repo scope)</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          {showTokenInput && (
            <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3 space-y-2 animate-fade-in text-xs">
              <label className="text-[11px] font-semibold text-slate-400 block">
                GitHub Personal Access Token (PAT)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder={hasToken ? "•••••••••••••••••••••••••••••••• (Token configured)" : "ghp_... or github_pat_..."}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Token is stored securely in Supabase / environment. Required so Vercel can commit directly to GitHub without needing the local git command.
              </p>
            </div>
          )}
        </div>

        {/* Optional Custom Message Toggle */}
        <div className="pt-1">
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            <span>Custom commit message options</span>
            {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {showAdvanced && (
            <div className="mt-2 space-y-2 animate-fade-in">
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="e.g., feat(core): daily feature improvements & bugfixes"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <div className="flex flex-wrap gap-1.5">
                {[
                  "chore(streak): daily developer streak activity ping",
                  "feat(core): daily code optimization & feature polish",
                  "docs(readme): update project documentation & roadmap",
                  "fix(app): minor performance tuning & security audit",
                ].map((msg) => (
                  <button
                    key={msg}
                    onClick={() => setCustomMessage(msg)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Success Toast Banner ── */}
      {successToast && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs text-emerald-300 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-slate-400 hover:text-white text-xs px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Terminal Output Log ── */}
      {gitOutput && (
        <div className="space-y-1.5 animate-fade-in">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Terminal className="h-3.5 w-3.5 text-indigo-400" />
              Execution Output:
            </span>
            <button onClick={() => setGitOutput(null)} className="hover:text-white">
              Clear
            </button>
          </div>
          <pre className="rounded-xl border border-white/10 bg-slate-950 p-3 font-mono text-[11px] text-indigo-200 overflow-x-auto max-h-32">
            <code>{gitOutput}</code>
          </pre>
        </div>
      )}
    </GlassCard>
  );
}
