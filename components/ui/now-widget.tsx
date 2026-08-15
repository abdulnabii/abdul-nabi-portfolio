"use client";

import React, { useState, useEffect } from "react";
import { Hammer, Sparkles, X, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function NowWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  // Hide on admin or resume pages
  if (pathname.startsWith("/admin") || pathname === "/resume" || hasDismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Current activity widget"
      className="fixed bottom-6 left-6 z-40 hidden md:block select-none"
    >
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 rounded-full border border-white/15 bg-[#080d24]/90 px-3.5 py-2 text-xs font-medium text-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-indigo-500/50 hover:text-white"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <Hammer className="h-3.5 w-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
          <span>Currently Building</span>
          <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.2 text-[10px] text-indigo-300 font-mono">
            30D-30P
          </span>
        </button>
      ) : (
        <div className="w-80 overflow-hidden rounded-2xl border border-white/15 bg-[#080d24]/95 p-4 text-xs text-slate-200 shadow-[0_16px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-semibold text-white tracking-wide">Live Status / Now</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 hover:bg-white/10 hover:text-white transition-colors"
                title="Minimize"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-300 mb-1">
                <Hammer className="h-3 w-3 text-indigo-400" />
                <span>Active Project</span>
              </div>
              <p className="font-medium text-white text-xs">
                30 Days · 30 Projects Challenge
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Building & deploying full-stack AI, ML, & healthcare micro-apps daily.
              </p>
              <Link
                href="/mini-projects"
                onClick={() => setIsOpen(false)}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Explore Challenge
                <ExternalLink className="h-2.5 w-2.5" />
              </Link>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-300 mb-1">
                <Sparkles className="h-3 w-3 text-emerald-400" />
                <span>Learning & Focus</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Application Security (AppSec), OWASP API Security Top 10 & Next.js 15 Server Actions.
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
            <span>Karachi, PK (UTC+5)</span>
            <span className="text-emerald-400 font-medium">Available for Hire</span>
          </div>
        </div>
      )}
    </aside>
  );
}
