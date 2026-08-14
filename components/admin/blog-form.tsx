"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownEditor } from "./markdown-editor";
import { ImageUploadWidget } from "./image-upload-widget";
import type { BlogPost } from "@/lib/blog-store";
import { Calendar, Clock, Globe, FileText, Send, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80";

interface BlogFormProps {
  mode: "create" | "edit";
  initial?: BlogPost;
}

type PublishOption = "publish" | "schedule" | "draft";

export function BlogForm({ mode, initial }: BlogFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [coverImage, setCoverImage] = useState(
    initial?.coverImage ?? DEFAULT_COVER
  );

  // Scheduling state
  const isInitiallyScheduled = Boolean(
    initial?.scheduledAt && new Date(initial.scheduledAt).getTime() > Date.now()
  );
  const [publishOption, setPublishOption] = useState<PublishOption>(
    isInitiallyScheduled
      ? "schedule"
      : initial
        ? initial.published
          ? "publish"
          : "draft"
        : "publish"
  );

  // Format initial scheduledAt to datetime-local format (YYYY-MM-DDTHH:mm)
  const getInitialScheduledString = () => {
    if (initial?.scheduledAt) {
      try {
        const d = new Date(initial.scheduledAt);
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } catch {}
    }
    // Default to tomorrow 09:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T09:00`;
  };

  const [scheduledAtTime, setScheduledAtTime] = useState(getInitialScheduledString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setPresetSchedule(hoursAhead: number, targetHour?: number) {
    const d = new Date();
    if (targetHour !== undefined) {
      d.setDate(d.getDate() + (hoursAhead / 24));
      d.setHours(targetHour, 0, 0, 0);
    } else {
      d.setHours(d.getHours() + hoursAhead);
    }
    const pad = (n: number) => String(n).padStart(2, "0");
    setScheduledAtTime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let finalPublished = true;
    let finalScheduledAt: string | undefined = undefined;

    if (publishOption === "draft") {
      finalPublished = false;
      finalScheduledAt = undefined;
    } else if (publishOption === "schedule") {
      finalPublished = false;
      if (!scheduledAtTime) {
        setError("Please pick a scheduled date and time.");
        setLoading(false);
        return;
      }
      const schedDate = new Date(scheduledAtTime);
      if (isNaN(schedDate.getTime()) || schedDate.getTime() <= Date.now()) {
        setError("Scheduled date must be a future date and time.");
        setLoading(false);
        return;
      }
      finalScheduledAt = schedDate.toISOString();
    } else {
      finalPublished = true;
      finalScheduledAt = undefined;
    }

    const payload = {
      title,
      excerpt,
      content,
      date: publishOption === "schedule" ? scheduledAtTime.slice(0, 10) : date,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      coverImage,
      published: finalPublished,
      scheduledAt: finalScheduledAt,
      slug: slug || undefined,
    };

    try {
      const res = await fetch(
        mode === "create" ? "/api/blogs" : `/api/blogs/${initial?.slug}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = (await res.json()) as {
        error?: string;
        post?: BlogPost;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Save failed");
      }

      // Sync to localStorage for serverless container persistence
      if (data.post && typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("an_local_blogs");
          const localBlogs = raw ? (JSON.parse(raw) as BlogPost[]) : [];
          const updated = [data.post, ...localBlogs.filter((p) => p.slug !== data.post!.slug && p.slug !== initial?.slug)];
          localStorage.setItem("an_local_blogs", JSON.stringify(updated));
        } catch (storageErr) {
          console.warn("[blog-form] LocalStorage sync warning:", storageErr);
        }
      }

      // Trigger public site revalidation
      try {
        await fetch("/api/admin/revalidate?secret=default_revalidate_secret", {
          method: "POST",
        });
      } catch (revalErr) {
        console.warn("[blog-form] Revalidation notice:", revalErr);
      }

      router.push("/admin/blogs");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save blog post");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Input
          label="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
        />
        <Input
          label="Slug (optional)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="auto-from-title"
        />
      </div>

      <Input
        label="Excerpt"
        required
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Short summary for cards and SEO"
      />

      <MarkdownEditor
        label="Article Content (Markdown format)"
        required
        value={content}
        onChange={setContent}
        placeholder="Write the full article content in markdown format..."
        rows={10}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Input
          label="Publish date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Next.js, UI, Performance"
        />
      </div>

      <ImageUploadWidget
        label="Cover Image"
        value={coverImage}
        onChange={setCoverImage}
        type="blogs"
        slug={slug || "blog_cover"}
      />

      {/* Publishing & Scheduling Section */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
            Publishing Status & Scheduling
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
              publishOption === "publish"
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20"
            }`}
          >
            <input
              type="radio"
              name="publishOption"
              value="publish"
              checked={publishOption === "publish"}
              onChange={() => setPublishOption("publish")}
              className="sr-only"
            />
            <Globe className="h-4 w-4 shrink-0 text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-white">Publish Immediately</p>
              <p className="text-[11px] text-slate-400">Live on public blog right away</p>
            </div>
          </label>

          <label
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
              publishOption === "schedule"
                ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-300 shadow-md shadow-indigo-500/10"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20"
            }`}
          >
            <input
              type="radio"
              name="publishOption"
              value="schedule"
              checked={publishOption === "schedule"}
              onChange={() => setPublishOption("schedule")}
              className="sr-only"
            />
            <Clock className="h-4 w-4 shrink-0 text-indigo-400" />
            <div>
              <p className="text-xs font-bold text-white">Schedule for Later</p>
              <p className="text-[11px] text-slate-400">Auto-publishes at chosen date/time</p>
            </div>
          </label>

          <label
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
              publishOption === "draft"
                ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20"
            }`}
          >
            <input
              type="radio"
              name="publishOption"
              value="draft"
              checked={publishOption === "draft"}
              onChange={() => setPublishOption("draft")}
              className="sr-only"
            />
            <FileText className="h-4 w-4 shrink-0 text-amber-400" />
            <div>
              <p className="text-xs font-bold text-white">Save as Draft</p>
              <p className="text-[11px] text-slate-400">Hidden from public view</p>
            </div>
          </label>
        </div>

        {/* DateTime Picker when Scheduled is selected */}
        {publishOption === "schedule" && (
          <div className="pt-2 space-y-3 animate-fade-in border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-indigo-200">
                Choose Scheduled Publication Date & Time (Your Local Time):
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setPresetSchedule(2)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 transition"
                >
                  +2 Hours
                </button>
                <button
                  type="button"
                  onClick={() => setPresetSchedule(24, 9)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 transition"
                >
                  Tomorrow 9:00 AM
                </button>
                <button
                  type="button"
                  onClick={() => setPresetSchedule(48, 14)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 transition"
                >
                  In 2 Days (2:00 PM)
                </button>
              </div>
            </div>

            <div className="max-w-md">
              <input
                type="datetime-local"
                required={publishOption === "schedule"}
                value={scheduledAtTime}
                onChange={(e) => setScheduledAtTime(e.target.value)}
                className="w-full rounded-xl border border-indigo-500/30 bg-[#070b19] px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <p className="text-xs text-indigo-300/80">
              💡 The blog post will remain private until this time arrives, after which it will automatically appear live across your portfolio and RSS feed.
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-rose-400 font-medium" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white">
          {loading
            ? "Saving…"
            : publishOption === "schedule"
              ? "⏰ Schedule Post"
              : publishOption === "draft"
                ? "Save as Draft"
                : mode === "create"
                  ? "🚀 Publish Post"
                  : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/blogs")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
