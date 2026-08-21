"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BlogPost } from "@/lib/blog-store";
import { formatDate } from "@/lib/utils";
import {
  Pencil,
  Trash2,
  Search,
  Eye,
  Calendar,
  Clock,
  Send,
  X,
  Globe,
  Sparkles,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Archive,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { DeleteModal } from "./delete-modal";

interface BlogListProps {
  posts: BlogPost[];
  initialTrash?: BlogPost[];
}

type TabType = "all" | "published" | "scheduled" | "drafts" | "trash";

function formatRelativeTime(targetIso: string): string {
  const diffMs = new Date(targetIso).getTime() - Date.now();
  if (diffMs <= 0) return "due now";
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 60) return `in ${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  const remMinutes = diffMinutes % 60;
  if (diffHours < 24) return `in ${diffHours}h ${remMinutes > 0 ? `${remMinutes}m` : ""}`;
  const diffDays = Math.floor(diffHours / 24);
  const remHours = diffHours % 24;
  return `in ${diffDays}d ${remHours > 0 ? `${remHours}h` : ""}`;
}

export function BlogList({ posts: initial, initialTrash = [] }: BlogListProps) {
  const [posts, setPosts] = useState(initial);
  const [trash, setTrash] = useState(initialTrash);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Schedule Modal state
  const [schedulingTarget, setSchedulingTarget] = useState<BlogPost | null>(null);
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);
  const router = useRouter();

  // Sync internal state when initial prop changes and merge localStorage blogs
  useEffect(() => {
    let merged = initial;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("an_local_blogs");
        if (raw) {
          const localBlogs = JSON.parse(raw) as BlogPost[];
          if (localBlogs.length > 0) {
            const map = new Map<string, BlogPost>();
            initial.forEach((p) => map.set(p.slug, p));
            localBlogs.forEach((p) => map.set(p.slug, p));
            merged = Array.from(map.values()).sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
          }
        }
      } catch {}
    }
    setPosts(merged);
  }, [initial]);

  useEffect(() => {
    setTrash(initialTrash);
  }, [initialTrash]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const isScheduled = (post: BlogPost) =>
    Boolean(post.scheduledAt && new Date(post.scheduledAt).getTime() > Date.now());

  const scheduledCount = useMemo(
    () => posts.filter((p) => isScheduled(p)).length,
    [posts]
  );
  const publishedCount = useMemo(
    () => posts.filter((p) => p.published && !isScheduled(p)).length,
    [posts]
  );
  const draftCount = useMemo(
    () => posts.filter((p) => !p.published && !isScheduled(p)).length,
    [posts]
  );

  const filteredPosts = useMemo(() => {
    const list = activeTab === "trash" ? trash : posts;

    return list.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      if (activeTab === "trash") return matchesSearch;

      const scheduled = isScheduled(post);
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "published" && post.published && !scheduled) ||
        (activeTab === "scheduled" && scheduled) ||
        (activeTab === "drafts" && !post.published && !scheduled);

      return matchesSearch && matchesTab;
    });
  }, [posts, trash, searchTerm, activeTab]);

  // Move to Bin (Soft Delete)
  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setLoadingDelete(true);
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(deleteTarget.slug)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Delete failed");
      }
      
      const movedItem: BlogPost = {
        ...deleteTarget,
        published: false,
        trashedAt: new Date().toISOString(),
      };

      setPosts((prev) => prev.filter((p) => p.slug !== deleteTarget.slug));
      setTrash((prev) => [movedItem, ...prev.filter((p) => p.slug !== deleteTarget.slug)]);

      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("an_local_blogs");
          if (raw) {
            const localBlogs = (JSON.parse(raw) as BlogPost[]).filter((p) => p.slug !== deleteTarget.slug);
            localStorage.setItem("an_local_blogs", JSON.stringify(localBlogs));
          }
        } catch {}
      }

      setToastMessage(`🗑️ Moved "${deleteTarget.title.slice(0, 30)}..." to Bin.`);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoadingDelete(false);
    }
  }

  // Restore from Bin (either 1-Click Publish or Restore as Draft)
  async function handleRestoreFromTrash(slug: string, publishNow: boolean) {
    setActionLoading(slug);
    try {
      const res = await fetch("/api/blogs/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restore",
          slug,
          publishNow,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to restore blog");
      }

      const data = await res.json();
      const restored = data.post as BlogPost;

      // Update state
      setTrash((prev) => prev.filter((p) => p.slug !== slug));
      if (restored) {
        setPosts((prev) => [restored, ...prev.filter((p) => p.slug !== slug)]);
      }

      setToastMessage(
        publishNow
          ? `🚀 Restored and published live: "${restored?.title?.slice(0, 35)}..."`
          : `📝 Restored to Drafts: "${restored?.title?.slice(0, 35)}..."`
      );
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to restore blog");
    } finally {
      setActionLoading(null);
    }
  }

  // Permanently delete forever from Bin
  async function handlePermanentDelete(slug: string, title: string) {
    if (!confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setActionLoading(slug);
    try {
      const res = await fetch("/api/blogs/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "permanent-delete",
          slug,
        }),
      });

      if (!res.ok) throw new Error("Failed to delete permanently");

      setTrash((prev) => prev.filter((p) => p.slug !== slug));
      setToastMessage(`❌ Permanently deleted "${title.slice(0, 30)}..."`);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    } finally {
      setActionLoading(null);
    }
  }

  // Empty entire bin
  async function handleEmptyTrash() {
    if (!confirm("Are you sure you want to permanently empty the Bin? All trashed articles will be destroyed.")) {
      return;
    }

    setActionLoading("empty-trash");
    try {
      const res = await fetch("/api/blogs/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "empty-trash" }),
      });

      if (!res.ok) throw new Error("Failed to empty bin");

      setTrash([]);
      setToastMessage("🗑️ Bin completely emptied.");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to empty bin");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleQuickPublish(slug: string) {
    setActionLoading(slug);
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish-now" }),
      });
      if (!res.ok) throw new Error("Failed to publish blog now");
      const data = await res.json();
      if (data.post) {
        setPosts((prev) => prev.map((p) => (p.slug === slug ? data.post : p)));
      }
      setToastMessage("🟢 Article published live!");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to publish");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancelSchedule(slug: string) {
    setActionLoading(slug);
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel-schedule" }),
      });
      if (!res.ok) throw new Error("Failed to cancel schedule");
      const data = await res.json();
      if (data.post) {
        setPosts((prev) => prev.map((p) => (p.slug === slug ? data.post : p)));
      }
      setToastMessage("Schedule cancelled. Post reverted to draft.");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to cancel schedule");
    } finally {
      setActionLoading(null);
    }
  }

  function openScheduleModal(post: BlogPost) {
    setSchedulingTarget(post);
    if (post.scheduledAt) {
      try {
        const d = new Date(post.scheduledAt);
        const pad = (n: number) => String(n).padStart(2, "0");
        setScheduleDateTime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
        return;
      } catch {}
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    setScheduleDateTime(`${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T09:00`);
  }

  async function handleSaveSchedule() {
    if (!schedulingTarget || !scheduleDateTime) return;
    const schedDate = new Date(scheduleDateTime);
    if (isNaN(schedDate.getTime()) || schedDate.getTime() <= Date.now()) {
      alert("Please select a future date and time.");
      return;
    }

    setSavingSchedule(true);
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(schedulingTarget.slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedule",
          scheduledAt: schedDate.toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed to schedule post");
      const data = await res.json();
      if (data.post) {
        setPosts((prev) =>
          prev.map((p) => (p.slug === schedulingTarget.slug ? data.post : p))
        );
      }
      setSchedulingTarget(null);
      setToastMessage("⏰ Article scheduled successfully!");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to schedule blog");
    } finally {
      setSavingSchedule(false);
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-indigo-500/30 bg-[#080d24]/95 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-xl animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs Bar with Bin / Trash */}
        <div className="flex flex-wrap rounded-xl bg-white/[0.04] p-1 border border-white/5 gap-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition ${
              activeTab === "all"
                ? "bg-accent/20 text-white border border-accent/20 shadow"
                : "text-slate-400 border border-transparent hover:text-white"
            }`}
          >
            All ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("published")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition ${
              activeTab === "published"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow"
                : "text-slate-400 border border-transparent hover:text-white"
            }`}
          >
            🟢 Published ({publishedCount})
          </button>
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition ${
              activeTab === "scheduled"
                ? "bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 shadow"
                : "text-slate-400 border border-transparent hover:text-white"
            }`}
          >
            ⏰ Scheduled ({scheduledCount})
          </button>
          <button
            onClick={() => setActiveTab("drafts")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition ${
              activeTab === "drafts"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow"
                : "text-slate-400 border border-transparent hover:text-white"
            }`}
          >
            📝 Drafts ({draftCount})
          </button>
          <button
            onClick={() => setActiveTab("trash")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition ${
              activeTab === "trash"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow"
                : "text-slate-400 border border-transparent hover:text-rose-300"
            }`}
          >
            🗑️ Bin ({trash.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={activeTab === "trash" ? "Search trashed blogs..." : "Search blogs..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-accent/40 focus:bg-white/[0.07]"
          />
        </div>
      </div>

      {/* Trash Tab Notice & Empty Bin Action */}
      {activeTab === "trash" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-4 text-xs text-rose-200">
          <div className="flex items-center gap-2.5">
            <Archive className="h-4 w-4 text-rose-400 shrink-0" />
            <span>
              <strong>Recycle Bin:</strong> Deleted or bot-archived blogs are kept here. You can retrieve them as Drafts or Publish them live with 1 click.
            </span>
          </div>
          {trash.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              disabled={actionLoading === "empty-trash"}
              onClick={handleEmptyTrash}
              className="text-rose-300 border-rose-500/30 hover:bg-rose-500/20 shrink-0"
            >
              {actionLoading === "empty-trash" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Empty Bin
            </Button>
          )}
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-12 text-center backdrop-blur-xl space-y-2">
          <p className="text-slate-400">
            {activeTab === "trash" ? "The Bin is empty. No deleted articles." : "No blog posts found in this view."}
          </p>
          {activeTab === "scheduled" && (
            <p className="text-xs text-indigo-300">
              💡 You can schedule any draft or new post by clicking &ldquo;Schedule&rdquo; on the post item below.
            </p>
          )}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-2 text-sm text-accent-soft hover:underline"
            >
              Clear search query
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredPosts.map((post) => {
            const scheduled = isScheduled(post);
            const isBusy = actionLoading === post.slug;
            const isTrashed = activeTab === "trash";

            return (
              <li
                key={post.slug}
                className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center transition ${
                  isTrashed
                    ? "border-rose-500/20 bg-rose-500/[0.02] hover:border-rose-500/30 hover:bg-rose-500/[0.05]"
                    : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]"
                }`}
              >
                <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl border border-white/10 sm:h-20 sm:w-32 bg-[#050814]">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full bg-white/5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-medium text-white">{post.title}</h3>

                    {/* Status Badges */}
                    {isTrashed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 text-[11px] font-bold text-rose-300">
                        🗑️ In Bin {post.trashedAt ? `(${new Date(post.trashedAt).toLocaleDateString()})` : ""}
                      </span>
                    ) : scheduled ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 px-2.5 py-0.5 text-[11px] font-bold text-indigo-300">
                        <Clock className="h-3 w-3" /> Scheduled ({formatRelativeTime(post.scheduledAt!)})
                      </span>
                    ) : post.published ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                        🟢 Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                        📝 Draft
                      </span>
                    )}
                  </div>

                  {scheduled && post.scheduledAt && (
                    <p className="mt-1 text-xs text-indigo-300 font-mono">
                      ⏰ Scheduled for: {new Date(post.scheduledAt).toLocaleString()}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-slate-500 font-mono">
                    {formatDate(post.date)} · /blog/{post.slug} · Helpful: {post.helpfulCount ?? 0} | Not: {post.notHelpfulCount ?? 0}
                  </p>
                  <p className="mt-1.5 line-clamp-1 text-sm text-slate-400">
                    {post.excerpt}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap shrink-0 items-center gap-2">
                  {/* TRASH TAB ACTIONS */}
                  {isTrashed ? (
                    <>
                      {/* One-Click Restore & Publish Live */}
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleRestoreFromTrash(post.slug, true)}
                        className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                        title="Restore and publish live immediately on website"
                      >
                        {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        Restore & Publish
                      </Button>

                      {/* Restore as Draft */}
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleRestoreFromTrash(post.slug, false)}
                        className="text-amber-300 border-amber-500/30 hover:bg-amber-500/15"
                        title="Restore back to Drafts for editing"
                      >
                        {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                        Restore as Draft
                      </Button>

                      {/* Permanent Delete */}
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        disabled={isBusy}
                        onClick={() => handlePermanentDelete(post.slug, post.title)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/20"
                        title="Permanently purge from Bin"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Forever
                      </Button>
                    </>
                  ) : (
                    /* REGULAR ACTIVE BLOG ACTIONS */
                    <>
                      {/* Schedule / Reschedule quick button */}
                      {(!post.published || scheduled) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          type="button"
                          disabled={isBusy}
                          onClick={() => openScheduleModal(post)}
                          className="text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/15"
                          title={scheduled ? "Change scheduled date & time" : "Schedule post for future"}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {scheduled ? "Reschedule" : "Schedule"}
                        </Button>
                      )}

                      {/* Quick Publish Now */}
                      {(!post.published || scheduled) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleQuickPublish(post.slug)}
                          className="text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/15"
                          title="Publish immediately to live site"
                        >
                          {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          Publish Now
                        </Button>
                      )}

                      {/* Cancel Schedule */}
                      {scheduled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleCancelSchedule(post.slug)}
                          className="text-slate-400 hover:text-white"
                          title="Revert to draft"
                        >
                          Cancel Schedule
                        </Button>
                      )}

                      {!post.published && !scheduled && (
                        <Link
                          href={`/api/preview?secret=${process.env.NEXT_PUBLIC_PREVIEW_SECRET || "default_preview_secret"}&type=blog&slug=${post.slug}`}
                          target="_blank"
                        >
                          <Button variant="secondary" size="sm" type="button" className="text-amber-300 border-amber-500/20 hover:bg-amber-500/10">
                            <Eye className="h-3.5 w-3.5" />
                            Preview
                          </Button>
                        </Link>
                      )}

                      <Link href={`/admin/blogs/${encodeURIComponent(post.slug)}/edit`}>
                        <Button variant="secondary" size="sm" type="button">
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => setDeleteTarget(post)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                        title="Move to Bin"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Quick Schedule Modal */}
      {schedulingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-indigo-500/30 bg-[#0a0f24] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Schedule Blog Publication</h3>
              </div>
              <button
                onClick={() => setSchedulingTarget(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Target article: <strong className="text-white">&ldquo;{schedulingTarget.title}&rdquo;</strong>
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-indigo-200">
                Choose Scheduled Publication Date & Time:
              </label>
              <input
                type="datetime-local"
                value={scheduleDateTime}
                onChange={(e) => setScheduleDateTime(e.target.value)}
                className="w-full rounded-xl border border-indigo-500/40 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setHours(d.getHours() + 2);
                  const pad = (n: number) => String(n).padStart(2, "0");
                  setScheduleDateTime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 transition"
              >
                +2 Hours
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  d.setHours(9, 0, 0, 0);
                  const pad = (n: number) => String(n).padStart(2, "0");
                  setScheduleDateTime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T09:00`);
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 transition"
              >
                Tomorrow 9:00 AM
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 2);
                  d.setHours(14, 0, 0, 0);
                  const pad = (n: number) => String(n).padStart(2, "0");
                  setScheduleDateTime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T14:00`);
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 transition"
              >
                In 2 Days (2 PM)
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setSchedulingTarget(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                type="button"
                disabled={savingSchedule}
                onClick={handleSaveSchedule}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {savingSchedule ? "Saving…" : "Confirm Schedule"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Move Article to Bin"
        itemTitle={deleteTarget?.title ?? ""}
        loading={loadingDelete}
      />
    </div>
  );
}
