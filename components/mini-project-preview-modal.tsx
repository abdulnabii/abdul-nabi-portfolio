"use client";

import React, { useState } from "react";
import type { MiniProject } from "@/lib/mini-projects-store";
import {
  ExternalLink,
  Github,
  X,
  Monitor,
  Smartphone,
  Loader2,
  Maximize2,
  Sparkles,
} from "lucide-react";

interface MiniProjectPreviewModalProps {
  project: MiniProject | null;
  onClose: () => void;
}

export function MiniProjectPreviewModal({
  project,
  onClose,
}: MiniProjectPreviewModalProps) {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [loading, setLoading] = useState(true);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl h-[88vh] max-h-[850px] rounded-3xl border border-white/15 bg-[#070b19] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30 font-mono shrink-0">
              Day {String(project.dayNumber).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate">
                {project.title}
              </h3>
              <p className="text-xs text-slate-400 truncate">
                {project.category} · {project.tags.join(" • ")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Switcher */}
            <div className="hidden sm:flex items-center rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
              <button
                onClick={() => setDeviceMode("desktop")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition ${
                  deviceMode === "desktop"
                    ? "bg-indigo-600 text-white font-medium shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Desktop View"
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setDeviceMode("mobile")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition ${
                  deviceMode === "mobile"
                    ? "bg-indigo-600 text-white font-medium shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Mobile Frame View"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobile</span>
              </button>
            </div>

            {/* External Tab Link */}
            {project.vercelUrl && (
              <a
                href={project.vercelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/30 transition"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Open Full Site</span>
              </a>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              title="Close Preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Iframe Container */}
        <div className="relative flex-1 w-full bg-[#030611] overflow-hidden flex items-center justify-center p-2 sm:p-4">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#070b19]/90 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              <p className="text-xs text-slate-400">Loading live demo preview...</p>
            </div>
          )}

          <div
            className={`transition-all duration-300 h-full w-full flex items-center justify-center ${
              deviceMode === "mobile" ? "max-w-[390px] h-[95%]" : "max-w-full"
            }`}
          >
            <div
              className={`w-full h-full rounded-2xl overflow-hidden border transition-all ${
                deviceMode === "mobile"
                  ? "border-slate-700 shadow-2xl rounded-[36px] p-2 bg-slate-900 ring-1 ring-white/20"
                  : "border-white/10 shadow-inner bg-slate-950"
              }`}
            >
              <iframe
                src={project.vercelUrl}
                title={`Live preview of ${project.title}`}
                onLoad={() => setLoading(false)}
                className="w-full h-full rounded-xl bg-white border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Description */}
        <div className="px-5 py-3 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-slate-300 line-clamp-1 flex-1">
            {project.description}
          </p>

          <div className="flex items-center gap-3 shrink-0">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition"
              >
                <Github className="h-3.5 w-3.5" />
                <span>View Source Code</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
