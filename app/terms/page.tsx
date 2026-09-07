import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Shield,
  Code2,
  AlertTriangle,
  Scale,
  ArrowLeft,
  Mail,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for aiwithab.site — Abdul Nabi's personal portfolio, engineering projects, open-source codebases, and interactive developer tools.",
  alternates: {
    canonical: "https://www.aiwithab.site/terms",
  },
  openGraph: {
    title: "Terms of Service · Abdul Nabi",
    description:
      "Review the Terms of Service and acceptable use conditions for aiwithab.site and associated developer labs.",
    url: "https://www.aiwithab.site/terms",
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = "September 2026";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service — Abdul Nabi",
    url: "https://www.aiwithab.site/terms",
    description: "Official Terms of Service and Acceptable Use Policy for aiwithab.site.",
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
              <Scale className="h-3.5 w-3.5 text-accent-soft" />
              Legal Terms & Developer Guidelines
            </Badge>
            <span className="text-xs text-slate-500 font-mono">
              Last Updated: {lastUpdated}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Terms of Service
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
            Welcome to <strong className="text-slate-200">aiwithab.site</strong>. By accessing this website,
            interactive developer labs, or open-source software demonstrations, you agree to comply with and be
            bound by the following terms.
          </p>
        </div>

        {/* Highlights Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <GlassCard padding="md" className="space-y-2 border-white/10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent-soft border border-accent/20">
              <Code2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Open Source & Licensing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open-source repositories on GitHub follow their respective MIT or Apache licenses.
            </p>
          </GlassCard>

          <GlassCard padding="md" className="space-y-2 border-white/10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Ethical Security Use</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Security sandboxes are for educational purposes. Unauthorized attack vectors against production are forbidden.
            </p>
          </GlassCard>

          <GlassCard padding="md" className="space-y-2 border-white/10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">No Warranty (&quot;As-Is&quot;)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive demos and code samples are provided for demonstration without commercial guarantees.
            </p>
          </GlassCard>
        </div>

        {/* Detailed Terms Sections */}
        <div className="space-y-8 pt-4">
          {/* Section 1 */}
          <GlassCard padding="lg" className="space-y-4 border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-semibold text-slate-300">
                01
              </span>
              <h2 className="text-lg font-bold text-white">Acceptance of Agreement</h2>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3">
              <p>
                By visiting, browsing, or utilizing the interactive tools on <strong>aiwithab.site</strong>, you
                confirm that you are at least 13 years of age and agree to be bound by these Terms of Service,
                our <Link href="/privacy" className="text-accent-soft hover:underline">Privacy Policy</Link>.
              </p>
              <p>
                If you do not agree to these terms, please discontinue using this website immediately.
              </p>
            </div>
          </GlassCard>

          {/* Section 2 */}
          <GlassCard padding="lg" className="space-y-4 border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-semibold text-slate-300">
                02
              </span>
              <h2 className="text-lg font-bold text-white">Intellectual Property & Code Usage</h2>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3">
              <p>
                This website showcases engineering systems, technical articles, and open-source software engineered by
                <strong> Abdul Nabi</strong>.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-400">
                <li>
                  <strong className="text-slate-200">Open-Source Code:</strong> Repositories linked to my GitHub
                  profile (<a href="https://github.com/abdulnabii" target="_blank" rel="noopener noreferrer" className="text-accent-soft hover:underline">github.com/abdulnabii</a>)
                  are governed by the explicit open-source license provided in each repository (typically the MIT License). You are free to inspect, fork, and learn from these implementations in accordance with those terms.
                </li>
                <li>
                  <strong className="text-slate-200">Original Content & Branding:</strong> The design, typography, brand assets,
                  curated articles, case study text, and custom visual components of <code>aiwithab.site</code> are the intellectual property
                  of Abdul Nabi and may not be duplicated, mirrored, or scraped for commercial syndication without prior written permission.
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
              <h2 className="text-lg font-bold text-white">Interactive Developer Labs & Mini Projects</h2>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3">
              <p>
                This portfolio features interactive demonstration environments, including the <em>Aegis AppSec Sentinel</em> vulnerability
                simulator and 30 AI Mini Projects. You acknowledge and agree that:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>Demonstrations run in sandboxed, in-memory environments designed solely for educational review and portfolio evaluation.</li>
                <li>Inputs provided to mini projects or API demos may be processed by AI inference providers (OpenAI or Google Gemini). Do not input sensitive credentials or proprietary enterprise secrets into demo forms.</li>
                <li>Interactive tools may be modified, rate-limited, or retired at any time without notice.</li>
              </ul>
            </div>
          </GlassCard>

          {/* Section 4 */}
          <GlassCard padding="lg" className="space-y-4 border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-semibold text-slate-300">
                04
              </span>
              <h2 className="text-lg font-bold text-white">Acceptable Use & Security Testing Rules</h2>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3">
              <p>
                As an Application Security professional, I encourage responsible security research. However, you strictly agree NOT to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>Perform automated Denial-of-Service (DoS/DDoS) stress tests or volume attacks against <code>aiwithab.site</code> or its hosting infrastructure.</li>
                <li>Attempt unauthorized brute-force attacks against administrative authentication endpoints (<code>/admin/*</code>).</li>
                <li>Scrape user contact submissions, attempt database privilege escalation, or tamper with third-party service credentials.</li>
                <li>Submit abusive, defamatory, or unlawful material through the contact form or chatbot interface.</li>
              </ul>
              <p className="text-xs text-slate-400 pt-1">
                If you discover a legitimate security vulnerability or configuration flaw, please report it responsibly to{" "}
                <a href="mailto:abdulnabi.khaskhely@gmail.com" className="text-accent-soft hover:underline">
                  abdulnabi.khaskhely@gmail.com
                </a>
                . Responsible disclosures will be acknowledged promptly and gratefully.
              </p>
            </div>
          </GlassCard>

          {/* Section 5 */}
          <GlassCard padding="lg" className="space-y-4 border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-semibold text-slate-300">
                05
              </span>
              <h2 className="text-lg font-bold text-white">Disclaimer of Warranties</h2>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3">
              <p className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                Provided &quot;As-Is&quot; Without Express or Implied Warranty
              </p>
              <p>
                All materials, software demonstrations, code samples, ML models (including the Blood Sugar Tracker FYP),
                and articles published on this site are provided for informational and portfolio review purposes only.
              </p>
              <p>
                Healthcare-related applications (e.g. Diabetes Risk Predictors) are research and educational prototypes
                and must <strong>never</strong> be used as professional medical advice or clinical diagnostic instruments.
              </p>
            </div>
          </GlassCard>

          {/* Section 6 */}
          <GlassCard padding="lg" className="space-y-4 border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-semibold text-slate-300">
                06
              </span>
              <h2 className="text-lg font-bold text-white">Limitation of Liability</h2>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed space-y-2">
              <p>
                To the fullest extent permitted by applicable law, Abdul Nabi shall not be held liable for any direct,
                indirect, incidental, or consequential damages resulting from your use of, or inability to use, this site,
                its code samples, or third-party links.
              </p>
            </div>
          </GlassCard>

          {/* Section 7 */}
          <GlassCard padding="lg" className="space-y-3 border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-semibold text-slate-300">
                07
              </span>
              <h2 className="text-lg font-bold text-white">Governing Law & Inquiries</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              These terms shall be governed by and interpreted in accordance with the laws of Pakistan. For inquiries,
              licensing questions, or contract engineering discussions, reach out to{" "}
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
            <Link href="/#contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
