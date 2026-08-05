"use client";

import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroPortrait3D } from "@/components/effects/hero-portrait-3d";
import { siteContent } from "@/data/content";
import { getActiveSocials } from "@/data/content";
import { isPublicUrl } from "@/lib/links";
import { useSiteSettings } from "@/components/settings-provider";
import { ArrowDownRight, FileText, Github, Linkedin, Mail } from "lucide-react";

const iconMap = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  twitter: Github,
  whatsapp: Mail,
};

export function Hero() {
  const { settings } = useSiteSettings();
  const { hero, resumeUrl } = siteContent;
  const fullName = settings.fullName || siteContent.name;
  const location = settings.location || siteContent.location;
  const availability = settings.availabilityText || siteContent.availability;
  const tagline = settings.heroTagline || hero.role;
  const description = settings.heroDescription || hero.description;
  const email = settings.email || siteContent.email;
  const showResume = isPublicUrl(resumeUrl);
  const socials = getActiveSocials();

  return (
    <section
      id="home"
      className="relative flex items-center section-padding pt-28 pb-12 md:pt-32 md:pb-16"
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Ambient background blur blobs */}
        <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-[100px] animate-pulse-soft motion-reduce:animate-none" />
        <div className="absolute right-[10%] top-40 h-48 w-48 rounded-full bg-indigo-900/15 blur-[80px] animate-float motion-reduce:animate-none" />
        <div className="absolute bottom-32 left-[12%] h-56 w-56 rounded-full bg-indigo-950/15 blur-[90px]" />

        {/* Left-side subtle circular elements */}
        <div className="absolute left-[5%] top-[25%] h-56 w-56 rounded-full border border-white/[0.03] bg-white/[0.01] pointer-events-none hidden xl:block shadow-[inset_0_0_15px_rgba(255,255,255,0.01)]" />
        <div className="absolute left-[11%] top-[46%] h-36 w-36 rounded-full border border-white/[0.02] bg-white/[0.005] pointer-events-none hidden xl:block shadow-[inset_0_0_10px_rgba(255,255,255,0.01)]" />

        {/* Right-side arrow elements in vertical rhythm */}
        <div className="absolute right-[6%] top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 pointer-events-none hidden xl:flex">
          <div className="h-10 w-px bg-gradient-to-b from-white/10 to-indigo-500/20" />
          <ArrowDownRight className="h-3.5 w-3.5 text-indigo-400/40 animate-pulse-soft" />
          <ArrowDownRight className="h-3.5 w-3.5 text-indigo-400/20" />
          <ArrowDownRight className="h-3.5 w-3.5 text-indigo-400/10" />
        </div>
      </div>

      <div className="container-narrow relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="animate-fade-up">
            <Badge variant="accent" className="mb-6 gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                aria-hidden
              />
              {availability}
            </Badge>

            <p className="mb-3 text-sm font-medium tracking-wide text-slate-400">
              {hero.greeting}
            </p>

            <h1
              id="hero-heading"
              className="text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[3.5rem] lg:leading-[1.12]"
            >
              {fullName}
            </h1>

            <p className="mt-4 max-w-xl text-xl font-medium leading-snug text-slate-100 sm:text-2xl">
              {tagline}
            </p>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
              {description}
            </p>

            <p className="mt-4 text-sm font-medium tracking-wide text-accent-soft/90">
              {hero.focusLine}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton href={hero.ctaPrimary.href} size="lg" className="cursor-grow">
                {hero.ctaPrimary.label}
                <ArrowDownRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton
                href={hero.ctaSecondary.href}
                variant="secondary"
                size="lg"
                className="cursor-grow"
              >
                {hero.ctaSecondary.label}
              </LinkButton>
              {showResume && resumeUrl && (
                <LinkButton
                  href={resumeUrl}
                  variant="ghost"
                  size="lg"
                  external
                  className="cursor-grow"
                >
                  <FileText className="h-4 w-4" />
                  Download CV
                </LinkButton>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-400">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="cursor-grow text-slate-200 transition-colors hover:text-accent-soft hover:underline"
                >
                  {email}
                </a>
              )}
              <span className="hidden text-slate-600 sm:inline" aria-hidden>·</span>
              <span className="text-slate-400">{location}</span>
            </div>

            {socials.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {socials.map((social) => {
                  const Icon = iconMap[social.icon] ?? Mail;
                  return (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target={social.icon === "email" ? undefined : "_blank"}
                        rel={
                          social.icon === "email"
                            ? undefined
                            : "noopener noreferrer"
                        }
                        className="cursor-grow inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {social.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div
            className="relative animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            <HeroPortrait3D />
          </div>
        </div>
      </div>
    </section>
  );
}
