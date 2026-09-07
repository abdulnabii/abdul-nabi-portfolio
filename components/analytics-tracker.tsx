"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookieConsent, COOKIE_CONSENT_EVENT, hasUserSetConsent } from "@/lib/cookies";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = sessionStorage.getItem("an_session_id");
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem("an_session_id", sessionId);
  }
  return sessionId;
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const [consentAllowed, setConsentAllowed] = useState(true);

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

    const sessionId = getOrCreateSessionId();
    const visitedKey = `visited_${pathname}`;

    if (!sessionStorage.getItem(visitedKey)) {
      sessionStorage.setItem(visitedKey, "1");
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "page_view",
          page_slug: pathname,
          session_id: sessionId,
        }),
      }).catch(() => {});
    }
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
        const sessionId = getOrCreateSessionId();
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_type: "cta_click",
            cta_label: matchedLabel,
            page_slug: window.location.pathname,
            session_id: sessionId,
          }),
        }).catch(() => {});
      }
    };

    document.addEventListener("click", handleCtaClick);
    return () => document.removeEventListener("click", handleCtaClick);
  }, [consentAllowed]);

  return null;
}
