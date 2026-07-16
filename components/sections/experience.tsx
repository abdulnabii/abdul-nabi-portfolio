import { GlassCard } from "@/components/ui/glass-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteContent } from "@/data/content";

export function Experience() {
  return (
    <section
      id="experience"
      className="section-padding relative"
      aria-labelledby="experience-heading"
    >
      <div className="container-narrow">
        <Reveal>
          <SectionHeading
            eyebrow="Career"
            title="Experience"
            subtitle="Recent full-stack work — feature ownership, product UI, and shipping with care."
          />
        </Reveal>

        <ol className="relative space-y-5">
          <div
            className="absolute left-[1.15rem] top-3 bottom-3 w-px bg-gradient-to-b from-accent/50 via-white/10 to-transparent md:left-[1.35rem]"
            aria-hidden
          />

          {siteContent.experience.map((item, index) => (
            <Reveal key={item.id} delay={index * 80} as="li">
              <div className="relative grid gap-4 pl-0 md:grid-cols-[180px_1fr] md:gap-8">
                <div className="flex items-start gap-4 md:block md:pl-0">
                  <span className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-[#0a0f1e] md:absolute md:left-2 md:top-7">
                    <span className="h-2 w-2 rounded-full bg-accent shadow-glow-sm" />
                  </span>
                  <div className="md:pl-12">
                    <p className="text-sm font-medium text-accent-soft">
                      {item.period}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{item.location}</p>
                  </div>
                </div>

                <GlassCard interactive hover padding="lg" className="md:ml-0 cursor-grow">
                  <h3 className="text-xl font-semibold text-white">
                    {item.role}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">{item.company}</p>
                  <p className="mt-4 text-sm leading-relaxed text-slate-300">
                    {item.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {item.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex gap-2 text-sm leading-relaxed text-slate-400"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/80" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
