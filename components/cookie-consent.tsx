"use client";

import { useEffect, useState } from "react";
import {
  getCookieConsent,
  setCookieConsent,
  hasUserSetConsent,
  COOKIE_CONSENT_EVENT,
} from "@/lib/cookies";
import { CookieInspector } from "@/components/cookies/cookie-inspector";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Cookie, X, Sliders, ShieldCheck, Lock } from "lucide-react";
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

  // Preference switches
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

  const handleRejectNonEssential = () => {
    setCookieConsent({ analytics: false, functional: false });
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSaveCustom = () => {
    setCookieConsent({
      analytics: analyticsAllowed,
      functional: functionalAllowed,
    });
    setShowBanner(false);
    setShowModal(false);
  };

  return (
    <>
      {/* Floating Cookie Settings Button (Discrete, Bottom-Left) */}
      <div className="fixed bottom-5 left-5 z-40">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0f1e]/90 text-slate-300 shadow-xl backdrop-blur-md transition-all hover:border-accent/40 hover:bg-accent/15 hover:text-white hover:scale-105 active:scale-95"
          title="Manage Cookie Preferences & Fetch Active Cookies"
          aria-label="Cookie Preferences"
        >
          <Cookie className="h-4 w-4 transition-transform group-hover:rotate-12 text-accent-soft" />
        </button>
      </div>

      {/* Cookie Consent Floating Banner (Bottom) */}
      {showBanner && !showModal && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fade-up">
          <GlassCard padding="lg" className="border-accent/30 shadow-2xl bg-[#080d1a]/95 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-accent-soft">
                  <Cookie className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-white">Cookie & Privacy Notice</h4>
                  <p className="text-[11px] text-slate-400">Zero ad trackers. Strictly minimal.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBanner(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Dismiss cookie banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              We use minimal cookies for security, preference persistence, and anonymous page metrics.
              No advertising or third-party behavioral profiling cookies are loaded.
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptAll}
                className="w-full sm:w-auto text-xs py-2"
              >
                Accept All
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRejectNonEssential}
                className="w-full sm:w-auto text-xs py-2"
              >
                Essential Only
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto text-xs py-2 text-slate-300"
              >
                Customize
              </Button>
            </div>

            <div className="mt-3 border-t border-white/5 pt-2 flex items-center justify-between text-[11px] text-slate-500">
              <Link href="/privacy" className="hover:text-accent-soft hover:underline transition-colors">
                Privacy Policy
              </Link>
              <span>·</span>
              <Link href="/cookies" className="hover:text-accent-soft hover:underline transition-colors">
                Cookie Policy & Inspector
              </Link>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Comprehensive Cookie Preferences & Inspector Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8">
            <GlassCard padding="lg" className="border-white/15 bg-[#080d1a] shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 text-accent-soft">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Cookie Preferences & Inspector</h3>
                    <p className="text-xs text-slate-400">
                      Control which cookies are active on your device and inspect real cookie telemetry
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Embedded Cookie Inspector & Fetcher */}
              <CookieInspector embedded={true} />

              {/* Modal Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <div className="text-xs text-slate-500">
                  Read our full{" "}
                  <Link href="/privacy" onClick={() => setShowModal(false)} className="text-accent-soft hover:underline">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/cookies" onClick={() => setShowModal(false)} className="text-accent-soft hover:underline">
                    Cookie Policy
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRejectNonEssential}
                    className="text-xs"
                  >
                    Reject Optional
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAcceptAll}
                    className="text-xs"
                  >
                    Accept All
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
