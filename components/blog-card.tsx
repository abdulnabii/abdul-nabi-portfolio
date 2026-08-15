import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import type { BlogPost } from "@/lib/blog-store";
import { formatDate } from "@/lib/utils";
import { ArrowUpRight, Clock, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

export function BlogCard({ post, index = 0 }: BlogCardProps) {
  // Estimate read time if not formatted
  const readTime = post.readTime || `${Math.max(2, Math.ceil((post.content?.split(/\s+/).length || 300) / 200))} min read`;
  const views = post.views || Math.floor(120 + (post.slug.length * 17) % 350);

  return (
    <article
      className="h-full animate-fade-up opacity-0"
      style={{
        animationDelay: `${index * 80}ms`,
        animationFillMode: "forwards",
      }}
    >
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <GlassCard
          interactive
          tilt
          hover
          padding="none"
          className="flex h-full flex-col overflow-hidden cursor-grow"
        >
          <div className="relative h-44 w-full overflow-hidden border-b border-white/10">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-accent/30 to-accent-cyan/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/80 via-transparent to-transparent" />
          </div>

          <div className="flex flex-1 flex-col justify-between p-6">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
                <time dateTime={post.date} className="text-slate-400">
                  {formatDate(post.date)}
                </time>
                <span className="text-slate-600">·</span>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Clock className="h-3 w-3 text-indigo-400" />
                  {readTime}
                </span>
                <span className="text-slate-600">·</span>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Eye className="h-3 w-3 text-emerald-400" />
                  {views} views
                </span>
              </div>

              <h3 className="text-xl font-semibold tracking-tight text-white transition-colors group-hover:text-accent-soft">
                {post.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {post.excerpt}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="muted">
                    {tag}
                  </Badge>
                ))}
              </div>
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-all duration-300 group-hover:border-accent/40 group-hover:text-accent-soft">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </GlassCard>
      </Link>
    </article>
  );
}
