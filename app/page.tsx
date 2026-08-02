import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Education } from "@/components/sections/education";
import { Experience } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { Projects } from "@/components/sections/projects";
import { Skills } from "@/components/sections/skills";
import { BlogCard } from "@/components/blog-card";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublishedBlogs } from "@/lib/blog-store";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const latestPosts = (await getPublishedBlogs()).slice(0, 2);

  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Experience />
      <Education />

      <section
        className="section-padding relative"
        aria-labelledby="blog-preview"
      >
        <div className="container-narrow">
          <Reveal>
            <div className="mb-12 flex flex-col gap-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Writing"
                title="From the blog"
                subtitle="Practical notes on product UI, application security, App Router architecture, and shipping discipline."
                className="mb-0"
              />
              <LinkButton href="/blog" variant="secondary" size="sm">
                View all posts
                <ArrowRight className="h-3.5 w-3.5" />
              </LinkButton>
            </div>
          </Reveal>

          {latestPosts.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {latestPosts.map((post, index) => (
                <BlogCard key={post.slug} post={post} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              New articles will appear here soon.
            </p>
          )}
        </div>
      </section>

      <Contact />
    </>
  );
}
