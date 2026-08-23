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
  const description = post?.excerpt ?? "Technical article by Abdul Nabi";

  return {
    title: `${title} · Abdul Nabi`,
    description,
    keywords: [
      title,
      ...(post?.tags || []),
      "Abdul Nabi",
      "Abdul Nabi Blog",
      "Full-Stack Engineering",
      "aiwithab.site",
    ],
    authors: [{ name: "Abdul Nabi", url: "https://www.aiwithab.site" }],
    openGraph: {
      title: `${title} · Abdul Nabi`,
      description,
      type: "article",
      url: `https://www.aiwithab.site/blog/${params.slug}`,
      publishedTime: post?.date,
      authors: ["Abdul Nabi"],
      tags: post?.tags,
      images: post?.coverImage
        ? [{ url: post.coverImage, alt: title }]
        : [{ url: `/api/og/blog?slug=${encodeURIComponent(params.slug)}`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Abdul Nabi`,
      description,
      images: post?.coverImage ? [post.coverImage] : [`/api/og/blog?slug=${encodeURIComponent(params.slug)}`],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogBySlug(params.slug);
  const all = await getPublishedBlogs();
  const related = all.filter((p) => p.slug !== params.slug).slice(0, 2);

  // Increment view count server-side on each real page load
  if (post) {
    try {
      const { updateBlog } = await import("@/lib/blog-store");
      await updateBlog(params.slug, { views: (post.views ?? 0) + 1 });
    } catch {}
  }

  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        image: post.coverImage || "https://www.aiwithab.site/profile.jpg",
        datePublished: post.date,
        dateModified: post.updatedAt || post.date,
        author: {
          "@type": "Person",
          name: "Abdul Nabi",
          url: "https://www.aiwithab.site",
        },
        publisher: {
          "@type": "Person",
          name: "Abdul Nabi",
          url: "https://www.aiwithab.site",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://www.aiwithab.site/blog/${params.slug}`,
        },
        keywords: post.tags?.join(", "),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogPostClient
        initialPost={post ?? null}
        slug={params.slug}
        related={related}
      />
    </>
  );
}
