"use client";

import { getActiveSocials, siteContent } from "@/data/content";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { useSiteSettings } from "@/components/settings-provider";

const iconMap = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  email: Mail,
  whatsapp: Mail,
};

export function Footer() {
  const { settings } = useSiteSettings();
  const year = new Date().getFullYear();
  const socials = getActiveSocials();
  const name = settings.fullName || siteContent.name;
  const email = settings.email || siteContent.email?.trim();

  return (
    <footer className="relative border-t border-white/5">
      <div className="section-padding !py-12">
        <div className="container-narrow">
          <div className="glass rounded-3xl p-8 md:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div>
                <Link href="/" className="group inline-flex items-center gap-2.5">
                  <Logo className="h-9 w-9 shrink-0" />
                  <span className="text-sm font-medium text-white transition-colors group-hover:text-accent-soft">
                    {name}
                  </span>
                </Link>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
                  {siteContent.tagline}
                </p>
              </div>

              <div className="flex flex-col items-start gap-4 md:items-end">
                <nav aria-label="Footer">
                  <ul className="flex flex-wrap gap-x-5 gap-y-2">
                    {siteContent.navLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="rounded-lg border border-transparent px-2.5 py-1 text-sm text-slate-400 transition-all duration-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                {(socials.length > 0 || email) && (
                  <ul className="flex items-center gap-2">
                    {socials.map((social) => {
                      const Icon = iconMap[social.icon];
                      return (
                        <li key={social.label}>
                          <a
                            href={social.href}
                            target={
                              social.icon === "email" ? undefined : "_blank"
                            }
                            rel={
                              social.icon === "email"
                                ? undefined
                                : "noopener noreferrer"
                            }
                            aria-label={social.label}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                          >
                            <Icon className="h-4 w-4" />
                          </a>
                        </li>
                      );
                    })}
                    {email && !socials.some((s) => s.icon === "email") && (
                      <li>
                        <a
                          href={`mailto:${email}`}
                          aria-label="Email"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2 border-t border-white/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                {`© ${year} ${name}. All rights reserved.`}
              </p>
              <p className="text-xs text-slate-500">{siteContent.footer.note}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
