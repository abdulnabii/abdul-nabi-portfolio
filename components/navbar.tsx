"use client";

import { siteContent } from "@/data/content";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

import { useSiteSettings } from "@/components/settings-provider";

export function Navbar() {
  const { settings } = useSiteSettings();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const name = settings.fullName || siteContent.name;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || open ? "py-3" : "py-5"
      )}
    >
      <div className="container-narrow px-4 sm:px-6 lg:px-8">
        <nav
          className={cn(
            "flex items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-500 sm:px-5",
            scrolled || open
              ? "border-white/10 bg-[#0a0f1e]/70 shadow-glass backdrop-blur-2xl"
              : "border-transparent bg-transparent"
          )}
          aria-label="Primary"
        >
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            onClick={() => setOpen(false)}
          >
            <Logo className="h-9 w-9 shrink-0" />
            <span className="hidden text-sm font-medium tracking-wide text-white sm:block">
              {name}
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {siteContent.navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-xl border border-transparent px-3.5 py-2 text-sm text-slate-300 transition-all duration-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 md:flex">
            <LinkButton href="/#contact" variant="primary" size="sm">
              Hire / Contact
            </LinkButton>
          </div>

          <Button
            variant="icon"
            size="sm"
            className="md:hidden !h-10 !w-10"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </nav>

        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            open ? "mt-2 max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="rounded-2xl border border-white/10 bg-[#0a0f1e]/85 p-3 shadow-glass-lg backdrop-blur-2xl">
            <ul className="flex flex-col gap-1">
              {siteContent.navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl border border-transparent px-4 py-3 text-sm text-slate-200 transition-all duration-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <LinkButton
                  href="/#contact"
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  Hire / Contact
                </LinkButton>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
