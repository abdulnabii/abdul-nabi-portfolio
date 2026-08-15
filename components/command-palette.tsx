"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Compass,
  Briefcase,
  FileText,
  User,
  Layers,
  Trophy,
  Gamepad2,
  Mail,
  Github,
  Linkedin,
  FileDown,
  Moon,
  Sun,
  Sparkles,
  ExternalLink,
  Code,
  Flame,
} from "lucide-react";
import { useThemeMode } from "@/components/effects/theme-mode-provider";
import { useSiteSettings } from "@/components/settings-provider";
import { siteContent } from "@/data/content";

interface CommandPaletteContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export const useCommandPalette = () => useContext(CommandPaletteContext);

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <CommandPaletteContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
      {isOpen && <CommandPaletteModal onClose={close} />}
    </CommandPaletteContext.Provider>
  );
}

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Projects & Labs" | "Quick Actions" | "Connect";
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

function CommandPaletteModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { theme, toggleTheme } = useThemeMode();
  const { settings } = useSiteSettings();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const commands: CommandItem[] = useMemo(() => {
    const email = settings.email || siteContent.email || "abdulnabi.khaskhely@gmail.com";
    const github = settings.githubUrl || siteContent.socials?.find((s) => s.icon === "github")?.href || "https://github.com/abdulnabii";
    const linkedin = settings.linkedinUrl || siteContent.socials?.find((s) => s.icon === "linkedin")?.href || "https://linkedin.com/in/abdul-nabi-95391a3b0";

    const items: CommandItem[] = [
      // Navigation
      {
        id: "nav-home",
        title: "Home",
        category: "Navigation",
        subtitle: "Return to hero overview",
        icon: Compass,
        action: () => {
          router.push("/#home");
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
        keywords: ["top", "hero", "start"],
      },
      {
        id: "nav-about",
        title: "About Me",
        category: "Navigation",
        subtitle: "Background, bio & career metrics",
        icon: User,
        action: () => {
          const el = document.getElementById("about");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          } else {
            router.push("/#about");
          }
        },
        keywords: ["bio", "story", "education"],
      },
      {
        id: "nav-stack",
        title: "Tech Stack & Skills",
        category: "Navigation",
        subtitle: "Next.js, TypeScript, Python ML & AppSec",
        icon: Layers,
        action: () => {
          const el = document.getElementById("stack");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          } else {
            router.push("/#stack");
          }
        },
        keywords: ["skills", "languages", "tools", "frameworks"],
      },
      {
        id: "nav-projects",
        title: "Featured Projects",
        category: "Navigation",
        subtitle: "Production full-stack & ML systems",
        icon: Briefcase,
        action: () => {
          const el = document.getElementById("projects");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          } else {
            router.push("/#projects");
          }
        },
        keywords: ["work", "portfolio", "case studies", "apps"],
      },
      {
        id: "nav-mini-projects",
        title: "30 Days · 30 Projects",
        category: "Projects & Labs",
        subtitle: "Live mini projects & AI tools challenge",
        icon: Flame,
        action: () => {
          router.push("/mini-projects");
        },
        keywords: ["mini apps", "challenge", "experiments"],
      },
      {
        id: "nav-games",
        title: "Dev Labs (Interactive Demos)",
        category: "Projects & Labs",
        subtitle: "Play Flappy Bird, Snake & Aim Trainer",
        icon: Gamepad2,
        action: () => {
          const el = document.getElementById("games");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          } else {
            router.push("/#games");
          }
        },
        keywords: ["games", "arcade", "labs", "canvas"],
      },
      {
        id: "nav-blog",
        title: "Technical Blog",
        category: "Navigation",
        subtitle: "Engineering insights, AppSec & AI articles",
        icon: FileText,
        action: () => {
          router.push("/blog");
        },
        keywords: ["posts", "articles", "writing"],
      },
      {
        id: "nav-contact",
        title: "Contact & Hire",
        category: "Navigation",
        subtitle: "Start a project or send a direct inquiry",
        icon: Mail,
        action: () => {
          const el = document.getElementById("contact");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          } else {
            router.push("/#contact");
          }
        },
        keywords: ["email", "hire", "message", "freelance"],
      },

      // Quick Actions
      {
        id: "act-theme",
        title: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        category: "Quick Actions",
        subtitle: "Toggle aesthetic theme color scheme",
        icon: theme === "dark" ? Sun : Moon,
        action: () => {
          toggleTheme();
        },
        keywords: ["theme", "light", "dark", "mode", "color"],
      },
      {
        id: "act-resume",
        title: "Download Resume / CV",
        category: "Quick Actions",
        subtitle: "PDF format · Latest 2026 version",
        icon: FileDown,
        action: () => {
          const link = document.createElement("a");
          link.href = "/ab_resume.pdf";
          link.download = "Abdul_Nabi_Resume.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        keywords: ["cv", "resume", "pdf", "download"],
      },
      {
        id: "act-chatbot",
        title: "Chat with AI Assistant",
        category: "Quick Actions",
        subtitle: "Ask questions about Abdul Nabi's experience",
        icon: Sparkles,
        action: () => {
          // Trigger chatbot toggle if present
          const chatBtn = document.querySelector('button[aria-label="Open AI Assistant"]') as HTMLButtonElement | null;
          if (chatBtn) {
            chatBtn.click();
          }
        },
        keywords: ["ai", "bot", "assistant", "ask"],
      },

      // Connect
      {
        id: "conn-github",
        title: "GitHub Profile",
        category: "Connect",
        subtitle: "github.com/abdulnabii",
        icon: Github,
        action: () => {
          window.open(github, "_blank", "noopener,noreferrer");
        },
        keywords: ["github", "git", "code", "repos"],
      },
      {
        id: "conn-linkedin",
        title: "LinkedIn Profile",
        category: "Connect",
        subtitle: "Connect on LinkedIn",
        icon: Linkedin,
        action: () => {
          window.open(linkedin, "_blank", "noopener,noreferrer");
        },
        keywords: ["linkedin", "network", "career"],
      },
      {
        id: "conn-email",
        title: "Send Direct Email",
        category: "Connect",
        subtitle: email,
        icon: Mail,
        action: () => {
          window.location.href = `mailto:${email}`;
        },
        keywords: ["mail", "email", "inbox"],
      },
    ];

    return items;
  }, [router, theme, toggleTheme, settings]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase().trim();
    return commands.filter((cmd) => {
      const matchTitle = cmd.title.toLowerCase().includes(lower);
      const matchSubtitle = cmd.subtitle?.toLowerCase().includes(lower);
      const matchCategory = cmd.category.toLowerCase().includes(lower);
      const matchKeywords = cmd.keywords?.some((k) => k.toLowerCase().includes(lower));
      return matchTitle || matchSubtitle || matchCategory || matchKeywords;
    });
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  const executeCommand = (cmd: CommandItem) => {
    onClose();
    cmd.action();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    }
  };

  // Group commands by category
  const categories = Array.from(new Set(filteredCommands.map((c) => c.category)));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] sm:pt-[15vh] px-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-[#090d1f]/95 text-slate-100 shadow-[0_20px_70px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all dark:border-white/10 dark:bg-[#080c1e]/95 light:bg-white/95 light:border-slate-300 light:text-slate-900"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Bar */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5 light:border-slate-200">
          <Search className="h-5 w-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search (e.g. projects, stack, cv, theme)..."
            className="w-full bg-transparent text-sm placeholder:text-slate-500 focus:outline-none dark:text-white light:text-slate-900"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No matching commands or pages found for &quot;{query}&quot;.
            </div>
          ) : (
            categories.map((category) => {
              const items = filteredCommands.filter((c) => c.category === category);
              return (
                <div key={category} className="mb-2 last:mb-0">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 light:text-slate-400">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {items.map((cmd) => {
                      const overallIndex = filteredCommands.findIndex((c) => c.id === cmd.id);
                      const isSelected = overallIndex === selectedIndex;
                      const Icon = cmd.icon;

                      return (
                        <div
                          key={cmd.id}
                          onClick={() => executeCommand(cmd)}
                          onMouseEnter={() => setSelectedIndex(overallIndex)}
                          className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs sm:text-sm cursor-pointer transition-all ${
                            isSelected
                              ? "bg-indigo-600/25 border border-indigo-500/40 text-white shadow-sm light:bg-indigo-50 light:border-indigo-200 light:text-indigo-900"
                              : "text-slate-300 hover:bg-white/[0.04] border border-transparent light:text-slate-700 light:hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                isSelected
                                  ? "bg-indigo-500 text-white shadow-sm"
                                  : "bg-white/[0.06] text-slate-400 light:bg-slate-200 light:text-slate-700"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="truncate">
                              <div className="font-medium text-slate-100 dark:text-white light:text-slate-900 truncate">
                                {cmd.title}
                              </div>
                              {cmd.subtitle && (
                                <div className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500 truncate">
                                  {cmd.subtitle}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 text-slate-500 text-[11px]">
                            {cmd.category === "Connect" && <ExternalLink className="h-3 w-3" />}
                            {isSelected && (
                              <span className="hidden sm:inline-flex items-center gap-0.5 rounded border border-indigo-400/30 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] text-indigo-300 font-medium">
                                ↵ Select
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[11px] text-slate-400 light:border-slate-200 light:text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-white/10 bg-white/[0.06] px-1 py-0.5 text-[9px]">↑</kbd>{" "}
              <kbd className="rounded border border-white/10 bg-white/[0.06] px-1 py-0.5 text-[9px]">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="rounded border border-white/10 bg-white/[0.06] px-1 py-0.5 text-[9px]">↵</kbd> to select
            </span>
          </div>
          <div className="hidden sm:block">
            Abdul Nabi Portfolio
          </div>
        </div>
      </div>
    </div>
  );
}
