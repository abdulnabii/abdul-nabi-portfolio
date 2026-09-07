import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { CookieInspector } from "@/components/cookies/cookie-inspector";
import {
  Cookie,
  ShieldCheck,
  Lock,
  Sliders,
  Settings,
  ArrowLeft,
  ExternalLink,
  Info,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy & Live Cookie Inspector",
  description:
    "Official Cookie Policy and real-time cookie inspection tool for aiwithab.site. Learn about our minimal, privacy-first cookie policy with zero third-party advertising cookies.",
  alternates: {
    canonical: "https://www.aiwithab.site/cookies",
  },
  openGraph: {
    title: "Cookie Policy & Live Cookie Inspector · Abdul Nabi",
    description:
      "Inspect real browser cookies, manage consent preferences, and review technical cookie documentation for aiwithab.site.",
    url: "https://www.aiwithab.site/cookies",
  },
};

export default function CookiesPage() {
  const lastUpdated = "September 2026";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Cookie Policy & Live Cookie Inspector — Abdul Nabi",
    url: "https://www.aiwithab.site/cookies",
    description: "Official Cookie Policy and real-time cookie inspection tool for aiwithab.site.",
    publisher: {
      "@type": "Person",
      name: "Abdul Nabi",
      url: "https://www.aiwithab.site",
    },
    dateModified: "2026-09-07",
  };

  return (
    <div className="section-padding pt-28 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-narrow space-y-10">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Hero Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="accent" className="gap-1.5">
              <Cookie className="h-3.5 w-3.5 text-accent-soft" />
              Cookie Policy & Real-Time Inspector
            </Badge>
            <span className="text-xs text-slate-500 font-mono">
              Last Updated: {lastUpdated}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Cookie Policy
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
            This portfolio operates under a strict privacy-first architecture. We do not use third-party advertising
            networks, cross-site behavioral tracking scripts, or data brokers. Below, you can inspect and control all
            active cookies in real time.
          </p>
        </div>

        {/* Cookie Preferences Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sliders className="h-5 w-5 text-accent-soft" />
              Cookie Preferences & Consent Controls
            </h2>
          </div>

          <p className="text-sm text-slate-400">
            Control which cookies are permitted on your device below. Changes take effect immediately.
          </p>

          <CookieInspector embedded={false} />
        </section>

        {/* Educational Breakdown */}
        <div className="space-y-8 pt-4">
          {/* Section 1: What Are Cookies */}
          <GlassCard padding="lg" className="space-y-4 border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-semibold text-slate-300">
                01
              </span>
              <h2 className="text-lg font-bold text-white">What Are Cookies & Local Storage?</h2>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3">
              <p>
                Cookies are small text files placed on your device by websites you visit. They are widely used by web developers
                to make websites function securely, remember preferences across page transitions, and provide minimal diagnostic telemetry.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 pt-1 text-xs">
                <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] space-y-1.5">
                  <strong className="text-white block">Session vs. Persistent Cookies</strong>
                  <p className="text-slate-400 leading-relaxed">
                    <strong>Session cookies</strong> exist only while your browser tab remains open and are deleted immediately upon closing.
                    <strong> Persistent cookies</strong> remain on your device for a pre-determined duration (e.g., 365 days for consent memory).
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] space-y-1.5">
                  <strong className="text-white block">First-Party vs. Third-Party</strong>
                  <p className="text-slate-400 leading-relaxed">
                    <strong>First-party cookies</strong> are created directly by <code>aiwithab.site</code>.
                    <strong> Third-party cookies</strong> are created by outside tracking networks. <em>We do not use any third-party ad cookies.</em>
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Section 2: Comprehensive Table of Cookies Used on aiwithab.site */}
          <GlassCard padding="lg" className="space-y-4 border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-semibold text-slate-300">
                02
              </span>
              <h2 className="text-lg font-bold text-white">Cookies & Storage Inventory on aiwithab.site</h2>
            </div>

            <p className="text-xs text-slate-400">
              Complete technical inventory of every storage identifier utilized across our domains and routes:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2.5 pr-4 font-semibold">Name / Key</th>
                    <th className="py-2.5 px-4 font-semibold">Category</th>
                    <th className="py-2.5 px-4 font-semibold">Type</th>
                    <th className="py-2.5 px-4 font-semibold">Duration</th>
                    <th className="py-2.5 pl-4 font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-emerald-400">an_cookie_consent</td>
                    <td className="py-3 px-4 font-sans"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] border border-emerald-500/20">Essential</span></td>
                    <td className="py-3 px-4">HTTP Cookie</td>
                    <td className="py-3 px-4">365 Days</td>
                    <td className="py-3 pl-4 font-sans text-slate-400">Remembers user privacy choices to avoid nagging cookie prompts.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-emerald-400">an_admin_session</td>
                    <td className="py-3 px-4 font-sans"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] border border-emerald-500/20">Essential</span></td>
                    <td className="py-3 px-4">HttpOnly Cookie</td>
                    <td className="py-3 px-4">7 Days</td>
                    <td className="py-3 pl-4 font-sans text-slate-400">Cryptographically signed HMAC token for administrative console authorization.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-blue-400">app_theme</td>
                    <td className="py-3 px-4 font-sans"><span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 text-[10px] border border-blue-500/20">Functional</span></td>
                    <td className="py-3 px-4">localStorage</td>
                    <td className="py-3 px-4">Persistent</td>
                    <td className="py-3 pl-4 font-sans text-slate-400">Stores selected UI theme (Dark mode or Light mode) to prevent flashing.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-blue-400">liked_[project_id]</td>
                    <td className="py-3 px-4 font-sans"><span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 text-[10px] border border-blue-500/20">Functional</span></td>
                    <td className="py-3 px-4">HTTP Cookie</td>
                    <td className="py-3 px-4">24 Hours</td>
                    <td className="py-3 pl-4 font-sans text-slate-400">Prevents repeated duplicate vote submissions on project appreciation buttons.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-purple-400">an_session_id</td>
                    <td className="py-3 px-4 font-sans"><span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[10px] border border-purple-500/20">Analytics</span></td>
                    <td className="py-3 px-4">sessionStorage</td>
                    <td className="py-3 px-4">Session</td>
                    <td className="py-3 pl-4 font-sans text-slate-400">Random anonymous token to aggregate page view counters without personal data.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-purple-400">visited_[path]</td>
                    <td className="py-3 px-4 font-sans"><span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[10px] border border-purple-500/20">Analytics</span></td>
                    <td className="py-3 px-4">sessionStorage</td>
                    <td className="py-3 pl-4 font-sans text-slate-400">Deduplicates page visit counts within the same browsing session.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Section 3: Browser Management */}
          <GlassCard padding="lg" className="space-y-4 border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-semibold text-slate-300">
                03
              </span>
              <h2 className="text-lg font-bold text-white">How to Control Cookies in Your Browser</h2>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3">
              <p>
                In addition to our interactive controls at the top of this page, all major web browsers allow you to review,
                block, or delete cookies globally through their settings menu:
              </p>
              <div className="grid gap-2 sm:grid-cols-2 pt-1 text-xs">
                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <strong className="text-white block mb-1">Google Chrome</strong>
                  <span className="text-slate-400">Settings → Privacy and security → Third-party cookies → Clear browsing data.</span>
                </div>
                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <strong className="text-white block mb-1">Mozilla Firefox</strong>
                  <span className="text-slate-400">Settings → Privacy & Security → Enhanced Tracking Protection & Cookies.</span>
                </div>
                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <strong className="text-white block mb-1">Apple Safari</strong>
                  <span className="text-slate-400">Preferences → Privacy → Prevent cross-site tracking & Block all cookies.</span>
                </div>
                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <strong className="text-white block mb-1">Microsoft Edge</strong>
                  <span className="text-slate-400">Settings → Cookies and site permissions → Manage and delete cookies.</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Section 4: Contact */}
          <GlassCard padding="lg" className="space-y-3 border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-semibold text-slate-300">
                04
              </span>
              <h2 className="text-lg font-bold text-white">Questions & Assistance</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              If you have any questions about our cookie implementation or notice an uncategorized cookie, feel free to contact
              Abdul Nabi directly at{" "}
              <a href="mailto:abdulnabi.khaskhely@gmail.com" className="text-accent-soft hover:underline">
                abdulnabi.khaskhely@gmail.com
              </a>
              .
            </p>
          </GlassCard>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">
            ← Home
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>·</span>
            <Link href="/#contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
