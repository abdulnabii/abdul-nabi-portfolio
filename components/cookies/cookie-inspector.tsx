"use client";

import { useEffect, useState } from "react";
import {
  CookieItem,
  CookieCategory,
  fetchBrowserCookies,
  getCookieConsent,
  setCookieConsent,
  deleteCookie,
  KNOWN_COOKIES,
  COOKIE_CONSENT_EVENT,
} from "@/lib/cookies";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Cookie,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Lock,
  Sliders,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  Server,
  Globe,
  Info,
} from "lucide-react";

const CATEGORY_META: Record<
  CookieCategory,
  { label: string; badgeClass: string; dotClass: string; desc: string }
> = {
  essential: {
    label: "Strictly Essential",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dotClass: "bg-emerald-400",
    desc: "Required for core security, CSRF protection, and consent storage.",
  },
  functional: {
    label: "Functional",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    dotClass: "bg-blue-400",
    desc: "Persists UI settings like dark/light theme and anti-spam upvotes.",
  },
  analytics: {
    label: "Analytics",
    badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    dotClass: "bg-purple-400",
    desc: "Anonymous metrics to measure page engagement with zero tracking scripts.",
  },
  other: {
    label: "Runtime State",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    dotClass: "bg-amber-400",
    desc: "Other runtime or browser session tokens.",
  },
};

export function CookieInspector({ embedded = false }: { embedded?: boolean }) {
  const [browserCookies, setBrowserCookies] = useState<CookieItem[]>([]);
  const [serverCookies, setServerCookies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"browser" | "server">("browser");
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [unmaskedKeys, setUnmaskedKeys] = useState<Set<string>>(new Set());

  // Consent settings state
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const [functionalAllowed, setFunctionalAllowed] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const fetchClientCookies = () => {
    setLoading(true);
    try {
      const items = fetchBrowserCookies();
      setBrowserCookies(items);
      setLastFetched(new Date());
    } finally {
      setTimeout(() => setLoading(false), 250);
    }
  };

  const fetchServerCookies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cookies");
      const data = await res.json();
      if (data.success) {
        setServerCookies(data.cookies || []);
      }
      setLastFetched(new Date());
    } catch (err) {
      console.error("Failed to fetch server cookies", err);
    } finally {
      setTimeout(() => setLoading(false), 250);
    }
  };

  const handleRefresh = () => {
    if (activeTab === "browser") {
      fetchClientCookies();
    } else {
      fetchServerCookies();
    }
  };

  useEffect(() => {
    fetchClientCookies();
    const consent = getCookieConsent();
    setAnalyticsAllowed(consent.analytics);
    setFunctionalAllowed(consent.functional);

    const onConsentUpdated = (e: any) => {
      if (e.detail) {
        setAnalyticsAllowed(e.detail.analytics);
        setFunctionalAllowed(e.detail.functional);
      }
      fetchClientCookies();
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
    fetchClientCookies();
  };

  const handleClearNonEssential = async () => {
    // Clear browser cookies
    browserCookies.forEach((c) => {
      if (c.category !== "essential") {
        deleteCookie(c.name);
      }
    });

    // Clear server side
    try {
      await fetch("/api/cookies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    } catch {}

    setAnalyticsAllowed(false);
    setCookieConsent({ analytics: false, functional: false });
    fetchClientCookies();
  };

  const toggleMask = (name: string) => {
    const next = new Set(unmaskedKeys);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    setUnmaskedKeys(next);
  };

  const copyValue = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentList = activeTab === "browser" ? browserCookies : serverCookies;

  return (
    <div className="space-y-6">
      {/* Top Controls Card */}
      <GlassCard padding="lg" className="border-white/10 relative overflow-hidden">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent-soft">
              <Cookie className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">Live Cookie Inspector & Fetcher</h3>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400">
                Inspect real cookies currently held in your browser or HTTP headers
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-0.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("browser");
                  fetchClientCookies();
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === "browser"
                    ? "bg-accent/80 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                Browser ({browserCookies.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("server");
                  fetchServerCookies();
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === "server"
                    ? "bg-accent/80 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Server className="h-3.5 w-3.5" />
                Server Headers ({serverCookies.length})
              </button>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Fetch
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearNonEssential}
              className="gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              title="Clear all non-essential cookies"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Optional
            </Button>
          </div>
        </div>

        {/* Status Line */}
        <div className="mt-4 flex flex-wrap items-center justify-between border-t border-white/5 pt-3 text-[11px] text-slate-500">
          <span>
            Active context: <strong className="text-slate-300">{activeTab === "browser" ? "document.cookie (Client-side)" : "HTTP Request Headers (Edge Runtime)"}</strong>
          </span>
          {lastFetched && (
            <span>
              Last fetched: {lastFetched.toLocaleTimeString()} ({currentList.length} items found)
            </span>
          )}
        </div>
      </GlassCard>

      {/* Cookies Table / Cards */}
      <div className="space-y-3">
        {currentList.length === 0 ? (
          <GlassCard padding="lg" className="text-center py-10">
            <ShieldCheck className="mx-auto h-8 w-8 text-emerald-400/80 mb-2" />
            <h4 className="text-sm font-semibold text-white">No active {activeTab} cookies detected</h4>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              This site strictly minimizes cookie usage. No advertising or commercial tracking cookies are present.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              className="mt-4 text-xs"
            >
              Fetch Again
            </Button>
          </GlassCard>
        ) : (
          <div className="grid gap-3">
            {currentList.map((cookie, idx) => {
              const meta = CATEGORY_META[cookie.category as CookieCategory] || CATEGORY_META.other;
              const isUnmasked = unmaskedKeys.has(cookie.name);
              const isCopied = copiedKey === cookie.name;

              return (
                <GlassCard
                  key={cookie.name + idx}
                  padding="md"
                  className="border-white/10 hover:border-white/20 transition-all text-left"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-white">
                          {cookie.name}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.badgeClass}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
                          {meta.label}
                        </span>
                        {cookie.size !== undefined && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {cookie.size} bytes
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{cookie.description}</p>
                      {cookie.provider && (
                        <p className="text-[11px] text-slate-500">
                          Provider: <span className="text-slate-300">{cookie.provider}</span>
                        </p>
                      )}
                    </div>

                    {/* Value display + tools */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <div className="max-w-[200px] truncate rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] font-mono text-slate-300">
                        {isUnmasked
                          ? cookie.value || "(empty)"
                          : cookie.value
                          ? `${cookie.value.substring(0, 8)}••••••••`
                          : "(empty)"}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleMask(cookie.name)}
                        className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        title={isUnmasked ? "Mask value" : "Reveal full value"}
                      >
                        {isUnmasked ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => copyValue(cookie.name, cookie.value)}
                        className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Copy cookie value"
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>

                      {cookie.category !== "essential" && (
                        <button
                          type="button"
                          onClick={() => {
                            deleteCookie(cookie.name);
                            fetchClientCookies();
                          }}
                          className="rounded-lg border border-white/10 p-1.5 text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete this cookie"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Consent Preference Toggles */}
      <GlassCard padding="lg" className="border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-accent-soft" />
            <h4 className="text-sm font-semibold text-white">Your Cookie Consent Preferences</h4>
          </div>
          {savedNotice && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 animate-fade-up">
              <CheckCircle2 className="h-3.5 w-3.5" /> Preferences saved
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Strictly Necessary */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Strictly Necessary</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
                <Lock className="h-3 w-3" /> Always Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Essential for cryptographic admin auth, CSRF defenses, and consent tracking. Cannot be disabled.
            </p>
          </div>

          {/* Functional */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Functional</span>
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
              Stores UI dark/light mode preference and 24-hour project upvote deduplication tokens.
            </p>
          </div>

          {/* Analytics */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Analytics</span>
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
              Anonymous pageview counting. Zero Google/Meta advertising trackers or personal fingerprinting.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setAnalyticsAllowed(true);
              setFunctionalAllowed(true);
              setCookieConsent({ analytics: true, functional: true });
              setSavedNotice(true);
              setTimeout(() => setSavedNotice(false), 3000);
            }}
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
      </GlassCard>
    </div>
  );
}
