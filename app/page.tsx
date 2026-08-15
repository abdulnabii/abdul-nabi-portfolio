import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Education } from "@/components/sections/education";
import { Experience } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { Projects } from "@/components/sections/projects";
import { MiniProjects } from "@/components/sections/mini-projects";
import { Skills } from "@/components/sections/skills";
import { Achievements } from "@/components/sections/achievements";
import { MiniGames } from "@/components/sections/mini-games";
import { Testimonials } from "@/components/sections/testimonials";
import { Certifications } from "@/components/sections/certifications";
import { Process } from "@/components/sections/process";
import { BlogCard } from "@/components/blog-card";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublishedBlogs } from "@/lib/blog-store";
import { getSectionVisibility } from "@/lib/settings-store";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const latestPosts = (await getPublishedBlogs()).slice(0, 2);
  const vis = await getSectionVisibility();

  return (
    <>
      {vis.hero && <Hero />}
      {vis.about && <About />}
      {vis.skills && <Skills />}
      {vis.projects && <Projects />}
      {vis.miniProjects && <MiniProjects />}
      {vis.experience && <Experience />}
      {vis.education && <Education />}
      <Certifications />
      {vis.achievements && <Achievements />}
      <Process />
      <Testimonials />
      {vis.games && <MiniGames />}

      {vis.blog && (
        <section id="blog" className="section-padding relative">
          <div className="container-narrow space-y-10">
            <Reveal>
              <SectionHeading
                eyebrow="Insights & Writing"
                title="Latest Developer Blog Posts"
              />
            </Reveal>

            {latestPosts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {latestPosts.map((post, idx) => (
                  <Reveal key={post.slug} delay={idx * 0.1}>
                    <BlogCard post={post} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 text-sm py-8">
                No blog posts published yet.
              </div>
            )}

            <Reveal delay={0.2}>
              <div className="flex justify-center pt-2">
                <LinkButton href="/blog" variant="secondary" className="gap-2 text-xs">
                  View All Blog Posts
                  <ArrowRight className="h-3.5 w-3.5" />
                </LinkButton>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {vis.contact && <Contact />}
    </>
  );
}
