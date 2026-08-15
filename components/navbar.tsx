"use client";

import { siteContent } from "@/data/content";
import { cn } from "@/lib/utils";
import { Menu, X, User, Briefcase, Layers, Trophy, Gamepad2, FileText, Mail, FolderGit2, Rocket, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { usePathname } from "next/navigation";
import { useCommandPalette } from "@/components/command-palette";

import { useSiteSettings } from "@/components/settings-provider";
import { useThemeMode } from "@/components/effects/theme-mode-provider";

const NAV_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "/#about": User,
  "/#projects": FolderGit2,
  "/mini-projects": Rocket,
  "/#stack": Layers,
  "/#experience": Briefcase,
  "/#achievements": Trophy,
  "/#games": Gamepad2,
  "/blog": FileText,
  "/#contact": Mail,
};

export function Navbar() {
  const { settings, sectionVisibility } = useSiteSettings();
  const { theme } = useThemeMode();
  const { open: openCommandPalette } = useCommandPalette();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const name = settings.fullName || siteContent.name;
  const pathname = usePathname();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const isLight = theme === "light";

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

  // Helper to check if a nav item's section is enabled in admin
  const isNavVisible = (href: string) => {
    if (!sectionVisibility) return true;
    if (href === "/#about") return sectionVisibility.about !== false;
    if (href === "/#projects") return sectionVisibility.projects !== false;
    if (href === "/mini-projects") return sectionVisibility.miniProjects !== false;
    if (href === "/#stack") return sectionVisibility.skills !== false;
    if (href === "/#experience") return sectionVisibility.experience !== false;
    if (href === "/#achievements") return sectionVisibility.achievements !== false;
    if (href === "/#games") return sectionVisibility.games !== false;
    if (href === "/blog") return sectionVisibility.blog !== false;
    if (href === "/#contact") return sectionVisibility.contact !== false;
    return true;
  };

  const visibleNavLinks = siteContent.navLinks.filter((link) => isNavVisible(link.href));

  // Smooth Scroll-Spy for active section highlight following exact page DOM flow
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }

    const sectionIds = [
      "about",
      "stack",
      "projects",
      "mini-projects",
      "experience",
      "achievements",
      "games",
      "blog",
      "contact",
    ];

    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 140;

      let currentSection = "";
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            currentSection = id;
            break;
          }
        }
      }

      if (currentSection) {
        setActiveSection(currentSection);
      } else if (window.scrollY < 200) {
        setActiveSection("");
      }
    };

    handleScrollSpy();
    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, [pathname]);

  // Smooth scroll with navbar offset calculation so headers are never cut off
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setOpen(false);
    if (pathname === "/") {
      const targetId =
        href === "/mini-projects"
          ? "mini-projects"
          : href === "/blog"
          ? "blog"
          : href.replace("/#", "").replace("#", "");

      const el = document.getElementById(targetId);
      if (el) {
        e.preventDefault();
        const targetTop = el.getBoundingClientRect().top + window.scrollY - 85;
        window.scrollTo({ top: targetTop, behavior: "smooth" });
        setActiveSection(targetId);
      }
    }
  };

  const isLinkActive = (href: string) => {
    if (href === "/blog") {
      return pathname.startsWith("/blog") || (pathname === "/" && activeSection === "blog");
    }
    if (href === "/mini-projects") {
      return pathname.startsWith("/mini-projects") || (pathname === "/" && activeSection === "mini-projects");
    }
    const sectionId = href.replace("/#", "").replace("#", "");
    return activeSection === sectionId;
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 print:hidden",
        scrolled || open ? "py-2.5" : "py-4 sm:py-5"
      )}
    >
      <div className="container-narrow px-4 sm:px-6 lg:px-8">
        <nav
          className={cn(
            "flex items-center justify-between rounded-full border px-4 py-2 transition-all duration-300 sm:px-6",
            scrolled || open
              ? isLight
                ? "border-slate-300/80 bg-white/90 shadow-md backdrop-blur-xl text-slate-900"
                : "border-white/10 bg-[#050814]/85 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl text-white"
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
            <span
              className={cn(
                "hidden text-sm font-semibold tracking-wide sm:block transition-colors",
                isLight && scrolled ? "text-slate-900" : "text-white"
              )}
            >
              {name}
            </span>
          </Link>

          {/* Desktop Nav Pills (Icon by default, expands text on hover/active) */}
          {visibleNavLinks.length > 0 && (
            <div
              className={cn(
                "hidden md:flex items-center rounded-full border p-1.5 backdrop-blur-md transition-colors",
                isLight && scrolled
                  ? "border-slate-300/80 bg-slate-100/80"
                  : "border-white/10 bg-white/[0.05]"
              )}
            >
              <ul className="flex items-center gap-1">
                {visibleNavLinks.map((link) => {
                  const active = isLinkActive(link.href);
                  const IconComponent = NAV_ICON_MAP[link.href] || FolderGit2;

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={(e) => handleNavClick(e, link.href)}
                        title={link.label}
                        className={cn(
                          "group relative flex items-center gap-1.5 rounded-full p-2 text-xs font-medium transition-all duration-300 ease-out",
                          active
                            ? isLight
                              ? "bg-indigo-600 text-white shadow-sm px-3 border border-indigo-500"
                              : "bg-[#6D5EF8]/30 text-white border border-[#6D5EF8]/50 shadow-sm px-3"
                            : isLight && scrolled
                              ? "border border-transparent text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 hover:px-3"
                              : "border border-transparent text-slate-300 hover:bg-white/10 hover:text-white hover:px-3"
                        )}
                      >
                        <IconComponent
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                            active
                              ? isLight
                                ? "text-white"
                                : "text-indigo-300"
                              : isLight && scrolled
                                ? "text-slate-600 group-hover:text-indigo-600"
                                : "text-slate-400 group-hover:text-indigo-400"
                          )}
                        />
                        <span
                          className={cn(
                            "overflow-hidden transition-all duration-300 whitespace-nowrap text-xs",
                            active ? "max-w-xs opacity-100" : "max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100"
                          )}
                        >
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-3">
            {/* Command Palette Trigger */}
            <button
              onClick={openCommandPalette}
              className={cn(
                "group flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
                isLight && scrolled
                  ? "border-slate-300 bg-slate-100 text-slate-700 hover:border-slate-400 hover:bg-slate-200/80 hover:text-slate-900"
                  : "border-white/10 bg-white/[0.05] text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
              )}
              title="Search & Commands (Cmd+K / Ctrl+K)"
              aria-label="Open Command Palette"
            >
              <Search className="h-3.5 w-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="hidden lg:inline text-[11px] text-slate-400 group-hover:text-slate-200">Search</span>
              <kbd className="hidden sm:inline-flex items-center rounded border border-white/10 bg-white/[0.08] px-1 py-0.2 text-[9px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Desktop & Mobile Theme Toggle */}
            {sectionVisibility?.themeToggle !== false && <ThemeToggle />}

            {sectionVisibility?.contact !== false && (
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
                      if (el) {
                        const targetTop = el.getBoundingClientRect().top + window.scrollY - 85;
                        window.scrollTo({ top: targetTop, behavior: "smooth" });
                      }
                      setActiveSection("contact");
                    }
                  }}
                >
                  Hire / Contact
                </LinkButton>
              </div>
            )}

            {/* Mobile Hamburger */}
            <Button
              variant="icon"
              size="sm"
              className={cn(
                "md:hidden !h-9 !w-9 !rounded-full transition-colors",
                isLight && scrolled ? "text-slate-900 border-slate-300" : ""
              )}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </nav>

        {/* Mobile Drawer */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            open ? "mt-2 max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          )}
        >
          <div
            className={cn(
              "rounded-3xl border p-4 shadow-2xl backdrop-blur-2xl transition-colors",
              isLight
                ? "border-slate-300 bg-white/95 text-slate-900"
                : "border-white/10 bg-[#050814]/95 text-white"
            )}
          >
            <ul className="flex flex-col gap-1">
              {visibleNavLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={cn(
                        "block rounded-2xl px-4 py-3 text-sm transition-all duration-150",
                        active
                          ? isLight
                            ? "bg-indigo-600 text-white font-semibold shadow-sm"
                            : "bg-[#6D5EF8]/25 text-white border border-[#6D5EF8]/40 font-semibold"
                          : isLight
                            ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              {sectionVisibility?.contact !== false && (
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
                        if (el) {
                          const targetTop = el.getBoundingClientRect().top + window.scrollY - 85;
                          window.scrollTo({ top: targetTop, behavior: "smooth" });
                        }
                        setActiveSection("contact");
                      }
                    }}
                  >
                    Hire / Contact
                  </LinkButton>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
