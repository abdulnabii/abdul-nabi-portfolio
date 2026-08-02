"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

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

  useEffect(() => {
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
  }, [pathname]);

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

      if (matchedLabel) {
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
  }, []);

  return null;
}
