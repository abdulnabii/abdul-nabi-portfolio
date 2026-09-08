"use client";

import { getActiveSocials, siteContent } from "@/data/content";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { useSiteSettings } from "@/components/settings-provider";

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
  twitter: Twitter,
  email: Mail,
  whatsapp: WhatsAppIcon,
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

            <div className="mt-8 flex flex-col gap-3 border-t border-white/5 pt-6 text-xs text-slate-500">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p>
                  {`© ${year} ${name}. All rights reserved.`}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <Link href="/privacy" className="hover:text-slate-300 transition-colors">
                    Privacy Policy
                  </Link>
                  <span>·</span>
                  <Link href="/terms" className="hover:text-slate-300 transition-colors">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
