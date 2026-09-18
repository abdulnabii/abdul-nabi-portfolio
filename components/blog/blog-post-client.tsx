"use client";

import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { BlogFeedback } from "@/components/blog-feedback";
import { NewsletterSignup } from "@/components/newsletter-signup";
import type { BlogPost } from "@/lib/blog-store";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Clock, Eye } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface BlogPostClientProps {
  initialPost: BlogPost | null;
  slug: string;
  related: BlogPost[];
}

function renderContent(content: string) {
  const blocks = content.split(/\n\n+/);

  return blocks.map((block, index) => {
    const trimmed = block.trim();

    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={index}
          className="mt-10 text-2xl font-semibold tracking-tight text-white first:mt-0"
        >
          {trimmed.replace(/^##\s+/, "")}
        </h2>
      );
    }

    if (trimmed.startsWith("### ")) {
      return (
        <h3
          key={index}
          className="mt-8 text-lg font-semibold tracking-tight text-white"
        >
          {trimmed.replace(/^###\s+/, "")}
        </h3>
      );
    }

    if (trimmed.includes("\n- ") || trimmed.startsWith("- ")) {
      const items = trimmed
        .split("\n")
        .map((item) => item.replace(/^- /, "").trim())
        .filter(Boolean);
      return (
        <ul key={index} className="list-disc pl-5 space-y-2 my-4 text-slate-300 text-sm md:text-base leading-relaxed">
          {items.map((item, i) => (
            <li key={i}>
              {item.split(/(`[^`]+`)/g).map((part, pIdx) => {
                if (part.startsWith("`") && part.endsWith("`")) {
                  return (
                    <code
                      key={pIdx}
                      className="rounded border border-white/10 bg-white/[0.04] px-1 py-0.5 font-mono text-[0.9em] text-accent-soft"
                    >
                      {part.slice(1, -1)}
                    </code>
                  );
                }
                return <span key={pIdx}>{part}</span>;
              })}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p
        key={index}
        className="mt-5 text-base leading-relaxed text-slate-300 first:mt-0"
      >
        {trimmed.split(/(`[^`]+`)/g).map((part, i) => {
          if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <code
                key={i}
                className="rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-accent-soft"
              >
                {part.slice(1, -1)}
              </code>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    );
  });
}

export function BlogPostClient({ initialPost, slug, related }: BlogPostClientProps) {
  const [post, setPost] = useState<BlogPost | null>(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [imageError, setImageError] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setReadingProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [post]);

  useEffect(() => {
    async function loadPost() {
      if (post) return;

      // 1. Try local storage
      try {
        const raw = localStorage.getItem("an_local_blogs");
        if (raw) {
          const localBlogs = JSON.parse(raw) as BlogPost[];
          const match = localBlogs.find((p) => p.slug === slug);
          if (match) {
            setPost(match);
            setLoading(false);
            return;
          }
        }
      } catch {}

      // 2. Fetch from live API backend endpoint
      try {
        const res = await fetch(`/api/blogs/${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = (await res.json()) as { post?: BlogPost };
          if (data.post) {
            setPost(data.post);
          }
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [post, slug]);

  useEffect(() => {
    if (post?.title && typeof document !== "undefined") {
      document.title = `${post.title} · Abdul Nabi`;
    }
  }, [post]);

  if (loading) {
    return (
      <div className="section-padding pt-32 md:pt-36 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="section-padding pt-32 md:pt-36 text-center">
        <div className="container-narrow max-w-xl space-y-4">
          <h1 className="text-3xl font-bold text-white">Post not found</h1>
          <p className="text-slate-400">The article you are looking for does not exist or has been removed.</p>
          <LinkButton href="/blog" variant="secondary" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </LinkButton>
        </div>
      </div>
    );
  }

  const ratingAvg = post.ratingCount ? (post.ratingSum ?? 0) / post.ratingCount : 0;

  return (
    <article className="section-padding pt-32 md:pt-36">
      {/* Top Sticky Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] bg-white/5 z-50 pointer-events-none"
        role="progressbar"
        aria-valuenow={Math.round(readingProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      >
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-[width] duration-150 ease-out shadow-[0_0_12px_rgba(99,102,241,0.6)]"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="container-narrow max-w-3xl">
        <LinkButton
          href="/blog"
          variant="ghost"
          size="sm"
          className="mb-8 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </LinkButton>

        <header className="mb-10">
          <div className="relative mb-8 h-56 overflow-hidden rounded-3xl border border-white/10 sm:h-72 bg-[#060a17]">
            {post.coverImage && !imageError ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                unoptimized
                onError={() => setImageError(true)}
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#0a0f1e] to-slate-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/70 to-transparent pointer-events-none" />
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              {post.readTime || `${Math.max(2, Math.ceil((post.content?.split(/\s+/).length || 300) / 200))} min read`}
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <Eye className="h-3.5 w-3.5 text-emerald-400" />
              {post.views || Math.floor(120 + (post.slug.length * 17) % 350)} views
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl md:leading-tight">
            {post.title}
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-slate-400">
            {post.excerpt}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="accent">
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        <GlassCard padding="lg" elevated>
          {renderContent(post.content)}
          <BlogFeedback
            slug={post.slug}
            initialHelpful={post.helpfulCount ?? 0}
            initialNotHelpful={post.notHelpfulCount ?? 0}
            initialRatingAvg={ratingAvg}
            initialRatingCount={post.ratingCount ?? 0}
          />
        </GlassCard>

        {/* Newsletter Subscription Opt-In */}
        <NewsletterSignup className="mt-12" />

        {related.length > 0 && (
          <aside className="mt-16">
            <h2 className="mb-6 text-lg font-semibold text-white">
              More reading
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((item) => (
                <a
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="group block"
                >
                  <GlassCard hover className="h-full overflow-hidden !p-0">
                    {item.coverImage && (
                      <div className="relative h-28 w-full">
                        <Image
                          src={item.coverImage}
                          alt={item.title}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="300px"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-xs text-slate-500">
                        {formatDate(item.date)}
                      </p>
                      <h3 className="mt-2 font-medium text-white transition-colors group-hover:text-accent-soft">
                        {item.title}
                      </h3>
                    </div>
                  </GlassCard>
                </a>
              ))}
            </div>
          </aside>
        )}
      </div>
    </article>
  );
}
