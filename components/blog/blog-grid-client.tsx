"use client";

import { BlogCard } from "@/components/blog-card";
import type { BlogPost } from "@/lib/blog-store";
import { Search, X, Sparkles, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface BlogGridClientProps {
  initialPosts: BlogPost[];
}

export function BlogGridClient({ initialPosts }: BlogGridClientProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

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

  // Extract top tags dynamically
  const availableTags = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((p) => {
      p.tags?.forEach((t) => {
        const clean = t.trim();
        if (clean) counts.set(clean, (counts.get(clean) || 0) + 1);
      });
    });
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
    return ["All", ...sorted];
  }, [posts]);

  // Filter posts based on search query and selected tag
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchTag =
        selectedTag === "All" ||
        p.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
      if (!matchTag) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const inTitle = p.title.toLowerCase().includes(q);
      const inExcerpt = (p.excerpt || "").toLowerCase().includes(q);
      const inTags = p.tags?.some((t) => t.toLowerCase().includes(q));
      return inTitle || inExcerpt || inTags;
    });
  }, [posts, selectedTag, searchQuery]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTag("All");
  };

  if (posts.length === 0) {
    return <p className="text-slate-400">No posts published yet.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Search Bar and Tag Filter Controls */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, keyword, or technology..."
              className="w-full rounded-xl border border-white/10 bg-[#060a17]/90 pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-500 transition-all focus:border-indigo-400 focus:bg-[#090f24] focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Results Counter / Filter status */}
          <div className="flex items-center justify-between md:justify-end gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.03]">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              Showing <strong className="text-white">{filteredPosts.length}</strong> of {posts.length} articles
            </span>
            {(searchQuery || selectedTag !== "All") && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Tag Pills */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-medium text-slate-500 mr-1 inline-flex items-center gap-1">
            <Filter className="h-3 w-3" /> Topics:
          </span>
          {availableTags.map((tag) => {
            const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] border border-indigo-400/50"
                    : "border border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:bg-white/[0.07] hover:text-slate-200"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Blog Cards Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post, index) => (
            <BlogCard key={post.slug} post={post} index={index} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
          <p className="text-lg font-medium text-white">No articles match your search</p>
          <p className="mt-1 text-sm text-slate-400">
            Try searching for a different keyword or reset the topic filter.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/20"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
