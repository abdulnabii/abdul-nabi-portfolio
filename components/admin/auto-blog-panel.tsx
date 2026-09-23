"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  RefreshCw,
  Zap,
  Power,
  PowerOff,
  Search,
  ImageIcon,
  ExternalLink,
  Edit3,
  ChevronDown,
  ChevronUp,
  Globe,
  Radio,
} from "lucide-react";
import Link from "next/link";

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
}

interface CronLog {
  lastRun: string | null;
  created: string[];
  skipped: string[];
  errors: string[];
  durationSeconds: number;
}

interface GeneratedPostResult {
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  coverImage: string;
  readTime: string;
  date: string;
}

const TOPIC_PRESETS = [
  { label: "⚡ Full-Stack & Next.js 15", query: "Next.js 15 Server Actions and React 19 architecture" },
  { label: "🔥 DeepSeek V3 & Open Weights", query: "DeepSeek V3 multi-head latent attention open weights" },
  { label: "🛡️ Cybersecurity & AppSec", query: "AI Application Security threat modeling prompt injection" },
  { label: "🤖 Autonomous AI Agents", query: "Agentic AI workflows tool calling and autonomous loops" },
  { label: "🏥 Healthcare & Clinical AI", query: "Machine learning clinical disease risk prediction" },
  { label: "🌐 Cloud & pgvector Scale", query: "PostgreSQL pgvector scalable RAG architectures" },
];

const GENERATION_STEPS = [
  { id: 1, label: "Scanning Trending IT & Tech News", desc: "Searching Hacker News, Google News Tech, ArXiv & Dev feeds..." },
  { id: 2, label: "Synthesizing In-Depth Technical Post", desc: "Drafting code snippets, architecture diagrams & benchmarks in Abdul Nabi's voice..." },
  { id: 3, label: "Resolving High-Definition Cover Image", desc: "Selecting 4K award-winning editorial photography or rendering 3D artwork..." },
  { id: 4, label: "Publishing & Revalidating Site", desc: "Writing to Supabase database, updating sitemap, and clearing page caches..." },
];

export function AutoBlogPanel() {
  const [topicInput, setTopicInput] = useState("");
  const [category, setCategory] = useState("Software Architecture");
  const [imageStyle, setImageStyle] = useState("ai_flux");
  const [publishImmediate, setPublishImmediate] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [latestPost, setLatestPost] = useState<GeneratedPostResult | null>(null);
  const [analyzedNews, setAnalyzedNews] = useState<NewsItem[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showNewsDrawer, setShowNewsDrawer] = useState(false);

  // Background cron logs and toggle
  const [log, setLog] = useState<CronLog | null>(null);
  const [loadingLog, setLoadingLog] = useState(true);
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
    } catch {} finally {
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
    } catch {} finally {
      setTogglingEnabled(false);
    }
  }

  // Timer & step simulator during active generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generating) {
      setCurrentStep(1);
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((sec) => {
          const next = sec + 1;
          if (next >= 4 && next < 14) setCurrentStep(2);
          else if (next >= 14 && next < 24) setCurrentStep(3);
          else if (next >= 24) setCurrentStep(4);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [generating]);

  async function handleGenerateAndPublish() {
    setGenerating(true);
    setGenerationError(null);
    setLatestPost(null);
    setAnalyzedNews([]);

    try {
      const res = await fetch("/api/admin/auto-blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicInput.trim(),
          category,
          imageStyle,
          published: publishImmediate,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.post) {
        setLatestPost(data.post);
        setAnalyzedNews(data.analyzedNews || []);
        fetchLog();
      } else {
        setGenerationError(data.error || "Failed to generate blog post. Please try again.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error contacting generator";
      setGenerationError(msg);
    } finally {
      setGenerating(false);
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
            <h3 className="text-lg font-semibold text-white">AI Blog Post Bot</h3>
            <Badge variant="accent" className="text-[10px] bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
              TRENDING NEWS → AI IMAGE → PUBLISH
            </Badge>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl">
            Give the bot a topic or keyword seed. It analyzes real-time trending IT news, crafts an in-depth technical post in your voice, generates a 3D AI cover image, and publishes it live to your portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLog}
            disabled={loadingLog}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className={`h-3 w-3 ${loadingLog ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Interactive Control Card */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/30 p-5 shadow-[0_0_30px_rgba(99,102,241,0.08)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Radio className="h-3.5 w-3.5 animate-pulse text-indigo-400" />
            Interactive Content Generator
          </div>
          <span className="text-[11px] text-slate-400">
            Powered by Tech News RSS + Flux AI
          </span>
        </div>

        {/* Input prompt area */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span>Topic, Concept, or News Seed:</span>
            <span className="text-[11px] text-slate-500">Leave empty to auto-discover trending tech headlines</span>
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Next.js 15 Server Actions, DeepSeek V3 architecture, AI Agent Security, pgvector scale..."
              className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              disabled={generating}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !generating) {
                  e.preventDefault();
                  handleGenerateAndPublish();
                }
              }}
            />
          </div>
        </div>

        {/* Quick Topic Pills */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-slate-400">Quick Trending Presets:</p>
          <div className="flex flex-wrap gap-1.5">
            {TOPIC_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setTopicInput(preset.query)}
                disabled={generating}
                className="rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-300 transition hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Category:</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={generating}
                className="rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="Software Architecture">Software Architecture</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Full-Stack Web">Full-Stack Web</option>
                <option value="Application Security">Application Security</option>
                <option value="Healthcare Tech">Healthcare Tech</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Image Style:</span>
              <select
                value={imageStyle}
                onChange={(e) => setImageStyle(e.target.value)}
                disabled={generating}
                className="rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none font-medium"
              >
                <option value="ai_flux">✨ AI: Bespoke Flux 3D Artwork (100% Unique - Recommended)</option>
                <option value="ai_prism">🎨 AI: 3D Minimalist Prism (Apple / Linear style)</option>
                <option value="ai_studio">🔬 AI: Studio Tech Photography (Hasselblad)</option>
                <option value="ai_cyber">⚡ AI: Cybernetic Dark Mode</option>
                <option value="curated_hd">📸 4K Editorial Photography (Unsplash)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={publishImmediate}
                onChange={(e) => setPublishImmediate(e.target.checked)}
                disabled={generating}
                className="rounded border-white/20 bg-black/40 text-indigo-500 focus:ring-0"
              />
              <span>Publish Live Immediately</span>
            </label>
          </div>

          <Button
            onClick={handleGenerateAndPublish}
            disabled={generating}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 border-0 px-5"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating & Publishing… ({elapsedSeconds}s)
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-300" />
                Generate & Publish with AI
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Real-time 4-Step Progress Stepper during Generation */}
      {generating && (
        <GlassCard className="border-indigo-500/30 bg-indigo-950/20 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              Bot is executing live pipeline ({elapsedSeconds}s elapsed)
            </div>
            <span className="text-xs text-indigo-300 font-mono">Step {currentStep} of 4</span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {GENERATION_STEPS.map((step) => {
              const isPast = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <div
                  key={step.id}
                  className={`rounded-xl p-3 border transition-all duration-300 ${
                    isCurrent
                      ? "border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500/40"
                      : isPast
                      ? "border-emerald-500/40 bg-emerald-500/5 text-slate-300"
                      : "border-white/5 bg-white/[0.02] opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {isPast ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 text-indigo-400 animate-spin shrink-0" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-slate-600 text-[10px] flex items-center justify-center text-slate-500 shrink-0">
                        {step.id}
                      </span>
                    )}
                    <p className="text-xs font-semibold text-white truncate">{step.label}</p>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Error alert */}
      {generationError && !generating && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">Generation Notice</p>
            <p className="text-xs text-red-300/90 mt-0.5">{generationError}</p>
          </div>
        </div>
      )}

      {/* Live Generated Result Card */}
      {latestPost && !generating && (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900/80 to-slate-950 p-5 space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.08)]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <h4 className="text-base font-semibold text-white">Article Successfully Published!</h4>
              <Badge variant="accent" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                LIVE ON SITE
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/blog/${latestPost.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/30 hover:text-white transition"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Live Post
              </Link>
              <Link
                href={`/admin/blogs/${latestPost.slug}/edit`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit in Admin
              </Link>
            </div>
          </div>

          {/* Post preview grid */}
          <div className="grid gap-4 md:grid-cols-[240px_1fr] items-start pt-1">
            {/* Generated Cover Image */}
            <div className="relative aspect-[16/9] md:aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-slate-950">
              {latestPost.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={latestPost.coverImage}
                  alt={latestPost.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <ImageIcon className="h-8 w-8 mb-1" />
                  <span className="text-xs">Generated Image</span>
                </div>
              )}
              <span className="absolute bottom-2 left-2 rounded bg-black/70 backdrop-blur px-1.5 py-0.5 text-[10px] font-mono text-white">
                {latestPost.coverImage?.includes("unsplash.com") ? "4K Editorial Unsplash" : "1200x630 AI Render"}
              </span>
            </div>

            {/* Post Metadata & Excerpt */}
            <div className="space-y-2">
              <h5 className="text-lg font-bold text-white leading-snug">{latestPost.title}</h5>
              <p className="text-xs text-slate-400 line-clamp-3">{latestPost.excerpt}</p>
              
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {latestPost.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                <span>Slug: <code className="text-slate-400">/blog/{latestPost.slug}</code></span>
                <span>•</span>
                <span>{latestPost.readTime}</span>
                <span>•</span>
                <span>{latestPost.date}</span>
              </div>
            </div>
          </div>

          {/* Analyzed News Sources Dropdown */}
          {analyzedNews.length > 0 && (
            <div className="pt-2 border-t border-white/5">
              <button
                onClick={() => setShowNewsDrawer(!showNewsDrawer)}
                className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-white transition py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-indigo-400" />
                  Analyzed Trending News Sources ({analyzedNews.length} verified references)
                </span>
                {showNewsDrawer ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showNewsDrawer && (
                <div className="mt-2 space-y-1.5 pl-2">
                  {analyzedNews.map((news, i) => (
                    <div key={i} className="rounded-lg bg-black/30 p-2 text-xs border border-white/5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-200">{news.title}</span>
                        <span className="text-[10px] font-mono text-indigo-300 shrink-0">{news.source}</span>
                      </div>
                      {news.summary && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{news.summary}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Automated Daily Background Cron Configuration */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Daily Background Automation (Cron)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Runs automatically every day at 8:00 AM PKT (3:00 AM UTC) to publish fresh posts.
            </p>
          </div>

          {/* Automation Switch */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggle}
              disabled={togglingEnabled || enabled === null}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
            >
              {enabled ? (
                <>
                  <Power className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Automation Active</span>
                </>
              ) : (
                <>
                  <PowerOff className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-red-300">Automation Paused</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status metrics */}
        <div className="grid gap-3 sm:grid-cols-3 pt-1">
          <GlassCard>
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Clock className="h-4 w-4 text-indigo-400" />
              <span className="text-xs uppercase tracking-wider text-slate-500">Last Cron Run</span>
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
              <span className="text-xs uppercase tracking-wider text-slate-500">Latest Batch</span>
            </div>
            <p className="text-2xl font-semibold text-emerald-300 mt-1">
              {log?.created?.length ?? 0} published
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
      </div>
    </div>
  );
}
