"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { BlogPost } from "@/lib/blog-store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80";

interface BlogFormProps {
  mode: "create" | "edit";
  initial?: BlogPost;
}

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
  const [published, setPublished] = useState(initial?.published ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title,
      excerpt,
      content,
      date,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      coverImage,
      published,
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

      router.push("/admin/blogs");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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

      <Textarea
        label="Content (Markdown-style: ## for headings)"
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write the full article..."
        className="min-h-[260px]"
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

      <Input
        label="Cover image URL (Unsplash or other HTTPS image)"
        value={coverImage}
        onChange={(e) => setCoverImage(e.target.value)}
        placeholder="https://images.unsplash.com/..."
      />

      {coverImage && (
        <div className="relative h-48 overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={coverImage}
            alt="Cover preview"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <label className="flex items-center gap-3 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-white/5"
        />
        Published (visible on public blog)
      </label>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving…"
            : mode === "create"
              ? "Create post"
              : "Save changes"}
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
