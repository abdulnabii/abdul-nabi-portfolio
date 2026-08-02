import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { BlogFeedback } from "@/components/blog-feedback";
import {
  getBlogBySlug,
  getPublishedBlogs,
} from "@/lib/blog-store";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogBySlug(params.slug);
  if (!post) {
    return { title: "Post not found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const all = await getPublishedBlogs();
  const related = all.filter((p) => p.slug !== post.slug).slice(0, 2);

  const ratingAvg = post.ratingCount ? (post.ratingSum ?? 0) / post.ratingCount : 0;

  return (
    <article className="section-padding pt-32 md:pt-36">
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
          {/* Hero image — always render container; gradient fallback when coverImage is absent */}
          <div className="relative mb-8 h-56 overflow-hidden rounded-3xl border border-white/10 sm:h-72">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt=""
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            ) : (
              /* Gradient placeholder — prevents raw black rectangle when no image is set */
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#0a0f1e] to-slate-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/70 to-transparent" />
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden>·</span>
            <span>{post.readTime}</span>
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
                          alt=""
                          fill
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
