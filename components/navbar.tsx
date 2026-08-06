"use client";

import { siteContent } from "@/data/content";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { usePathname } from "next/navigation";

import { useSiteSettings } from "@/components/settings-provider";

export function Navbar() {
  const { settings } = useSiteSettings();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const name = settings.fullName || siteContent.name;
  const pathname = usePathname();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Scroll-Spy IntersectionObserver for active section highlight
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }

    const sectionIds = ["about", "projects", "stack", "experience", "achievements", "games", "contact"];

    const tryObserve = () => {
      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean) as HTMLElement[];

      if (sections.length === 0) return false;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          // Pick the entry closest to top of viewport
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible.length > 0) {
            setActiveSection(visible[0].target.id);
          }
        },
        { threshold: 0.15, rootMargin: "-64px 0px -40% 0px" }
      );

      sections.forEach((sec) => observerRef.current!.observe(sec));
      return true;
    };

    // Retry until sections are rendered
    if (!tryObserve()) {
      const timer = setTimeout(tryObserve, 500);
      return () => {
        clearTimeout(timer);
        observerRef.current?.disconnect();
      };
    }

    return () => observerRef.current?.disconnect();
  }, [pathname]);

  // Smooth scroll for hash links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setOpen(false);
    if (href.startsWith("/#") && pathname === "/") {
      e.preventDefault();
      const id = href.replace("/#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveSection(id);
      }
    }
  };

  const isLinkActive = (href: string) => {
    if (href === "/blog") return pathname.startsWith("/blog");
    const sectionId = href.replace("/#", "").replace("#", "");
    return activeSection === sectionId;
  };

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
              ? "border-white/10 bg-[#050814]/85 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
              : "border-transparent bg-transparent"
          )}
          aria-label="Primary"
        >
          <Link
            href="/"
            className="group flex items-center gap-2.5 select-none"
            onClick={() => setOpen(false)}
          >
            <Logo className="h-8 w-8 shrink-0 transition-transform duration-200 group-hover:scale-105" />
            <span className="hidden text-sm font-semibold tracking-wide text-white sm:block">
              {name}
            </span>
          </Link>

          {/* Desktop Nav Pills */}
          <div className="hidden md:flex items-center rounded-full border border-white/10 bg-white/[0.05] p-1.5 backdrop-blur-md">
            <ul className="flex items-center gap-0.5">
              {siteContent.navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 whitespace-nowrap",
                        active
                          ? "bg-[#6D5EF8]/30 text-white border border-[#6D5EF8]/50 shadow-sm font-semibold"
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
              className="hover:scale-105 transition-transform duration-200"
              onClick={() => {
                setOpen(false);
                if (pathname === "/") {
                  const el = document.getElementById("contact");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActiveSection("contact");
                }
              }}
            >
              Hire / Contact
            </LinkButton>
          </div>

          {/* Mobile Hamburger */}
          <Button
            variant="icon"
            size="sm"
            className="md:hidden !h-9 !w-9 !rounded-full"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </nav>

        {/* Mobile Drawer */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            open ? "mt-2 max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          )}
        >
          <div className="rounded-3xl border border-white/10 bg-[#050814]/95 p-4 shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
            <ul className="flex flex-col gap-1">
              {siteContent.navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={cn(
                        "block rounded-2xl px-4 py-3 text-sm transition-all duration-150",
                        active
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
                  onClick={() => {
                    setOpen(false);
                    if (pathname === "/") {
                      const el = document.getElementById("contact");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      setActiveSection("contact");
                    }
                  }}
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
