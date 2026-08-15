"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Layers, ShieldCheck, Cpu, Share2, Check, Copy, ExternalLink, Zap } from "lucide-react";
import { playTactileClick } from "@/components/effects/sound-effects";

interface ProjectDeepDiveProps {
  project: {
    id: string;
    title: string;
    description: string;
    architecture?: string;
    implementation?: string;
    challenges?: string;
    outcome?: string;
    tags?: string[];
  };
}

export function ProjectDeepDive({ project }: ProjectDeepDiveProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"architecture" | "security" | "metrics">("architecture");

  const copyShareLink = () => {
    playTactileClick("pop");
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-10 space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              playTactileClick("subtle");
              setActiveTab("architecture");
            }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "architecture"
                ? "bg-indigo-600 text-white shadow-lg border border-indigo-400/40"
                : "border border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            System Architecture
          </button>

          <button
            onClick={() => {
              playTactileClick("subtle");
              setActiveTab("security");
            }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "security"
                ? "bg-indigo-600 text-white shadow-lg border border-indigo-400/40"
                : "border border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Security & Defense Hardening
          </button>

          <button
            onClick={() => {
              playTactileClick("subtle");
              setActiveTab("metrics");
            }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "metrics"
                ? "bg-indigo-600 text-white shadow-lg border border-indigo-400/40"
                : "border border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Performance & Trade-offs
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={copyShareLink}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
          <span>{copied ? "Link Copied!" : "Share Project"}</span>
        </button>
      </div>

      {/* Tab Content */}
      <GlassCard padding="lg" className="p-6 sm:p-8">
        {activeTab === "architecture" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              Technical Architecture & Pipeline
            </h3>
            <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
              {project.architecture ||
                `${project.title} is designed with a decoupled Next.js App Router frontend, stateless edge API endpoints, and a PostgreSQL database layer managed through Supabase with Row Level Security.`}
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-[#060a1c] p-4 sm:p-5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Data Flow Diagram
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-center">
                <div className="w-full sm:w-1/3 rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-3">
                  <div className="text-indigo-300 font-bold">Client Layer</div>
                  <div className="text-[10px] text-slate-400 mt-1">Next.js 14 · Tailwind CSS</div>
                </div>
                <div className="text-slate-500 font-bold">➔</div>
                <div className="w-full sm:w-1/3 rounded-xl border border-purple-500/30 bg-purple-950/40 p-3">
                  <div className="text-purple-300 font-bold">API / Engine</div>
                  <div className="text-[10px] text-slate-400 mt-1">REST API · RBAC Auth</div>
                </div>
                <div className="text-slate-500 font-bold">➔</div>
                <div className="w-full sm:w-1/3 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3">
                  <div className="text-emerald-300 font-bold">Data Store</div>
                  <div className="text-[10px] text-slate-400 mt-1">PostgreSQL · RLS Rules</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              AppSec Implementation & Protection
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-1.5">
                <div className="text-xs font-semibold text-emerald-300">Row Level Security (RLS)</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Strict tenant isolation ensuring users can only read and modify records tagged to their verified authentication token.
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-1.5">
                <div className="text-xs font-semibold text-indigo-300">Input Sanitization & CSRF</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Parameter validation and escaping preventing SQL injections and Cross-Site Scripting (XSS) in all write pipelines.
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-1.5">
                <div className="text-xs font-semibold text-purple-300">Stateless JWT Auth</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cryptographically verified JSON Web Tokens with expiry enforcement and secure HttpOnly cookie storage.
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-1.5">
                <div className="text-xs font-semibold text-cyan-300">Zero Trust Secrets</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Strict environment variable isolation separating client keys from backend service-role database credentials.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "metrics" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              Performance Benchmarks & Key Challenges
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">
              {project.challenges ||
                "Engineered for sub-100ms response latencies, clean client-side state hydration, and responsive layout across all device viewports."}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Lighthouse Perf</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">98/100</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
                <div className="text-[10px] text-slate-400 uppercase">First Contentful</div>
                <div className="text-lg font-bold text-cyan-400 font-mono">&lt;0.8s</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Bundle Footprint</div>
                <div className="text-lg font-bold text-indigo-300 font-mono">&lt;120 KB</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Type Safety</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">100% TS</div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
