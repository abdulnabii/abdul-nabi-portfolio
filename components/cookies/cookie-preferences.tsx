"use client";

import { useEffect, useState } from "react";
import {
  getCookieConsent,
  setCookieConsent,
  COOKIE_CONSENT_EVENT,
} from "@/lib/cookies";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export function CookiePreferences() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const [functionalAllowed, setFunctionalAllowed] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    setAnalyticsAllowed(consent.analytics);
    setFunctionalAllowed(consent.functional);

    const onConsentUpdated = (e: any) => {
      if (e.detail) {
        setAnalyticsAllowed(e.detail.analytics);
        setFunctionalAllowed(e.detail.functional);
      }
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentUpdated);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentUpdated);
  }, []);

  const handleSaveConsent = () => {
    setCookieConsent({
      analytics: analyticsAllowed,
      functional: functionalAllowed,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleAcceptAll = () => {
    setAnalyticsAllowed(true);
    setFunctionalAllowed(true);
    setCookieConsent({ analytics: true, functional: true });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleEssentialOnly = () => {
    setAnalyticsAllowed(false);
    setFunctionalAllowed(false);
    setCookieConsent({ analytics: false, functional: false });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <GlassCard padding="lg" className="border-white/10 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <div>
            <h3 className="text-base font-semibold text-white">Your Cookie & Privacy Preferences</h3>
            <p className="text-xs text-slate-400">Manage which optional features may store data on your device</p>
          </div>
        </div>
        {savedNotice && (
          <span className="flex items-center gap-1 text-xs text-emerald-400 animate-fade-up">
            <CheckCircle2 className="h-3.5 w-3.5" /> Preferences saved
          </span>
        )}
      </div>

      <div className="grid gap-3.5 sm:grid-cols-3">
        {/* Strictly Necessary */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Strictly Necessary</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
              <Lock className="h-3 w-3" /> Always Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Essential for cryptographic security, CSRF protection, and saving your consent choice. Cannot be disabled.
          </p>
        </div>

        {/* Functional */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Functional & Theme</span>
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
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Stores your visual theme preference (Dark or Light) and prevents duplicate project upvotes.
          </p>
        </div>

        {/* Analytics */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
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
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Anonymous pageview counting. Zero third-party advertising trackers, cross-site profiling, or personal identification.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs text-slate-500">
        <span>Zero third-party tracking scripts loaded</span>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleEssentialOnly}
            className="text-xs"
          >
            Essential Only
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAcceptAll}
            className="text-xs"
          >
            Accept All
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveConsent}
            className="text-xs"
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
