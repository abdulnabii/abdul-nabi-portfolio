import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteContent } from "@/data/content";

export function About() {
  const { about, name } = siteContent;

  return (
    <section
      id="about"
      className="section-padding relative"
      aria-labelledby="about-heading"
    >
      <div className="container-narrow">
        <Reveal>
          <SectionHeading
            eyebrow="Background"
            title={about.title}
            subtitle={`How ${name.split(" ")[0]} approaches product work — ownership, craft, and honest delivery.`}
          />
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Reveal delay={80}>
            <GlassCard interactive padding="lg" className="h-full space-y-5">
              {about.paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-base leading-relaxed text-slate-300 sm:text-[1.05rem]"
                >
                  {paragraph}
                </p>
              ))}
            </GlassCard>
          </Reveal>

          <div className="flex flex-col gap-4">
            {about.stats.map((stat, index) => (
              <Reveal key={stat.label} delay={120 + index * 60}>
                <GlassCard
                  interactive
                  hover
                  className="grid grid-cols-[1fr_auto] items-center gap-4 cursor-grow w-full py-4 px-5"
                >
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold leading-relaxed">
                    {stat.label}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-indigo-400 shrink-0 text-right">
                    {stat.value}
                  </span>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
