export type CookieCategory = "essential" | "functional" | "analytics" | "other";

export interface CookieInfo {
  name: string;
  category: CookieCategory;
  description: string;
  provider: string;
  duration: string;
  type: "HTTP Cookie" | "Local Storage" | "Session Storage";
}

export interface CookieItem {
  name: string;
  value: string;
  size: number;
  category: CookieCategory;
  description: string;
  provider: string;
  isHttpOnly?: boolean;
  isSecure?: boolean;
}

export interface CookieConsentPreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  functional: boolean;
  timestamp: string;
}

export const KNOWN_COOKIES: Record<string, Omit<CookieInfo, "name">> = {
  an_cookie_consent: {
    category: "essential",
    description: "Stores user cookie consent choices for GDPR & privacy compliance.",
    provider: "aiwithab.site (First-Party)",
    duration: "1 year",
    type: "HTTP Cookie",
  },
  an_admin_session: {
    category: "essential",
    description: "HMAC-SHA256 cryptographically signed session token for authenticated admin dashboard access.",
    provider: "aiwithab.site (First-Party)",
    duration: "Session / 7 days",
    type: "HTTP Cookie",
  },
  app_theme: {
    category: "functional",
    description: "Persists your preferred UI visual theme (Dark or Light mode).",
    provider: "aiwithab.site (First-Party)",
    duration: "Persistent",
    type: "Local Storage",
  },
  an_session_id: {
    category: "analytics",
    description: "Anonymous, non-identifying random token to measure page views and click interactions.",
    provider: "aiwithab.site (First-Party)",
    duration: "Browser Session",
    type: "Session Storage",
  },
};

const CONSENT_COOKIE_KEY = "an_cookie_consent";
export const COOKIE_CONSENT_EVENT = "an_cookie_consent_updated";

/**
 * Get a cookie value by name from document.cookie
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)" + encodeURIComponent(name) + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Set a cookie with specified name, value, duration in days, and path
 */
export function setCookie(name: string, value: string, days: number = 365, path: string = "/"): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const secure = window.location.protocol === "https:" ? "; SameSite=Lax; Secure" : "; SameSite=Lax";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=${path}${secure}`;
}

/**
 * Delete a cookie by setting its expiry in the past
 */
export function deleteCookie(name: string, path: string = "/"): void {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
}

/**
 * Categorize any arbitrary cookie name
 */
export function categorizeCookie(name: string): { category: CookieCategory; description: string; provider: string } {
  if (KNOWN_COOKIES[name]) {
    return {
      category: KNOWN_COOKIES[name].category,
      description: KNOWN_COOKIES[name].description,
      provider: KNOWN_COOKIES[name].provider,
    };
  }

  // Prefix matching
  if (name.startsWith("liked_")) {
    return {
      category: "functional",
      description: "Deduplication token preventing repeated upvotes on project appreciation buttons (24h).",
      provider: "aiwithab.site (First-Party)",
    };
  }

  if (name.startsWith("visited_")) {
    return {
      category: "analytics",
      description: "Session flag marking unique page visits during current browsing session.",
      provider: "aiwithab.site (First-Party)",
    };
  }

  if (name.startsWith("_cf") || name.startsWith("cf_")) {
    return {
      category: "essential",
      description: "Cloudflare security cookie used to manage bot mitigation and DDoS filtering.",
      provider: "Cloudflare (Third-Party)",
    };
  }

  if (name.startsWith("_ga") || name.startsWith("_gid") || name.startsWith("_gat")) {
    return {
      category: "analytics",
      description: "Web traffic analytics cookie.",
      provider: "Analytics Provider",
    };
  }

  return {
    category: "other",
    description: "Browser or application runtime state cookie.",
    provider: "Client / Domain",
  };
}

/**
 * Fetch and parse all active cookies from the browser (document.cookie)
 */
export function fetchBrowserCookies(): CookieItem[] {
  if (typeof document === "undefined") return [];

  const rawCookies = document.cookie ? document.cookie.split("; ") : [];
  const items: CookieItem[] = [];

  for (const raw of rawCookies) {
    if (!raw) continue;
    const eqIdx = raw.indexOf("=");
    const rawName = eqIdx !== -1 ? raw.substring(0, eqIdx) : raw;
    const rawValue = eqIdx !== -1 ? raw.substring(eqIdx + 1) : "";

    const name = decodeURIComponent(rawName.trim());
    const value = decodeURIComponent(rawValue.trim());

    // Never expose administrative or authentication tokens to public inspectors
    if (name.toLowerCase().includes("admin") || name.toLowerCase().includes("token") || name === "an_admin_session") {
      continue;
    }

    const size = new Blob([raw]).size;

    const { category, description, provider } = categorizeCookie(name);

    items.push({
      name,
      value,
      size,
      category,
      description,
      provider,
      isHttpOnly: false,
      isSecure: typeof window !== "undefined" && window.location.protocol === "https:",
    });
  }

  return items;
}

/**
 * Read the current stored cookie consent preferences
 */
export function getCookieConsent(): CookieConsentPreferences {
  if (typeof window === "undefined") {
    return { necessary: true, analytics: false, functional: false, timestamp: "" };
  }

  const raw = getCookie(CONSENT_COOKIE_KEY) || localStorage.getItem(CONSENT_COOKIE_KEY);
  if (!raw) {
    return { necessary: true, analytics: false, functional: false, timestamp: "" };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      functional: Boolean(parsed.functional),
      timestamp: parsed.timestamp || "",
    };
  } catch {
    return { necessary: true, analytics: false, functional: false, timestamp: "" };
  }
}

/**
 * Check if the user has already explicitly set consent
 */
export function hasUserSetConsent(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(getCookie(CONSENT_COOKIE_KEY) || localStorage.getItem(CONSENT_COOKIE_KEY));
}

/**
 * Save user cookie consent preferences
 */
export function setCookieConsent(preferences: { analytics: boolean; functional: boolean }): CookieConsentPreferences {
  const finalPrefs: CookieConsentPreferences = {
    necessary: true,
    analytics: preferences.analytics,
    functional: preferences.functional,
    timestamp: new Date().toISOString(),
  };

  const serialized = JSON.stringify(finalPrefs);
  setCookie(CONSENT_COOKIE_KEY, serialized, 365);
  try {
    localStorage.setItem(CONSENT_COOKIE_KEY, serialized);
  } catch {}

  // If analytics is rejected, clear any analytics markers
  if (!preferences.analytics && typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem("an_session_id");
  }

  // Dispatch event for components to react
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: finalPrefs }));
  }

  return finalPrefs;
}
