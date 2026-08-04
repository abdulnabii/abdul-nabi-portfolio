"use client";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck, Database, Key, Play, Terminal, UserCheck } from "lucide-react";
import { useState } from "react";

interface DBRow {
  tenant: string;
  metric: string;
  value: string;
}

const mockDatabase: Record<string, Record<string, DBRow[]>> = {
  "tenant-a": {
    metrics: [
      { tenant: "Tenant A", metric: "Monthly Active Users", value: "14,820" },
      { tenant: "Tenant A", metric: "API Cost (Current Month)", value: "$182.40" },
      { tenant: "Tenant A", metric: "User Retention Rate", value: "84.2%" },
    ],
    billing: [
      { tenant: "Tenant A", metric: "Current Plan", value: "Enterprise Pro" },
      { tenant: "Tenant A", metric: "Next Invoice Date", value: "2026-08-01" },
    ],
  },
  "tenant-b": {
    metrics: [
      { tenant: "Tenant B", metric: "Monthly Active Users", value: "3,110" },
      { tenant: "Tenant B", metric: "API Cost (Current Month)", value: "$41.50" },
      { tenant: "Tenant B", metric: "User Retention Rate", value: "91.8%" },
    ],
    billing: [
      { tenant: "Tenant B", metric: "Current Plan", value: "Startup Tier" },
      { tenant: "Tenant B", metric: "Next Invoice Date", value: "2026-08-05" },
    ],
  },
};

export function AuroraDemo() {
  const [tokenRole, setTokenRole] = useState<"guest" | "tenant-a-user" | "tenant-a-admin" | "tenant-b-user">("guest");
  const [targetTable, setTargetTable] = useState<"metrics" | "billing">("metrics");
  const [crossTenantAttempt, setCrossTenantAttempt] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "System: DB connection initialized.",
    "System: Awaiting JWT authorization payload...",
  ]);
  const [queryResult, setQueryResult] = useState<DBRow[] | null>(null);
  const [queryStatus, setQueryStatus] = useState<"idle" | "success" | "blocked">("idle");
  const [loading, setLoading] = useState(false);

  function handleReset() {
    setTokenRole("guest");
    setTargetTable("metrics");
    setCrossTenantAttempt(false);
    setConsoleLogs([
      "System: DB connection initialized.",
      "System: Awaiting JWT authorization payload...",
    ]);
    setQueryResult(null);
    setQueryStatus("idle");
  }

  function runQuery() {
    setLoading(true);
    setQueryStatus("idle");

    setTimeout(() => {
      const logs: string[] = [];
      const timestamp = new Date().toLocaleTimeString();
      
      logs.push(`[${timestamp}] [SQL] Initializing query SELECT * FROM ${targetTable === "metrics" ? "organization_metrics" : "billing_records"};`);

      // Verify JWT Session
      if (tokenRole === "guest") {
        logs.push(`[${timestamp}] [AUTH] Evaluating JWT auth headers: NONE`);
        logs.push(`[${timestamp}] [RLS CHECK] Policy 'restrict_anonymous_access' evaluated: FAILED`);
        logs.push(`[${timestamp}] [SECURITY ALERT] 403 Forbidden. Anonymous queries are blocked by default.`);
        setConsoleLogs(logs);
        setQueryResult([]);
        setQueryStatus("blocked");
        setLoading(false);
        return;
      }

      const tenant = tokenRole.includes("tenant-a") ? "tenant-a" : "tenant-b";
      const role = tokenRole.includes("admin") ? "admin" : "member";
      
      logs.push(`[${timestamp}] [AUTH] Verified JWT signature. Claims decrypted: { tenant_id: '${tenant.toUpperCase()}', role: '${role}' }`);

      // Simulate cross-tenant exploitation injection attempt
      if (crossTenantAttempt) {
        logs.push(`[${timestamp}] [ATTEMPT] Injected filter bypass parameter: WHERE tenant_id = 'TENANT-${tenant === "tenant-a" ? "B" : "A"}'`);
        logs.push(`[${timestamp}] [RLS CHECK] RLS Policy 'select_tenant_isolation' triggered: tenant_id MUST EQUAL '${tenant.toUpperCase()}'`);
        logs.push(`[${timestamp}] [SECURITY ALERT] Exploit prevented: user attempted to access foreign tenant database rows.`);
        logs.push(`[${timestamp}] [SECURITY ALERT] Violation logged. System aborted transaction.`);
        setConsoleLogs(logs);
        setQueryResult([]);
        setQueryStatus("blocked");
        setLoading(false);
        return;
      }

      // Normal secure path
      logs.push(`[${timestamp}] [RLS CHECK] RLS Policy 'select_tenant_isolation' evaluated: PASSED`);
      logs.push(`[${timestamp}] [SUCCESS] Database returned rows matching tenant context: '${tenant.toUpperCase()}'`);
      
      const results = mockDatabase[tenant][targetTable] ?? [];
      setConsoleLogs(logs);
      setQueryResult(results);
      setQueryStatus("success");
      setLoading(false);
    }, 250);
  }

  return (
    <div className="relative w-full rounded-3xl border border-white/10 bg-[#050814]/80 p-1 shadow-glass-lg backdrop-blur-2xl overflow-hidden">
      
      {/* Simulation Header Indicators */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Database className="h-4.5 w-4.5 text-accent-soft" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Multi-Tenant RLS Simulator
          </h4>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            RLS Enforcement Active
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.25fr_1fr] min-h-[480px]">
        
        {/* Left Side: Simulation Controls */}
        <div className="flex flex-col border-r border-white/5 bg-[#070b18]/60 p-5 justify-between">
          <div className="space-y-5">
            
            {/* 1. JWT Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-indigo-400" />
                1. Select JWT Authorization Token
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "guest", label: "No Token (Guest)" },
                  { id: "tenant-a-user", label: "Tenant A (User)" },
                  { id: "tenant-a-admin", label: "Tenant A (Admin)" },
                  { id: "tenant-b-user", label: "Tenant B (User)" },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setTokenRole(role.id as any);
                      setCrossTenantAttempt(false);
                    }}
                    className={`rounded-xl border px-3 py-2 text-xs font-medium text-left transition ${
                      tokenRole === role.id
                        ? "border-accent bg-accent/10 text-white shadow-glow-sm"
                        : "border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Target Table Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-indigo-400" />
                2. Target Database Table
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "metrics", label: "organization_metrics" },
                  { id: "billing", label: "billing_records" },
                ].map((table) => (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => setTargetTable(table.id as any)}
                    className={`rounded-xl border px-3 py-2 text-xs font-mono transition ${
                      targetTable === table.id
                        ? "border-accent bg-accent/10 text-white shadow-glow-sm"
                        : "border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    {table.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Exploitation Attack Rig */}
            <div className="space-y-2.5 border-t border-white/5 pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tamper-rls"
                  disabled={tokenRole === "guest"}
                  checked={crossTenantAttempt}
                  onChange={(e) => setCrossTenantAttempt(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent disabled:opacity-30"
                />
                <label
                  htmlFor="tamper-rls"
                  className={`text-xs select-none cursor-pointer font-semibold uppercase tracking-wider ${
                    tokenRole === "guest" ? "text-slate-600" : "text-amber-400"
                  }`}
                >
                  Simulate SQL Cross-Tenant Parameter Injection
                </label>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Check this to simulate an attacker appending a foreign tenant parameter claim (e.g. attempting to query Tenant B data while logged in as Tenant A).
              </p>
            </div>

          </div>

          <div className="pt-5 border-t border-white/5">
            <Button
              onClick={runQuery}
              variant="primary"
              size="md"
              className="w-full flex items-center justify-center gap-2 cursor-grow"
            >
              <Play className="h-4 w-4" />
              Execute Query with DB RLS Policy Checks
            </Button>
          </div>
        </div>

        {/* Right Side: SQL Console & Result Feed */}
        <div className="p-4 flex flex-col justify-between bg-white/[0.01]">
          <div className="space-y-4">
            
            {/* Terminal Console */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Terminal className="h-3.5 w-3.5" />
                Auth & Database Event Log
              </h5>
              <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3 font-mono text-[10px] text-cyan-300 space-y-1.5 h-36 overflow-y-auto leading-relaxed scrollbar-thin">
                {consoleLogs.map((log, idx) => (
                  <p
                    key={idx}
                    className={
                      log.includes("ALERT")
                        ? "text-red-400 font-semibold"
                        : log.includes("SUCCESS")
                        ? "text-emerald-400 font-semibold"
                        : log.includes("SQL")
                        ? "text-white"
                        : "text-slate-400"
                    }
                  >
                    {log}
                  </p>
                ))}
              </div>
            </div>

            {/* Query result output */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5" />
                Query Returned Data Result
              </h5>
              
              {queryStatus === "idle" && (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-8 text-center text-slate-500 text-xs">
                  Run SQL query to retrieve active dataset.
                </div>
              )}

              {queryStatus === "blocked" && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center space-y-2">
                  <ShieldAlert className="mx-auto h-7 w-7 text-red-400" />
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Transaction Blocked</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Database level Row-Level Security policy aborted transaction. Zero rows returned. Cross-tenant leakage prevented.
                  </p>
                </div>
              )}

              {queryStatus === "success" && queryResult && (
                <div className="rounded-xl border border-white/10 bg-slate-950/50 overflow-hidden text-xs">
                  <table className="w-full text-left font-mono">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-slate-400 text-[10px] uppercase">
                        <th className="px-3 py-2">Tenant</th>
                        <th className="px-3 py-2">Metric Label</th>
                        <th className="px-3 py-2 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      {queryResult.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="px-3 py-2 font-semibold text-accent-soft">{row.tenant}</td>
                          <td className="px-3 py-2">{row.metric}</td>
                          <td className="px-3 py-2 text-right font-bold text-white">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          <div className="pt-3 border-t border-white/5 text-[10px] text-slate-500 flex justify-between items-center">
            <span>Isolation Policy: active</span>
            <span>Auth Source: Supabase JWT auth.uid()</span>
          </div>
        </div>

      </div>
    </div>
  );
}
