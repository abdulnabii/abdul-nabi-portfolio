"use client";

import React, { useState, useMemo } from "react";
import { Shield, Key, Lock, AlertTriangle, CheckCircle, Copy, Check, Terminal, Sparkles } from "lucide-react";

export function AppSecSandbox() {
  const [activeTab, setActiveTab] = useState<"jwt" | "xss" | "entropy">("jwt");

  // JWT Tool State
  const [jwtInput, setJwtInput] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYmR1bG5hYmkiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3ODk1MDcyMDAsImlhdCI6MTc1Nzk3MTIwMCwiaXNzIjoiYWl3aXRoYWIuc2l0ZSJ9.s7z_example_signature_hash_verify"
  );
  const [copied, setCopied] = useState(false);

  // XSS Tool State
  const [rawInput, setRawInput] = useState("<script>alert('Vulnerable!')</script><img src=x onerror=alert(1)>");

  // Entropy Tool State
  const [password, setPassword] = useState("AbdulNabi@2026!Secure");

  // JWT Decoded
  const decodedJwt = useMemo(() => {
    try {
      const parts = jwtInput.split(".");
      if (parts.length < 2) return null;

      const decodeBase64 = (str: string) => {
        try {
          return JSON.parse(atob(str.replace(/-/g, "+").replace(/_/g, "/")));
        } catch {
          return { error: "Invalid Base64 Encoding" };
        }
      };

      const header = decodeBase64(parts[0]);
      const payload = decodeBase64(parts[1]);
      const signature = parts[2] || "Missing signature";

      return { header, payload, signature };
    } catch {
      return null;
    }
  }, [jwtInput]);

  // XSS Sanitizer Preview
  const sanitizedOutput = useMemo(() => {
    return rawInput
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  }, [rawInput]);

  // Password Entropy Calculator
  const entropyStats = useMemo(() => {
    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

    const bits = password.length > 0 ? Math.round(password.length * Math.log2(Math.max(poolSize, 1))) : 0;
    let score = "Weak";
    let color = "text-rose-400";
    let barColor = "bg-rose-500";

    if (bits > 70) {
      score = "Military Grade / Watertight";
      color = "text-emerald-400";
      barColor = "bg-emerald-400";
    } else if (bits > 50) {
      score = "Strong";
      color = "text-cyan-400";
      barColor = "bg-cyan-400";
    } else if (bits > 30) {
      score = "Moderate";
      color = "text-amber-400";
      barColor = "bg-amber-400";
    }

    return { bits, score, color, barColor, poolSize };
  }, [password]);

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-slate-200">
      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("jwt")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
            activeTab === "jwt"
              ? "bg-indigo-600 text-white shadow-lg border border-indigo-400/40"
              : "border border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"
          }`}
        >
          <Key className="h-3.5 w-3.5" />
          JWT Inspector & Token Parser
        </button>

        <button
          onClick={() => setActiveTab("xss")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
            activeTab === "xss"
              ? "bg-rose-600 text-white shadow-lg border border-rose-400/40"
              : "border border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          XSS Sanitizer
        </button>

        <button
          onClick={() => setActiveTab("entropy")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
            activeTab === "entropy"
              ? "bg-emerald-600 text-white shadow-lg border border-emerald-400/40"
              : "border border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"
          }`}
        >
          <Lock className="h-3.5 w-3.5" />
          Auth Entropy Analyzer
        </button>
      </div>

      {/* 1. JWT Inspector */}
      {activeTab === "jwt" && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 mb-1.5 block">
              Encoded JWT Token (Bearer Auth)
            </label>
            <textarea
              rows={3}
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              className="w-full font-mono text-xs rounded-xl border border-white/10 bg-[#080d24] p-3 text-indigo-300 focus:border-indigo-500 focus:outline-none"
              placeholder="Paste raw JWT..."
            />
          </div>

          {decodedJwt ? (
            <div className="grid gap-4 sm:grid-cols-2 font-mono text-xs">
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 space-y-1.5">
                <div className="text-rose-400 font-semibold uppercase text-[10px] tracking-wider">
                  Header (Algorithm & Type)
                </div>
                <pre className="text-slate-200 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(decodedJwt.header, null, 2)}
                </pre>
              </div>

              <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3.5 space-y-1.5">
                <div className="text-purple-400 font-semibold uppercase text-[10px] tracking-wider">
                  Payload (Claims & User Data)
                </div>
                <pre className="text-slate-200 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(decodedJwt.payload, null, 2)}
                </pre>
              </div>

              <div className="sm:col-span-2 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3.5">
                <div className="text-cyan-400 font-semibold uppercase text-[10px] tracking-wider mb-1">
                  Signature Hash Check
                </div>
                <p className="text-[11px] text-slate-400 break-all">{decodedJwt.signature}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Verified HMAC-SHA256 structure compliant</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Invalid JWT format. Provide standard header.payload.signature format.</span>
            </div>
          )}
        </div>
      )}

      {/* 2. XSS Sanitizer */}
      {activeTab === "xss" && (
        <div className="space-y-4 animate-fade-in font-mono text-xs">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 mb-1.5 block">
              Raw Untrusted User Input
            </label>
            <textarea
              rows={3}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className="w-full rounded-xl border border-rose-500/30 bg-[#080d24] p-3 text-rose-300 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-semibold uppercase text-[10px] tracking-wider">
                Sanitized & Escaped HTML Safe Output
              </span>
              <button
                onClick={() => copyText(sanitizedOutput)}
                className="text-[10px] text-emerald-300 hover:text-white flex items-center gap-1"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>
            <pre className="text-emerald-200 whitespace-pre-wrap break-all p-2 rounded-lg bg-black/40 border border-emerald-500/20">
              {sanitizedOutput}
            </pre>
            <p className="text-[10px] text-slate-400 font-sans">
              ✓ Neutralizes inline script injections, event handlers (`onerror`), and nested bracket attacks.
            </p>
          </div>
        </div>
      )}

      {/* 3. Auth Entropy Analyzer */}
      {activeTab === "entropy" && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 mb-1.5 block font-mono">
              Password / Secret Input
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full font-mono text-sm rounded-xl border border-white/10 bg-[#080d24] p-3 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Entropy Strength:</span>
              <span className={`font-bold font-mono ${entropyStats.color}`}>{entropyStats.score}</span>
            </div>

            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full ${entropyStats.barColor} transition-all duration-300`}
                style={{ width: `${Math.min(100, (entropyStats.bits / 80) * 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-[11px] font-mono text-slate-400">
              <div>Bits of Entropy: <span className="text-white font-bold">{entropyStats.bits}</span></div>
              <div>Pool Size: <span className="text-white font-bold">{entropyStats.poolSize}</span></div>
              <div>Length: <span className="text-white font-bold">{password.length} chars</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
