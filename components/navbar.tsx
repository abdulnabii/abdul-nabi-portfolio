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
  const [activeSection, setActiveSection] = useState<string>("");
  const name = settings.fullName || siteContent.name;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
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

  // Scroll-Spy IntersectionObserver for active section highlight
  useEffect(() => {
    const sectionIds = ["about", "projects", "stack", "experience", "education", "blog", "contact"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.25, rootMargin: "-70px 0px -45% 0px" }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open ? "py-3" : "py-5"
      )}
    >
      <div className="container-narrow px-4 sm:px-6 lg:px-8">
        <nav
          className={cn(
            "flex items-center justify-between rounded-full border px-4 py-2 transition-all duration-300 sm:px-6",
            scrolled || open
              ? "border-white/10 bg-[#050814]/80 shadow-glass-lg backdrop-blur-2xl"
              : "border-transparent bg-transparent"
          )}
          aria-label="Primary"
        >
          <Link
            href="/"
            className="group flex items-center gap-2.5 cursor-grow"
            onClick={() => setOpen(false)}
          >
            <Logo className="h-8 w-8 shrink-0 transition-transform duration-200 group-hover:scale-105" />
            <span className="hidden text-sm font-semibold tracking-wide text-white sm:block">
              {name}
            </span>
          </Link>

          {/* Grouped Glass Pill Container for Nav Links */}
          <div className="hidden md:flex items-center rounded-full border border-white/10 bg-white/[0.05] p-1.5 backdrop-blur-md shadow-inner">
            <ul className="flex items-center gap-1">
              {siteContent.navLinks.map((link) => {
                const sectionId = link.href.replace("/#", "").replace("#", "");
                const isActive = activeSection === sectionId;

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-150 cursor-grow",
                        isActive
                          ? "bg-[#6D5EF8]/25 text-white border border-[#6D5EF8]/40 shadow-sm font-semibold"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <LinkButton
              href="/#contact"
              variant="primary"
              size="sm"
              className="hover:scale-105 transition-transform duration-200 cursor-grow"
            >
              Hire / Contact
            </LinkButton>
          </div>

          <Button
            variant="icon"
            size="sm"
            className="md:hidden !h-9 !w-9 !rounded-full cursor-grow"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </Button>
        </nav>

        {/* Mobile Dropdown Drawer */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            open ? "mt-2 max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="rounded-3xl border border-white/10 bg-[#050814]/90 p-4 shadow-glass-lg backdrop-blur-2xl">
            <ul className="flex flex-col gap-1.5">
              {siteContent.navLinks.map((link) => {
                const sectionId = link.href.replace("/#", "").replace("#", "");
                const isActive = activeSection === sectionId;

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-2xl px-4 py-2.5 text-sm transition-all duration-150",
                        isActive
                          ? "bg-[#6D5EF8]/25 text-white border border-[#6D5EF8]/40 font-semibold"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li className="pt-2">
                <LinkButton
                  href="/#contact"
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => setOpen(false)}
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
