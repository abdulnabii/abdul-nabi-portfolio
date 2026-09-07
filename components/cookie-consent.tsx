"use client";

import { useEffect, useState } from "react";
import { setCookieConsent, hasUserSetConsent } from "@/lib/cookies";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!hasUserSetConsent()) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!mounted || !showBanner) return null;

  const handleAccept = () => {
    setCookieConsent({ analytics: true, functional: true });
    setShowBanner(false);
  };

  const handleDecline = () => {
    setCookieConsent({ analytics: false, functional: false });
    setShowBanner(false);
  };

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fade-up"
    >
      <div className="rounded-2xl border border-white/15 bg-[#0a0f1e]/95 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent-soft">
              <Cookie className="h-4.5 w-4.5" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-white">Cookie Notice</h4>
              <p className="text-[11px] text-slate-400">Zero advertising trackers</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDecline}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close cookie notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-300 leading-relaxed">
          We use minimal cookies to ensure security, remember your theme settings, and measure anonymous traffic. No advertising or personal tracking cookies are used.
        </p>

        <div className="mt-4 flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={handleAccept}
            className="flex-1 text-xs py-2"
          >
            Accept Cookies
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDecline}
            className="text-xs py-2 px-4 text-slate-300 hover:text-white"
          >
            Decline
          </Button>
        </div>

        <div className="mt-3 border-t border-white/5 pt-2 flex items-center justify-between text-[11px] text-slate-500">
          <Link href="/privacy" className="hover:text-accent-soft hover:underline transition-colors">
            Privacy Policy
          </Link>
          <span>aiwithab.site</span>
        </div>
      </div>
    </aside>
  );
}
