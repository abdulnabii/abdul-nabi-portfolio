"use client";

import { useEffect, useState } from "react";
import { useSiteSettings } from "@/components/settings-provider";
import { Sparkles, X, ArrowRight } from "lucide-react";

export function AnnouncementBar() {
  const { settings } = useSiteSettings();
  const [dismissed, setDismissed] = useState(true);

  const isActive =
    settings.announcementBarActive === true ||
    settings.announcementBarActive === "true";

  const message =
    settings.announcementBarText?.trim() ||
    "🚀 Open to full-time engineering roles, AI projects, and security audits.";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("an_announcement_dismissed");
      if (!stored && isActive) {
        setDismissed(false);
      }
    }
  }, [isActive]);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("an_announcement_dismissed", "true");
    }
  };

  if (!isActive || dismissed) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="relative z-50 border-b border-indigo-500/20 bg-gradient-to-r from-indigo-950/90 via-purple-950/80 to-slate-950/90 py-2 px-4 text-center text-xs font-medium text-white shadow-lg backdrop-blur-md animate-fade-in"
    >
      <div className="container-narrow flex items-center justify-center gap-2 sm:gap-4 relative pr-8 sm:pr-0">
        <span className="inline-flex items-center gap-1 text-accent-soft font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Notice:</span>
        </span>
        <span className="text-slate-200 truncate sm:overflow-visible">
          {message}
        </span>
        <a
          href="/#contact"
          className="hidden sm:inline-flex items-center gap-1 rounded-full border border-indigo-400/40 bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-bold text-indigo-200 transition-colors hover:bg-indigo-500/40"
        >
          <span>Get in touch</span>
          <ArrowRight className="h-3 w-3" />
        </a>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
