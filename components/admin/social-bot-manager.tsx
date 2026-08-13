"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import type { MiniProject } from "@/lib/mini-projects-store";
import type { SocialPost } from "@/lib/social-bot-store";
import type { SocialCredentials } from "@/lib/social-credentials-store";
import {
  AlertCircle,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Key,
  Linkedin,
  Loader2,
  Lock,
  MessageSquare,
  Play,
  PlayCircle,
  Power,
  Rocket,
  Send,
  Share2,
  Sparkles,
  Trash2,
  Twitter,
  X,
} from "lucide-react";

export function SocialBotManager() {
  const [miniProjects, setMiniProjects] = useState<MiniProject[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [creds, setCreds] = useState<SocialCredentials>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [runningAutoCycle, setRunningAutoCycle] = useState(false);

  const [showCredsModal, setShowCredsModal] = useState(false);
  const [savingCreds, setSavingCreds] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testingToken, setTestingToken] = useState(false);
  const [tokenTestResult, setTokenTestResult] = useState<{ valid: boolean; name?: string; urn?: string; error?: string } | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("https://www.aiwithab.site/api/project-banner?day=1");

  const [activeTab, setActiveTab] = useState<"linkedin" | "reddit" | "twitter">("linkedin");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<SocialPost | null>(null);

  useEffect(() => {
    fetchData();
    // Read OAuth result from URL params (set by callback redirect)
    const params = new URLSearchParams(window.location.search);
    const oauthSuccess = params.get("oauth_success");
    const oauthError = params.get("oauth_error");
    if (oauthSuccess) {
      setStatusMessage({ type: "success", text: decodeURIComponent(oauthSuccess) });
      // Also auto-verify token
      setTimeout(() => handleTestConnection(), 1500);
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (oauthError) {
      setStatusMessage({ type: "error", text: decodeURIComponent(oauthError) });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [projRes, postRes, credRes] = await Promise.all([
        fetch("/api/mini-projects"),
        fetch("/api/admin/social-bot"),
        fetch("/api/admin/social-bot/credentials"),
      ]);

      const projData = await projRes.json();
      const postData = await postRes.json();
      const credData = await credRes.json();

      if (projData.miniProjects) {
        setMiniProjects(projData.miniProjects);
        if (projData.miniProjects.length > 0) {
          setSelectedProjectId(projData.miniProjects[0].id);
        }
      }

      if (postData.posts) {
        setSocialPosts(postData.posts);
        if (postData.posts.length > 0) {
          setActivePost(postData.posts[0]);
        }
      }

      if (credData.creds) {
        setCreds(credData.creds);
      }
    } catch (err) {
      console.error("Failed to load Social Bot data", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleAutoPoster(active: boolean) {
    const nextCreds = { ...creds, autoPosterActive: active };
    setCreds(nextCreds);
    try {
      await fetch("/api/admin/social-bot/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextCreds),
      });
      setStatusMessage({
        type: "success",
        text: active ? "🤖 Auto-Poster Bot Activated! Will post automatically on schedule." : "⏸️ Auto-Poster Bot Paused.",
      });
    } catch {}
  }

  async function handleRunAutoCycleNow() {
    setRunningAutoCycle(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/cron/auto-social-post?force=true", { cache: "no-store" });
      const data = await res.json();
      if (data.ok && data.log) {
        setStatusMessage({
          type: "success",
          text: `⚡ Auto-Poster Cycle Finished! Target: ${data.log.projectTitle}. LinkedIn: ${data.log.linkedInStatus}. Reddit: ${data.log.redditStatus}`,
        });
        if (data.post) {
          setSocialPosts((prev) => [data.post, ...prev]);
          setActivePost(data.post);
        }
        fetchData();
      } else {
        setStatusMessage({ type: "error", text: data.error || "Auto-poster cycle returned an error." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to trigger auto-post cycle." });
    } finally {
      setRunningAutoCycle(false);
    }
  }

  async function handleSaveCredentials() {
    setSavingCreds(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/social-bot/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creds),
      });

      const data = await res.json();
      if (data.ok) {
        setStatusMessage({ type: "success", text: "Social API Credentials saved successfully!" });
        setTimeout(() => setShowCredsModal(false), 1200);
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to save credentials." });
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Exception saving credentials." });
    } finally {
      setSavingCreds(false);
    }
  }

  async function handleTestConnection() {
    if (!creds.linkedInAccessToken) {
      setTokenTestResult({ valid: false, error: "Please paste your LinkedIn Access Token in the box first." });
      return;
    }
    setTestingToken(true);
    setTokenTestResult(null);
    try {
      const res = await fetch("/api/admin/social-bot/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: creds.linkedInAccessToken }),
      });
      const data = await res.json();
      setTokenTestResult(data);
      if (data.valid) {
        // URN was auto-fetched & auto-saved
        setCreds((prev) => ({ ...prev, linkedInPersonUrn: data.urn }));
        await fetchData();
        setStatusMessage({ type: "success", text: `✅ LinkedIn token verified & saved! Connected as ${data.name || data.urn}` });
      } else {
        setStatusMessage({ type: "error", text: `❌ ${data.error}` });
      }
    } catch (err: any) {
      setTokenTestResult({ valid: false, error: err.message });
    } finally {
      setTestingToken(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setStatusMessage(null);
    try {
      let payload: { miniProjectId?: string; customProj?: Partial<MiniProject>; imageUrl?: string } = {
        imageUrl: imageUrlInput || "https://www.aiwithab.site/profile.jpg",
      };

      if (selectedProjectId === "custom") {
        payload.customProj = {
          title: customTitle || "AI Micro Application",
          description: customDesc || "Full-stack web application built with Next.js 14 and Gemini API.",
          category: "Full-Stack AI",
          vercelUrl: "https://www.aiwithab.site/mini-projects",
          tags: ["Next.js 14", "TypeScript", "AI Engine"],
        };
      } else {
        payload.miniProjectId = selectedProjectId;
      }

      const res = await fetch("/api/admin/social-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.ok && data.post) {
        setSocialPosts([data.post, ...socialPosts]);
        setActivePost(data.post);
      }
    } catch (err) {
      console.error("Failed to generate social post", err);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDirectPublish(platform: "linkedin" | "reddit") {
    if (!activePost) return;
    setPublishing(platform);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/social-bot/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: activePost.id, targetPlatform: platform }),
      });

      const data = await res.json();
      if (data.ok) {
        setStatusMessage({
          type: "success",
          text: data.message || `Successfully published directly to ${platform}!`,
        });
        setActivePost({ ...activePost, status: "Posted" });
        setSocialPosts((prev) =>
          prev.map((p) => (p.id === activePost.id ? { ...p, status: "Posted" } : p))
        );
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || `Direct posting to ${platform} failed. Check your API credentials.`,
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to publish post." });
    } finally {
      setPublishing(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this social post campaign?")) return;
    try {
      const res = await fetch(`/api/admin/social-bot?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const next = socialPosts.filter((p) => p.id !== id);
        setSocialPosts(next);
        if (activePost?.id === id) {
          setActivePost(next[0] || null);
        }
      }
    } catch (err) {
      console.error("Failed to delete social post", err);
    }
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function launchLinkedInShare(post: SocialPost) {
    const shareUrl = encodeURIComponent(post.vercelUrl || "https://www.aiwithab.site/mini-projects");
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, "_blank");
  }

  function launchRedditSubmit(post: SocialPost) {
    const lines = post.redditContent.split("\n");
    let title = post.title;
    if (lines[0] && lines[0].startsWith("Title: ")) {
      title = lines[0].replace("Title: ", "").trim();
    }
    const body = lines.slice(2).join("\n");
    const sub = (post.redditSubreddit || "r/webdev").replace("r/", "");

    const url = `https://www.reddit.com/r/${sub}/submit?title=${encodeURIComponent(
      title
    )}&text=${encodeURIComponent(body)}`;
    window.open(url, "_blank");
  }

  function launchTwitterPost(post: SocialPost) {
    const text = encodeURIComponent(post.twitterContent);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  }

  // Token is "linked" when it exists AND either hasn't been tested yet, or the test passed
  const isLinkedInLinked = !!(creds.linkedInAccessToken && creds.linkedInPersonUrn);
  const isTokenVerified = tokenTestResult?.valid === true;
  const isTokenFailed = tokenTestResult?.valid === false;
  const isRedditLinked = !!(creds.redditClientId && creds.redditUsername && creds.redditPassword);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-900/30 via-slate-900/60 to-purple-900/30 p-6 md:p-8 backdrop-blur-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                <Bot className="h-4 w-4" />
                Automated Social Content Engine
              </span>

              {isLinkedInLinked && isTokenVerified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300">
                  <Linkedin className="h-3.5 w-3.5" /> ✅ LinkedIn Verified — {tokenTestResult?.name || "Connected"}
                </span>
              ) : isLinkedInLinked && isTokenFailed ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-xs font-bold text-rose-300 cursor-pointer" onClick={() => setShowCredsModal(true)}>
                  <Linkedin className="h-3.5 w-3.5" /> ❌ Token Expired — Click to Fix
                </span>
              ) : isLinkedInLinked ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-bold text-amber-300 cursor-pointer" onClick={handleTestConnection}>
                  <Linkedin className="h-3.5 w-3.5" /> {testingToken ? "Testing..." : "⚠️ Token Unverified — Click to Test"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-xs font-bold text-rose-300 cursor-pointer" onClick={() => setShowCredsModal(true)}>
                  <Linkedin className="h-3.5 w-3.5" /> 🔴 LinkedIn Token Required
                </span>
              )}

              {isRedditLinked ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 px-3 py-1 text-xs font-bold text-orange-300">
                  <MessageSquare className="h-3.5 w-3.5" /> 🟢 Reddit Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 border border-white/10 px-3 py-1 text-xs font-medium text-slate-400">
                  <MessageSquare className="h-3.5 w-3.5" /> Reddit Unlinked
                </span>
              )}

              {creds.autoPosterActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300 animate-pulse">
                  <Power className="h-3.5 w-3.5" /> Auto-Poster ACTIVE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 border border-white/10 px-3 py-1 text-xs font-medium text-slate-400">
                  <Power className="h-3.5 w-3.5" /> Auto-Poster Paused
                </span>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Automated Work Content & Social Bot Scheduler
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Auto-generate and auto-publish content related to your mini projects & portfolio builds with picture banners to LinkedIn and Reddit on a scheduled cycle!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <Button
              onClick={() => setShowCredsModal(true)}
              variant="secondary"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2"
            >
              <Key className="h-3.5 w-3.5 text-indigo-400" />
              Link Social Accounts
            </Button>
          </div>
        </div>

        {/* Auto-Poster Control Bar */}
        <div className="rounded-2xl border border-indigo-500/30 bg-black/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Auto-Poster Status:</span>
              <button
                onClick={() => handleToggleAutoPoster(!creds.autoPosterActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  creds.autoPosterActive ? "bg-emerald-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    creds.autoPosterActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {creds.lastAutoPostAt && (
              <div className="text-slate-400 flex items-center gap-1 font-mono">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                Last Posted: {new Date(creds.lastAutoPostAt).toLocaleDateString()} {new Date(creds.lastAutoPostAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>

          <Button
            onClick={handleRunAutoCycleNow}
            disabled={runningAutoCycle}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
          >
            {runningAutoCycle ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running Auto-Post Cycle...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                ⚡ Run Auto-Post Cycle Now
              </>
            )}
          </Button>
        </div>

        {/* Generator Controls */}
        <div className="pt-2 grid gap-4 md:grid-cols-3 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Select Mini Project to Promote
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedProjectId(val);
                if (val !== "custom") {
                  const proj = miniProjects.find((p) => p.id === val);
                  if (proj) {
                    const banner =
                      proj.dayNumber === 4
                        ? "https://www.aiwithab.site/blood_sugar_banner.jpg"
                        : `https://www.aiwithab.site/api/project-banner?day=${proj.dayNumber}`;
                    setImageUrlInput(banner);
                  }
                }
              }}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              {miniProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  Day {String(p.dayNumber).padStart(2, "0")} — {p.title}
                </option>
              ))}
              <option value="custom">✏️ Custom Topic / Custom Project</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
              Picture / Banner Image URL
            </label>
            <input
              type="text"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="https://.../preview.jpg"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating AI Posts...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Auto-Generate Social Draft
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Global Status Alert Banner */}
      {statusMessage && (
        <div
          className={`rounded-2xl border p-4 flex items-center gap-3 text-xs font-semibold ${
            statusMessage.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span className="flex-1">{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="opacity-70 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Campaign Workspace */}
      {activePost ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Active Post Studio */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider">
                    Active Campaign
                  </span>
                  {activePost.status === "Posted" && (
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      🟢 Direct Published
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">{activePost.title}</h3>
              </div>

              {/* Platform Switcher Tabs */}
              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                <button
                  onClick={() => setActiveTab("linkedin")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "linkedin"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Linkedin className="h-3.5 w-3.5" />
                  LinkedIn
                </button>
                <button
                  onClick={() => setActiveTab("reddit")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "reddit"
                      ? "bg-orange-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Reddit
                </button>
                <button
                  onClick={() => setActiveTab("twitter")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === "twitter"
                      ? "bg-sky-500 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Twitter className="h-3.5 w-3.5" />
                  Twitter / X
                </button>
              </div>
            </div>

            {/* Platform Content Studio */}
            {activeTab === "linkedin" && (
              <GlassCard padding="lg" className="space-y-4 border-indigo-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn Post Blueprint
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      onClick={() => handleDirectPublish("linkedin")}
                      disabled={publishing === "linkedin"}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                    >
                      {publishing === "linkedin" ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Publishing to LinkedIn...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          Approve & Direct Upload to LinkedIn 🚀
                        </>
                      )}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToClipboard(activePost.linkedInContent, "linkedin")}
                      className="text-xs"
                    >
                      {copiedKey === "linkedin" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>

                    <Button
                      onClick={() => launchLinkedInShare(activePost)}
                      variant="secondary"
                      size="sm"
                      className="text-xs"
                      title="Open Web Share Dialog"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Picture Banner Card */}
                {activePost.imageUrl && (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-3 flex items-center gap-4">
                    <img
                      src={activePost.imageUrl}
                      alt="LinkedIn Post Preview Graphic"
                      className="h-16 w-28 object-cover rounded-xl border border-white/10"
                    />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
                        Attached Image Preview
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{activePost.imageUrl}</p>
                    </div>
                  </div>
                )}

                <textarea
                  value={activePost.linkedInContent}
                  onChange={(e) =>
                    setActivePost({ ...activePost, linkedInContent: e.target.value })
                  }
                  rows={14}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 p-4 font-sans text-xs leading-relaxed text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </GlassCard>
            )}

            {activeTab === "reddit" && (
              <GlassCard padding="lg" className="space-y-4 border-orange-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-orange-400 font-semibold text-xs">
                    <MessageSquare className="h-4 w-4" />
                    Reddit Post Blueprint ({activePost.redditSubreddit})
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      onClick={() => handleDirectPublish("reddit")}
                      disabled={publishing === "reddit"}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                    >
                      {publishing === "reddit" ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Submitting to Reddit...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          Approve & Direct Upload to Reddit 🚀
                        </>
                      )}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToClipboard(activePost.redditContent, "reddit")}
                      className="text-xs"
                    >
                      {copiedKey === "reddit" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>

                    <Button
                      onClick={() => launchRedditSubmit(activePost)}
                      variant="secondary"
                      size="sm"
                      className="text-xs"
                      title="Open Web Submit Dialog"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Picture Banner Card */}
                {activePost.imageUrl && (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-3 flex items-center gap-4">
                    <img
                      src={activePost.imageUrl}
                      alt="Reddit Post Embedded Graphic"
                      className="h-16 w-28 object-cover rounded-xl border border-white/10"
                    />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5 text-orange-400" />
                        Embedded Markdown Banner Image
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">![Project Preview Banner]({activePost.imageUrl})</p>
                    </div>
                  </div>
                )}

                <textarea
                  value={activePost.redditContent}
                  onChange={(e) =>
                    setActivePost({ ...activePost, redditContent: e.target.value })
                  }
                  rows={14}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 p-4 font-mono text-xs leading-relaxed text-slate-200 focus:border-orange-500 focus:outline-none"
                />
              </GlassCard>
            )}

            {activeTab === "twitter" && (
              <GlassCard padding="lg" className="space-y-4 border-sky-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
                    <Twitter className="h-4 w-4" />
                    Twitter / X Thread Blueprint
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToClipboard(activePost.twitterContent, "twitter")}
                      className="text-xs"
                    >
                      {copiedKey === "twitter" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      onClick={() => launchTwitterPost(activePost)}
                      size="sm"
                      className="bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Post to Twitter 🚀
                    </Button>
                  </div>
                </div>

                <textarea
                  value={activePost.twitterContent}
                  onChange={(e) =>
                    setActivePost({ ...activePost, twitterContent: e.target.value })
                  }
                  rows={10}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 p-4 font-sans text-xs leading-relaxed text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </GlassCard>
            )}
          </div>

          {/* Saved Campaigns Sidebar */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Saved Campaigns ({socialPosts.length})
            </h4>
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {socialPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setActivePost(post)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    activePost?.id === post.id
                      ? "border-indigo-500 bg-indigo-500/10 shadow-md"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white truncate">{post.title}</p>
                      {post.status === "Posted" && (
                        <span className="text-[10px] text-emerald-400 font-semibold">✓</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(post.createdAt).toLocaleDateString()} • {post.category}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post.id);
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center">
          <Bot className="h-10 w-10 text-indigo-400 mx-auto mb-3 opacity-60" />
          <p className="text-white font-semibold text-base">No social post campaigns generated yet.</p>
          <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
            Select a project above and click &quot;Auto-Generate Social Draft&quot; to draft posts for LinkedIn and Reddit!
          </p>
        </div>
      )}

      {/* Account Linking & OAuth Modal */}
      {showCredsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-400" />
                <h3 className="text-xl font-bold text-white">Link Social API Credentials</h3>
              </div>
              <button
                onClick={() => setShowCredsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1 text-xs">
              {/* LinkedIn Section */}
              <div className="space-y-3 p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5">
                <div className="flex items-center justify-between font-bold text-indigo-300">
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn REST API Credentials
                  </div>
                  <a
                    href="https://www.linkedin.com/developers/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 font-normal"
                  >
                    LinkedIn Developer Portal <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* ── ONE-CLICK OAUTH BUTTON ── */}
                <a
                  href="/api/admin/social-bot/oauth/linkedin"
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#0a66c2] hover:bg-[#004182] px-4 py-3 text-sm font-bold text-white transition shadow-lg shadow-blue-900/40"
                >
                  <Linkedin className="h-4 w-4" />
                  Connect with LinkedIn (One-Click OAuth)
                </a>

                <div className="flex items-center gap-2 my-1">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[11px] text-slate-500">or enter token manually</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Connect your LinkedIn account (<strong className="text-white">aiwithab</strong>) to enable 1-click &amp; scheduled auto-posting with project dashboard banners:
                </p>

                <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-3 space-y-1.5 text-[11px] text-indigo-200">
                  <p className="font-bold flex items-center gap-1 text-indigo-300">
                    <Sparkles className="h-3.5 w-3.5" /> How to get your 60-day LinkedIn Token manually:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300">
                    <li>
                      Open{" "}
                      <a
                        href="https://www.linkedin.com/developers/tools/oauth"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 font-semibold underline"
                      >
                        LinkedIn OAuth Token Generator ↗
                      </a>
                    </li>
                    <li>
                      Select your Developer App &amp; check scope <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300">w_member_social</code>
                    </li>
                    <li>
                      Click <strong>Request Access Token</strong>, copy token <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200">AQV...</code> &amp; paste below!
                    </li>
                  </ol>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">LinkedIn Access Token (OAuth 2.0 Token)</label>
                  <input
                    type="password"
                    value={creds.linkedInAccessToken || ""}
                    onChange={(e) => {
                      setCreds({ ...creds, linkedInAccessToken: e.target.value });
                      setTokenTestResult(null); // reset test when token changes
                    }}
                    placeholder="AQV..."
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">LinkedIn Person URN (auto-fetched on Test)</label>
                  <input
                    type="text"
                    value={creds.linkedInPersonUrn || ""}
                    onChange={(e) => setCreds({ ...creds, linkedInPersonUrn: e.target.value })}
                    placeholder="urn:li:person:12345678  (auto-filled on Test Connection)"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>

                {/* Test Connection Button + Result */}
                <div className="space-y-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={testingToken || !creds.linkedInAccessToken}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-600/20 px-3 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-600/40 transition disabled:opacity-40"
                  >
                    {testingToken ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Testing LinkedIn Token...</>
                    ) : (
                      <><CheckCircle2 className="h-3.5 w-3.5" /> Test Connection &amp; Auto-Fetch URN</>
                    )}
                  </button>

                  {tokenTestResult && (
                    <div className={`rounded-xl border px-3 py-2 text-[11px] font-medium ${
                      tokenTestResult.valid
                        ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300"
                        : "border-rose-500/30 bg-rose-950/40 text-rose-300"
                    }`}>
                      {tokenTestResult.valid ? (
                        <>
                          ✅ <strong>Token Valid!</strong> Connected as <strong>{tokenTestResult.name}</strong><br/>
                          URN: <code className="text-emerald-200">{tokenTestResult.urn}</code>
                        </>
                      ) : (
                        <>
                          ❌ <strong>Token Invalid:</strong> {tokenTestResult.error}<br/>
                          <a href="https://www.linkedin.com/developers/tools/oauth" target="_blank" rel="noopener noreferrer" className="underline text-rose-400">Generate a new token ↗</a>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Reddit Section */}
              <div className="space-y-3 p-4 rounded-2xl border border-orange-500/20 bg-orange-500/5">
                <div className="flex items-center gap-2 font-bold text-orange-300">
                  <MessageSquare className="h-4 w-4" />
                  Reddit API Credentials (OAuth2 App)
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Reddit Client ID</label>
                    <input
                      type="text"
                      value={creds.redditClientId || ""}
                      onChange={(e) => setCreds({ ...creds, redditClientId: e.target.value })}
                      placeholder="e.g. k9X_Ab1..."
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Reddit Client Secret</label>
                    <input
                      type="password"
                      value={creds.redditClientSecret || ""}
                      onChange={(e) => setCreds({ ...creds, redditClientSecret: e.target.value })}
                      placeholder="Secret key..."
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Reddit Username</label>
                    <input
                      type="text"
                      value={creds.redditUsername || ""}
                      onChange={(e) => setCreds({ ...creds, redditUsername: e.target.value })}
                      placeholder="Your Reddit Username"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Reddit Password</label>
                    <input
                      type="password"
                      value={creds.redditPassword || ""}
                      onChange={(e) => setCreds({ ...creds, redditPassword: e.target.value })}
                      placeholder="Your Reddit Password"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Button variant="secondary" onClick={() => setShowCredsModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                onClick={handleSaveCredentials}
                disabled={savingCreds}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30"
              >
                {savingCreds ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save API Credentials"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
