"use client";

import { useEffect, useState } from "react";
import { BlogForm } from "@/components/admin/blog-form";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import type { BlogPost } from "@/lib/blog-store";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface BlogEditClientProps {
  slug: string;
  initialPost?: BlogPost;
}

export function BlogEditClient({ slug, initialPost }: BlogEditClientProps) {
  const [post, setPost] = useState<BlogPost | undefined>(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initialPost) {
      setPost(initialPost);
      setLoading(false);
      return;
    }

    const decodedSlug = decodeURIComponent(slug);

    // 1. Try fetching from server API
    fetch(`/api/blogs/${encodeURIComponent(decodedSlug)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.post) {
          setPost(data.post);
          setLoading(false);
          return;
        }
        throw new Error("Not found on API");
      })
      .catch(() => {
        // 2. Fallback to localStorage for browser-saved drafts
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("an_local_blogs");
            if (raw) {
              const localBlogs = JSON.parse(raw) as BlogPost[];
              const found = localBlogs.find(
                (p) => p.slug === slug || p.slug === decodedSlug
              );
              if (found) {
                setPost(found);
                setLoading(false);
                return;
              }
            }
          } catch {}
        }
        setError(true);
        setLoading(false);
      });
  }, [slug, initialPost]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">Post Not Found</h3>
          <p className="mt-2 text-sm text-slate-400">
            The post with slug &quot;{slug}&quot; could not be located in database or local storage.
          </p>
          <div className="mt-6">
            <Link href="/admin/blogs">
              <Button variant="secondary" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to all posts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Edit post</h2>
        <p className="mt-1 text-sm text-slate-400">/{post.slug}</p>
      </div>
      <GlassCard padding="lg" elevated>
        <BlogForm mode="edit" initial={post} />
      </GlassCard>
    </div>
  );
}
