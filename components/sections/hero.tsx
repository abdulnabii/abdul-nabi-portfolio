"use client";

import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroPortrait3D } from "@/components/effects/hero-portrait-3d";
import { siteContent } from "@/data/content";
import { getActiveSocials } from "@/data/content";
import { isPublicUrl } from "@/lib/links";
import { useSiteSettings } from "@/components/settings-provider";
import { ArrowDownRight, FileText, Github, Linkedin, Mail } from "lucide-react";
import { TerminalTypewriter } from "@/components/ui/terminal-typewriter";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const iconMap = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  twitter: Github,
  whatsapp: WhatsAppIcon,
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
              <a
                href="/ab_resume.pdf"
                download="Abdul_Nabi_Resume.pdf"
                className="cursor-grow inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-medium text-slate-200 transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                <FileText className="h-4 w-4 text-indigo-400" />
                Download CV
              </a>
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

            {/* Dynamic Social Links from Settings */}
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {settings.githubUrl && (
                <li>
                  <a
                    href={settings.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-grow inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-slate-300 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  >
                    <Github className="h-3.5 w-3.5" />
                    GitHub
                  </a>
                </li>
              )}
              {settings.linkedinUrl && (
                <li>
                  <a
                    href={settings.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-grow inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-slate-300 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn
                  </a>
                </li>
              )}
              {settings.whatsapp && (
                <li>
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-grow inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-xs font-medium text-emerald-300 transition-all hover:bg-emerald-500/20"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>

            {/* Interactive Terminal Typewriter */}
            <TerminalTypewriter />
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
