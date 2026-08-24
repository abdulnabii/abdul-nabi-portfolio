import { BlogGridClient } from "@/components/blog/blog-grid-client";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublishedBlogs } from "@/lib/blog-store";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — Abdul Nabi | Next.js, AI & Full-Stack Engineering",
  description:
    "Articles on Next.js App Router, TypeScript, AI engineering, Application Security, and full-stack product development — written by Abdul Nabi, developer based in Karachi, Pakistan.",
  alternates: {
    canonical: "https://www.aiwithab.site/blog",
  },
  openGraph: {
    title: "Blog — Abdul Nabi | Next.js, AI & Full-Stack Engineering",
    description:
      "Practical notes on Next.js, TypeScript, AI engineering, and application security by Abdul Nabi.",
    url: "https://www.aiwithab.site/blog",
    type: "website",
    images: [
      {
        url: "https://www.aiwithab.site/profile.jpg",
        width: 1200,
        height: 630,
        alt: "Abdul Nabi Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Abdul Nabi | Next.js, AI & Full-Stack Engineering",
    description:
      "Practical notes on Next.js, TypeScript, AI engineering, and application security by Abdul Nabi.",
    images: ["https://www.aiwithab.site/profile.jpg"],
  },
};

export default async function BlogPage() {
  const posts = await getPublishedBlogs();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Abdul Nabi Blog",
    url: "https://www.aiwithab.site/blog",
    description: "Articles on Next.js, AI engineering, TypeScript, and Application Security by Abdul Nabi.",
    author: {
      "@type": "Person",
      "@id": "https://www.aiwithab.site/#person",
      name: "Abdul Nabi",
    },
    blogPost: posts.slice(0, 10).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `https://www.aiwithab.site/blog/${post.slug}`,
      datePublished: post.date,
      description: post.excerpt,
      image: post.coverImage || "https://www.aiwithab.site/profile.jpg",
      author: { "@type": "Person", name: "Abdul Nabi" },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="section-padding pt-32 md:pt-36">
        <div className="container-narrow">
          <SectionHeading
            eyebrow="Journal"
            title="Blog"
            subtitle="Practical notes on product UI, application security, App Router architecture, and shipping discipline."
          />

          <BlogGridClient initialPosts={posts} />
        </div>
      </div>
    </>
  );
}
