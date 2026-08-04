"use client";

import { BlogCard } from "@/components/blog-card";
import type { BlogPost } from "@/lib/blog-store";
import { useEffect, useState } from "react";

interface BlogGridClientProps {
  initialPosts: BlogPost[];
}

export function BlogGridClient({ initialPosts }: BlogGridClientProps) {
  const [posts, setPosts] = useState(initialPosts);

  useEffect(() => {
    let merged = initialPosts;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("an_local_blogs");
        if (raw) {
          const localBlogs = JSON.parse(raw) as BlogPost[];
          const publishedLocal = localBlogs.filter((p) => p.published !== false);
          if (publishedLocal.length > 0) {
            const map = new Map<string, BlogPost>();
            initialPosts.forEach((p) => map.set(p.slug, p));
            publishedLocal.forEach((p) => map.set(p.slug, p));
            merged = Array.from(map.values()).sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
          }
        }
      } catch {
        // Fallback to server posts
      }
    }
    setPosts(merged);
  }, [initialPosts]);

  if (posts.length === 0) {
    return <p className="text-slate-400">No posts published yet.</p>;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, index) => (
        <BlogCard key={post.slug} post={post} index={index} />
      ))}
    </div>
  );
}
