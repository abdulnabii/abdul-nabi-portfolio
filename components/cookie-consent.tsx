"use client";

import { useEffect, useState } from "react";
import {
  getCookieConsent,
  setCookieConsent,
  hasUserSetConsent,
} from "@/lib/cookies";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

export const OPEN_COOKIE_MODAL_EVENT = "an_open_cookie_modal";

export function openCookieModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_COOKIE_MODAL_EVENT));
  }
}

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Preference switches for simple user consent
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const [functionalAllowed, setFunctionalAllowed] = useState(true);

  useEffect(() => {
    setMounted(true);
    const hasConsent = hasUserSetConsent();
    if (!hasConsent) {
      // Delay slightly for smooth page entry
      const timer = setTimeout(() => setShowBanner(true), 1200);
      return () => clearTimeout(timer);
    } else {
      const current = getCookieConsent();
      setAnalyticsAllowed(current.analytics);
      setFunctionalAllowed(current.functional);
    }

    const handleOpenModal = () => {
      const current = getCookieConsent();
      setAnalyticsAllowed(current.analytics);
      setFunctionalAllowed(current.functional);
      setShowModal(true);
    };

    window.addEventListener(OPEN_COOKIE_MODAL_EVENT, handleOpenModal);
    return () => window.removeEventListener(OPEN_COOKIE_MODAL_EVENT, handleOpenModal);
  }, []);

  if (!mounted) return null;

  const handleAcceptAll = () => {
    setCookieConsent({ analytics: true, functional: true });
    setShowBanner(false);
    setShowModal(false);
  };

  const handleReject = () => {
    setCookieConsent({ analytics: false, functional: false });
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSavePreferences = () => {
    setCookieConsent({
      analytics: analyticsAllowed,
      functional: functionalAllowed,
    });
    setShowModal(false);
    setShowBanner(false);
  };

  return (
    <>
      {/* Simple, Minimal Public Cookie Notice Banner */}
      {showBanner && !showModal && (
        <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fade-up">
          <div className="rounded-2xl border border-white/15 bg-[#0a0f1e]/95 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent-soft">
                  <Cookie className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-white">We Value Your Privacy</h4>
                  <p className="text-[11px] text-slate-400">Minimal cookies. Zero ad trackers.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBanner(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Dismiss cookie notice"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              This site uses essential cookies for security and theme settings, plus anonymous page metrics.
              No advertising or personal tracking cookies are used.
            </p>

            <div className="mt-4 flex items-center gap-2.5">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptAll}
                className="flex-1 text-xs py-2"
              >
                Accept Cookies
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleReject}
                className="text-xs py-2 px-3 text-slate-300 hover:text-white"
              >
                Decline
              </Button>
            </div>

            <div className="mt-3 border-t border-white/5 pt-2 flex items-center justify-between text-[11px] text-slate-500">
              <Link href="/privacy" className="hover:text-accent-soft hover:underline transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="hover:text-accent-soft hover:underline transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Simple Preferences Modal (Only opened when user clicks 'Cookie Preferences' in footer) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg my-8">
            <GlassCard padding="lg" className="border-white/15 bg-[#080d1a] shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-accent-soft">
                    <Cookie className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Cookie Preferences</h3>
                    <p className="text-xs text-slate-400">Manage privacy and cookie permissions on this device</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Clean Consent Toggles */}
              <div className="space-y-3.5">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Strictly Necessary Cookies</span>
                    <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Always Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Required for website security, CSRF protection, and saving your cookie preferences. Cannot be turned off.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Functional & Theme Settings</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={functionalAllowed}
                        onChange={(e) => setFunctionalAllowed(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-accent" />
                    </label>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Remembers your Dark/Light theme mode and prevents duplicate votes on project appreciations.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Anonymous Analytics</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={analyticsAllowed}
                        onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-accent" />
                    </label>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Helps understand which articles and projects are most helpful. Zero advertising trackers or fingerprinting.
                  </p>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <Link
                  href="/privacy"
                  onClick={() => setShowModal(false)}
                  className="text-xs text-slate-500 hover:text-accent-soft hover:underline"
                >
                  Read full Privacy Policy →
                </Link>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleReject}
                    className="text-xs"
                  >
                    Decline Optional
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSavePreferences}
                    className="text-xs"
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </>
  );
}
