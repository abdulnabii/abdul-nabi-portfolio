import { BlogCard } from "@/components/blog-card";
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
          subtitle="Thoughts on design systems, performance, and shipping polished full-stack products."
        />

        {posts.length === 0 ? (
          <p className="text-slate-400">No posts published yet.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <BlogCard key={post.slug} post={post} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
