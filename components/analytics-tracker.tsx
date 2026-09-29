"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookieConsent, COOKIE_CONSENT_EVENT, hasUserSetConsent } from "@/lib/cookies";

// In-memory debounce map (does not write any sensitive markers to browser localStorage or sessionStorage)
const pageLastTrackedMap = new Map<string, number>();

export function AnalyticsTracker() {
  const pathname = usePathname();
  const [consentAllowed, setConsentAllowed] = useState(true);

  // Proactively purge any legacy storage key left by previous builds
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("an_session_id");
        localStorage.removeItem("an_session_id");
      } catch {}
    }
  }, []);

  useEffect(() => {
    const checkConsent = () => {
      // If user explicitly made a choice, check if analytics is allowed
      if (hasUserSetConsent()) {
        const prefs = getCookieConsent();
        setConsentAllowed(prefs.analytics);
      } else {
        // Default mode before explicit choice (privacy friendly)
        setConsentAllowed(true);
      }
    };

    checkConsent();
    const handleUpdate = () => checkConsent();
    window.addEventListener(COOKIE_CONSENT_EVENT, handleUpdate);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handleUpdate);
  }, []);

  useEffect(() => {
    if (!consentAllowed) return;
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    const now = Date.now();
    const lastTrackTime = pageLastTrackedMap.get(pathname) || 0;

    // Debounce rapid double-execution within 2.5 seconds (prevents React StrictMode double count)
    if (now - lastTrackTime < 2500) return;
    pageLastTrackedMap.set(pathname, now);

    const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const utmSource = searchParams?.get("utm_source") || undefined;
    const utmMedium = searchParams?.get("utm_medium") || undefined;
    const utmCampaign = searchParams?.get("utm_campaign") || undefined;
    const referrer = typeof document !== "undefined" ? document.referrer : undefined;

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "page_view",
        page_slug: pathname,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        referrer,
      }),
    }).catch(() => {});
  }, [pathname, consentAllowed]);

  useEffect(() => {
    const handleCtaClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a, button");
      if (!target) return;

      const text = target.textContent?.trim() || "";
      const trackedLabels = [
        "View selected work",
        "Get in touch",
        "Download CV",
        "View case study →",
        "GitHub",
        "LinkedIn",
      ];

      const matchedLabel = trackedLabels.find((label) =>
        text.toLowerCase().includes(label.toLowerCase())
      );

      if (matchedLabel && consentAllowed) {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_type: "cta_click",
            cta_label: matchedLabel,
            page_slug: window.location.pathname,
          }),
        }).catch(() => {});
      }
    };

    document.addEventListener("click", handleCtaClick);
    return () => document.removeEventListener("click", handleCtaClick);
  }, [consentAllowed]);

  return null;
}
