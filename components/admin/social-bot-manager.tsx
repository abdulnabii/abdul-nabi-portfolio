"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import type { MiniProject } from "@/lib/mini-projects-store";
import type { SocialPost } from "@/lib/social-bot-store";
import {
  Bot,
  Check,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Linkedin,
  Loader2,
  MessageSquare,
  Rocket,
  Share2,
  Sparkles,
  Trash2,
  Twitter,
} from "lucide-react";

export function SocialBotManager() {
  const [miniProjects, setMiniProjects] = useState<MiniProject[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("https://www.aiwithab.site/profile.jpg");

  const [activeTab, setActiveTab] = useState<"linkedin" | "reddit" | "twitter">("linkedin");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<SocialPost | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [projRes, postRes] = await Promise.all([
        fetch("/api/mini-projects"),
        fetch("/api/admin/social-bot"),
      ]);

      const projData = await projRes.json();
      const postData = await postRes.json();

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
    } catch (err) {
      console.error("Failed to load Social Bot data", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
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
      <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-900/30 via-slate-900/60 to-purple-900/30 p-6 md:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <Bot className="h-4 w-4" />
              Automated Social Content Engine
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              LinkedIn & Reddit Automation Bot with Picture Cards
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Auto-generate viral posts with picture banner previews for LinkedIn, Reddit, and Twitter. 1-click launch posts pre-filled with content and visual project banners!
            </p>
          </div>

          {/* Generator Controls */}
          <div className="w-full md:w-80 shrink-0 bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Mini Project to Promote
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              {miniProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  Day {String(p.dayNumber).padStart(2, "0")} — {p.title}
                </option>
              ))}
              <option value="custom">✏️ Custom Topic / Custom Project</option>
            </select>

            {selectedProjectId === "custom" && (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  placeholder="Project Title..."
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                />
                <textarea
                  placeholder="Short Description..."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                <ImageIcon className="h-3 w-3 text-indigo-400" />
                Picture / Banner Image URL:
              </label>
              <input
                type="text"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://.../preview.jpg"
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white"
              />
            </div>

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
                  Auto-Generate Social Posts
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Campaign Workspace */}
      {activePost ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Active Post Studio */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-4">
              <div>
                <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider">
                  Active Campaign
                </span>
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
                    LinkedIn Post Blueprint (Includes Banner Picture Card)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToClipboard(activePost.linkedInContent, "linkedin")}
                      className="text-xs"
                    >
                      {copiedKey === "linkedin" ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy Text
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => launchLinkedInShare(activePost)}
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Launch LinkedIn Share 🚀
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToClipboard(activePost.redditContent, "reddit")}
                      className="text-xs"
                    >
                      {copiedKey === "reddit" ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy Markdown
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => launchRedditSubmit(activePost)}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Submit to Reddit 🚀
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
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy Tweet
                        </>
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
                    <p className="text-xs font-bold text-white truncate">{post.title}</p>
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
            Select a project above and click &quot;Auto-Generate Social Posts&quot; to instantly draft LinkedIn and Reddit posts with pictures!
          </p>
        </div>
      )}
    </div>
  );
}
