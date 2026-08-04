import { BlogPostClient } from "@/components/blog/blog-post-client";
import {
  getBlogBySlug,
  getPublishedBlogs,
} from "@/lib/blog-store";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: { slug: string };
}

function slugToTitle(slug: string): string {
  const acronyms: Record<string, string> = {
    ai: "AI",
    ui: "UI",
    ux: "UX",
    api: "API",
    whats: "What's",
    nextjs: "Next.js",
  };

  return slug
    .split("-")
    .map((word) => {
      const lower = word.toLowerCase();
      if (acronyms[lower]) return acronyms[lower];
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogBySlug(params.slug);
  const title = post?.title ?? slugToTitle(params.slug);
  const description = post?.excerpt ?? "Article by Abdul Nabi";

  return {
    title: `${title} · Abdul Nabi`,
    description,
    openGraph: {
      title: `${title} · Abdul Nabi`,
      description,
      type: "article",
      publishedTime: post?.date,
      tags: post?.tags,
      images: post?.coverImage ? [post.coverImage] : undefined,
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
  const all = await getPublishedBlogs();
  const related = all.filter((p) => p.slug !== params.slug).slice(0, 2);

  return (
    <BlogPostClient
      initialPost={post ?? null}
      slug={params.slug}
      related={related}
    />
  );
}
