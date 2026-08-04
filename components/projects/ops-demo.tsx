"use client";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle, Database, RefreshCw, Server, ShieldCheck, Terminal } from "lucide-react";
import { useState } from "react";

interface ServiceState {
  name: string;
  status: "online" | "degraded" | "offline";
  latency: number;
}

interface LogEntry {
  timestamp: string;
  service: string;
  fromState: string;
  toState: string;
  reason: string;
}

export function OpsDemo() {
  const [services, setServices] = useState<ServiceState[]>([
    { name: "API Edge Gateway", status: "online", latency: 24 },
    { name: "Auth Microservice", status: "online", latency: 42 },
    { name: "CDN Edge Cache", status: "online", latency: 12 },
    { name: "Telemetry Database", status: "online", latency: 8 },
  ]);

  const [dbWrites, setDbWrites] = useState(4); // Writes logged so far
  const [totalChecks, setTotalChecks] = useState(240); // Simulated status polling checks
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: "11:20:10", service: "Auth Microservice", fromState: "offline", toState: "online", reason: "System recovery complete." },
    { timestamp: "11:05:32", service: "CDN Edge Cache", fromState: "degraded", toState: "online", reason: "Bypass rules updated." },
    { timestamp: "11:02:15", service: "CDN Edge Cache", fromState: "online", toState: "degraded", reason: "Cache invalidation spike." },
    { timestamp: "10:42:00", service: "Auth Microservice", fromState: "online", toState: "offline", reason: "Database connection timeout." },
  ]);

  function triggerIncident() {
    // Transition CDN Edge Cache to Degraded
    const targetService = "CDN Edge Cache";
    const cdnIndex = services.findIndex((s) => s.name === targetService);
    if (cdnIndex === -1 || services[cdnIndex].status !== "online") return;

    // Update service list state
    const nextServices = [...services];
    nextServices[cdnIndex] = { ...nextServices[cdnIndex], status: "degraded", latency: 184 };
    setServices(nextServices);

    // Write state log change to DB (1 write transaction)
    const timestamp = new Date().toTimeString().split(" ")[0];
    const newLog: LogEntry = {
      timestamp,
      service: targetService,
      fromState: "online",
      toState: "degraded",
      reason: "High origin request latency spike.",
    };

    setLogs((prev) => [newLog, ...prev]);
    setDbWrites((w) => w + 1);
    setTotalChecks((c) => c + 1);
  }

  function resolveIncident() {
    // Resolve CDN Edge Cache back to online
    const targetService = "CDN Edge Cache";
    const cdnIndex = services.findIndex((s) => s.name === targetService);
    if (cdnIndex === -1 || services[cdnIndex].status === "online") return;

    const nextServices = [...services];
    nextServices[cdnIndex] = { ...nextServices[cdnIndex], status: "online", latency: 14 };
    setServices(nextServices);

    const timestamp = new Date().toTimeString().split(" ")[0];
    const newLog: LogEntry = {
      timestamp,
      service: targetService,
      fromState: "degraded",
      toState: "online",
      reason: "Latency stabilized. Cache hit ratio restored.",
    };

    setLogs((prev) => [newLog, ...prev]);
    setDbWrites((w) => w + 1);
    setTotalChecks((c) => c + 1);
  }

  function simulateChecks() {
    // Simulate running 100 status checks in background, none changing state
    setTotalChecks((c) => c + 120);
    // Notice DB writes does NOT change since state has not changed (compactor pipeline active!)
  }

  return (
    <div className="relative w-full rounded-3xl border border-white/10 bg-[#050814]/80 p-1 shadow-glass-lg backdrop-blur-2xl overflow-hidden">
      
      {/* Simulation Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Server className="h-4.5 w-4.5 text-accent-soft" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ops Status Console Sandbox
          </h4>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            Audit Logging Active
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.3fr_1fr] min-h-[460px] min-w-0">
        
        {/* Left Side: Services Status Matrix */}
        <div className="flex flex-col border-r border-white/5 bg-[#070b18]/60 p-5 justify-between min-w-0 overflow-hidden">
          <div className="space-y-4">
            <h5 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
              System Service Status Monitor
            </h5>

            <div className="grid gap-3">
              {services.map((svc) => {
                const isOnline = svc.status === "online";
                const isDegraded = svc.status === "degraded";

                return (
                  <div
                    key={svc.name}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.01] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-2.5 w-2.5">
                        <span
                          className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            isOnline ? "animate-ping bg-emerald-400" : isDegraded ? "animate-ping bg-amber-400" : "bg-red-400"
                          }`}
                        />
                        <span
                          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                            isOnline ? "bg-emerald-400" : isDegraded ? "bg-amber-400" : "bg-red-400"
                          }`}
                        />
                      </span>
                      <span className="text-xs font-medium text-white">{svc.name}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-mono">
                      <span className="text-slate-500">Latency: {svc.latency}ms</span>
                      <Badge
                        variant={isOnline ? "accent" : "muted"}
                        className={`text-[9px] uppercase tracking-wider ${
                          isOnline ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" : "text-amber-400 border-amber-500/20 bg-amber-500/10"
                        }`}
                      >
                        {svc.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Controllers */}
          <div className="pt-5 border-t border-white/5 space-y-3">
            <div className="flex gap-2">
              {services[2].status === "online" ? (
                <Button
                  onClick={triggerIncident}
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs border-amber-500/20 hover:border-amber-500/40 text-amber-300 flex items-center justify-center gap-1.5 cursor-grow"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Simulate Cache Degradation
                </Button>
              ) : (
                <Button
                  onClick={resolveIncident}
                  variant="primary"
                  size="sm"
                  className="flex-1 text-xs flex items-center justify-center gap-1.5 cursor-grow"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Resolve Service Alert
                </Button>
              )}
            </div>

            <Button
              onClick={simulateChecks}
              variant="secondary"
              size="sm"
              className="w-full text-xs flex items-center justify-center gap-1.5 cursor-grow"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Simulate 120 Background Checks
            </Button>
          </div>
        </div>

        {/* Right Side: Log Compactor Telemetry */}
        <div className="p-4 flex flex-col justify-between bg-white/[0.01]">
          <div className="space-y-4">
            
            {/* DB Writes Compression Stats */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Database className="h-3.5 w-3.5" />
                DB State-Duration Compactor Metrics
              </h5>
              
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <span className="block text-[9px] text-slate-500 uppercase">System Checks</span>
                  <span className="text-base font-bold font-mono text-white">{totalChecks}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <span className="block text-[9px] text-slate-500 uppercase">DB Writes Logged</span>
                  <span className="text-base font-bold font-mono text-cyan-400">{dbWrites}</span>
                </div>
              </div>

              {/* Compression Ratio */}
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Database Disk Writes Saved</span>
                <span className="font-bold text-cyan-400 font-mono">
                  {((1 - dbWrites / totalChecks) * 100).toFixed(1)}% Saved
                </span>
              </div>
            </div>

            {/* Event Logs list */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Terminal className="h-3.5 w-3.5" />
                Database Incident Audit Log
              </h5>
              <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3 font-mono text-[9px] text-slate-400 space-y-2 h-36 overflow-y-auto leading-relaxed scrollbar-thin">
                {logs.map((log, idx) => (
                  <div key={idx} className="border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                    <p className="text-white">
                      [{log.timestamp}] <span className="text-cyan-400">{log.service}</span>
                    </p>
                    <p className="text-slate-500">
                      Transition: <span className="text-slate-300 font-semibold">{log.fromState}</span> →{" "}
                      <span
                        className={
                          log.toState === "online"
                            ? "text-emerald-400 font-semibold"
                            : "text-amber-400 font-semibold"
                        }
                      >
                        {log.toState}
                      </span>
                    </p>
                    <p className="text-[8px] italic text-slate-500">Reason: {log.reason}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="pt-3 border-t border-white/5 text-[9px] text-slate-500 text-center">
            Writes are ONLY written to PostgreSQL on status change.
          </div>
        </div>

      </div>
    </div>
  );
}
