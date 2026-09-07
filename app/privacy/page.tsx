import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Lock,
  Eye,
  Server,
  UserCheck,
  FileText,
  Mail,
  ArrowLeft,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for aiwithab.site — Abdul Nabi's personal portfolio, developer tools, and blog. Complete transparency regarding cookies, data protection, GDPR rights, and data handling.",
  alternates: {
    canonical: "https://www.aiwithab.site/privacy",
  },
  openGraph: {
    title: "Privacy Policy · Abdul Nabi",
    description:
      "Full transparency on data protection, cookies, GDPR rights, and telemetry practices across aiwithab.site.",
    url: "https://www.aiwithab.site/privacy",
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "September 2026";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy — Abdul Nabi",
    url: "https://www.aiwithab.site/privacy",
    description: "Official Privacy Policy and Data Handling statement for aiwithab.site.",
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
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Privacy & Data Transparency
            </Badge>
            <span className="text-xs text-slate-500 font-mono">
              Last Updated: {lastUpdated}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Privacy Policy
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
            I believe privacy is an engineering requirement, not an afterthought. This policy provides complete
            transparency into how data is collected, stored, and protected across{" "}
            <strong className="text-slate-200">aiwithab.site</strong>.
          </p>
        </div>

        {/* Quick Summary Highlights Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <GlassCard padding="md" className="space-y-2 border-white/10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Zero Ad Trackers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No Google Ads, Meta Pixel, or commercial tracking beacons are loaded on this website.
            </p>
          </GlassCard>

          <GlassCard padding="md" className="space-y-2 border-white/10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Lock className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Cryptographic Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Admin sessions utilize HMAC-SHA256 signatures with timing-safe validation.
            </p>
          </GlassCard>

          <GlassCard padding="md" className="space-y-2 border-white/10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Server className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Data Minimization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Contact messages are stored securely in Supabase and accessed exclusively to reply.
            </p>
          </GlassCard>

          <GlassCard padding="md" className="space-y-2 border-white/10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent-soft border border-accent/20">
              <UserCheck className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">GDPR & CCPA Rights</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You have the right to inspect, export, or permanently erase your data upon request.
            </p>
          </GlassCard>
        </div>


        {/* Detailed Legal Sections */}
        <div className="space-y-8 pt-4">
          {/* Section 1 */}
          <GlassCard padding="lg" className="space-y-4 border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-semibold text-slate-300">
                01
              </span>
              <h2 className="text-lg font-bold text-white">Data Controller & Contact Information</h2>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3">
              <p>
                The data controller for this website is <strong>Abdul Nabi</strong>, based in Karachi, Sindh, Pakistan.
              </p>
              <p>
                If you have questions about this privacy statement, wish to exercise your data rights, or want
                any submitted contact data deleted from the database, please contact me directly:
              </p>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs font-mono space-y-1.5 text-slate-300">
                <p>Email: <a href="mailto:abdulnabi.khaskhely@gmail.com" className="text-accent-soft hover:underline">abdulnabi.khaskhely@gmail.com</a></p>
                <p>Domain: <span className="text-slate-400">https://www.aiwithab.site</span></p>
                <p>Location: <span className="text-slate-400">Karachi, Sindh, Pakistan</span></p>
              </div>
            </div>
          </GlassCard>

          {/* Section 2 */}
          <GlassCard padding="lg" className="space-y-4 border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-semibold text-slate-300">
                02
              </span>
              <h2 className="text-lg font-bold text-white">Information We Collect</h2>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3">
              <p>
                We adhere to strict data minimization. Depending on your interactions with the site, we may collect:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-400">
                <li>
                  <strong className="text-slate-200">Contact Inquiries:</strong> When you submit a message via the
                  contact form, we receive your name, email address, message body, and timestamp. This data is
                  stored securely in our Supabase PostgreSQL database to facilitate direct replies.
                </li>
                <li>
                  <strong className="text-slate-200">Anonymous Telemetry:</strong> We collect aggregate, non-identifying
                  page visits and primary button click counts (e.g. &quot;View Case Study&quot; clicks). This telemetry does
                  not track your IP address, browser fingerprint, or geographic identity.
                </li>
                <li>
                  <strong className="text-slate-200">AI Chatbot Conversations:</strong> Queries submitted to the
                  on-site AI Assistant are processed ephemerally to generate real-time answers about projects and experience.
                  Conversations are not linked to your identity or sold.
                </li>
                <li>
                  <strong className="text-slate-200">Local Browser Storage & Cookies:</strong> Visual theme preference
                  (Dark/Light) and project upvote deduplication tokens stored locally in your browser.
                </li>
              </ul>
            </div>
          </GlassCard>

          {/* Section 3 */}
          <GlassCard padding="lg" className="space-y-4 border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-semibold text-slate-300">
                03
              </span>
              <h2 className="text-lg font-bold text-white">Third-Party Service Processors</h2>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3">
              <p>
                This site integrates with verified, enterprise-grade cloud infrastructure providers to deliver high availability and security:
              </p>
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-1">
                  <span className="text-xs font-semibold text-white">Vercel Inc. (Hosting & Edge Functions)</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Provides global CDN delivery and serverless execution. Processes standard HTTP request logs.
                  </p>
                  <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent-soft hover:underline inline-flex items-center gap-1">
                    Vercel Privacy Policy <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-1">
                  <span className="text-xs font-semibold text-white">Supabase Inc. (PostgreSQL Database)</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Hosts project data, blog articles, and encrypted contact submissions with Row Level Security (RLS).
                  </p>
                  <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent-soft hover:underline inline-flex items-center gap-1">
                    Supabase Privacy Policy <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-1">
                  <span className="text-xs font-semibold text-white">Cloudflare Inc. (DNS & DDoS Shield)</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Authoritative DNS management, SSL encryption, and malicious bot mitigation.
                  </p>
                  <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent-soft hover:underline inline-flex items-center gap-1">
                    Cloudflare Privacy Policy <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-1">
                  <span className="text-xs font-semibold text-white">OpenAI / Google Gemini (AI Inference)</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Powers conversational responses for the portfolio chatbot and mini project demonstrations.
                  </p>
                  <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent-soft hover:underline inline-flex items-center gap-1">
                    OpenAI Privacy Policy <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Section 4 */}
          <GlassCard padding="lg" className="space-y-4 border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-semibold text-slate-300">
                04
              </span>
              <h2 className="text-lg font-bold text-white">Data Security & Cryptographic Protection</h2>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3">
              <p>
                As an engineer specializing in Application Security (AppSec), defense-in-depth principles are applied across the entire site architecture:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>
                  <strong className="text-slate-200">Row Level Security (RLS):</strong> All Supabase database tables enforce RLS policies preventing unauthorized reads or data injection.
                </li>
                <li>
                  <strong className="text-slate-200">Timing-Safe Cryptography:</strong> Administrative authentication cookies are verified using HMAC-SHA256 signatures with constant-time string comparisons (<code className="text-xs bg-white/5 px-1 py-0.5 rounded">crypto.timingSafeEqual</code>).
                </li>
                <li>
                  <strong className="text-slate-200">End-to-End TLS:</strong> All traffic is encrypted in transit using TLS 1.3 with automated HSTS header enforcement.
                </li>
                <li>
                  <strong className="text-slate-200">Input Sanitization:</strong> Form inputs are strictly validated server-side to prevent Cross-Site Scripting (XSS) and SQL injection.
                </li>
              </ul>
            </div>
          </GlassCard>

          {/* Section 5 */}
          <GlassCard padding="lg" className="space-y-4 border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-semibold text-slate-300">
                05
              </span>
              <h2 className="text-lg font-bold text-white">Your Rights (GDPR & CCPA)</h2>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3">
              <p>
                Regardless of your geographic location, you are granted complete autonomy over your personal information:
              </p>
              <div className="grid gap-3 sm:grid-cols-2 pt-1 text-xs">
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <strong className="text-white block mb-1">Right of Access</strong>
                  <span className="text-slate-400">Request a complete copy of any messages or data submitted under your email.</span>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <strong className="text-white block mb-1">Right to Erasure (&quot;Right to be Forgotten&quot;)</strong>
                  <span className="text-slate-400">Request immediate permanent deletion of your contact submissions from Supabase.</span>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <strong className="text-white block mb-1">Right to Restrict & Opt-Out</strong>
                  <span className="text-slate-400">Disable anonymous analytics cookies at any time via the cookie inspector on this page.</span>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <strong className="text-white block mb-1">No Data Sale</strong>
                  <span className="text-slate-400">Your information has never been sold or monetized, and will never be.</span>
                </div>
              </div>
              <p className="pt-2 text-xs text-slate-400">
                To submit an erasure or access request, email{" "}
                <a href="mailto:abdulnabi.khaskhely@gmail.com" className="text-accent-soft hover:underline">
                  abdulnabi.khaskhely@gmail.com
                </a>
                . All verified requests are executed within 48 hours.
              </p>
            </div>
          </GlassCard>

          {/* Section 6 */}
          <GlassCard padding="lg" className="space-y-4 border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-semibold text-slate-300">
                06
              </span>
              <h2 className="text-lg font-bold text-white">Changes to This Policy</h2>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed space-y-2">
              <p>
                As new engineering case studies, developer tools, and features are introduced to this portfolio,
                this policy may be updated. Changes will be reflected with an updated &quot;Last Modified&quot; timestamp
                at the top of this document.
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">
            ← Home
          </Link>
          <div className="flex items-center gap-4">
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
