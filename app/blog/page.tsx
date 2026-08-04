import { BlogGridClient } from "@/components/blog/blog-grid-client";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublishedBlogs } from "@/lib/blog-store";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles on UI craft, Next.js architecture, and building premium web products — by Abdul Nabi.",
};

export default async function BlogPage() {
  const posts = await getPublishedBlogs();

  return (
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
  );
}
