"use client";

import React, { useEffect, useState } from "react";
import type { MiniProject } from "@/lib/mini-projects-store";
import {
  ExternalLink,
  Github,
  X,
  Monitor,
  Smartphone,
  Loader2,
  RefreshCw,
  Sparkles,
  Layers,
  CheckCircle2,
  Terminal,
} from "lucide-react";

interface MiniProjectPreviewModalProps {
  project: MiniProject | null;
  onClose: () => void;
}

export function MiniProjectPreviewModal({
  project,
  onClose,
}: MiniProjectPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"frame" | "overview">("frame");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  const reloadIframe = () => {
    setLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-6xl h-[90vh] max-h-[850px] rounded-3xl border border-white/20 bg-[#050814] shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.04]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                  {project.category}
                </span>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  🟢 Live
                </span>
              </div>
              <h3 className="text-lg font-bold text-white truncate">
                {project.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher: Live Frame vs Project Specs */}
            <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
              <button
                onClick={() => setActiveTab("frame")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                  activeTab === "frame"
                    ? "bg-indigo-600 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Live View</span>
              </button>
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                  activeTab === "overview"
                    ? "bg-indigo-600 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Overview</span>
              </button>
            </div>

            {/* Device Toggle (Desktop / Mobile) when on Live View */}
            {activeTab === "frame" && (
              <div className="hidden sm:flex items-center rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
                <button
                  onClick={() => setDeviceMode("desktop")}
                  className={`p-1.5 rounded-lg transition ${
                    deviceMode === "desktop"
                      ? "bg-white/15 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeviceMode("mobile")}
                  className={`p-1.5 rounded-lg transition ${
                    deviceMode === "mobile"
                      ? "bg-white/15 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Launch Direct Link */}
            {project.vercelUrl && (
              <a
                href={project.vercelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Live Demo</span>
              </a>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
              title="Close Modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content Body */}
        <div className="relative flex-1 w-full bg-[#02040a] overflow-hidden">
          {activeTab === "frame" ? (
            /* Live Iframe View */
            <div className="relative w-full h-full flex items-center justify-center p-3">
              {loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050814]/95 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                  <p className="text-xs font-medium text-slate-300">
                    Loading live preview frame...
                  </p>
                </div>
              )}

              <div
                className={`transition-all duration-300 w-full h-full flex items-center justify-center ${
                  deviceMode === "mobile" ? "max-w-[390px] h-[96%]" : "max-w-full h-full"
                }`}
              >
                <div
                  className={`w-full h-full transition-all ${
                    deviceMode === "mobile"
                      ? "rounded-[38px] border-8 border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/20 bg-black"
                      : "rounded-2xl border border-white/10 bg-slate-950 overflow-hidden"
                  }`}
                >
                  <iframe
                    key={iframeKey}
                    src={project.vercelUrl}
                    title={`Live preview of ${project.title}`}
                    onLoad={() => setLoading(false)}
                    className="w-full h-full border-0 block bg-slate-950"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Overview & Technical Specs View */
            <div className="w-full h-full overflow-y-auto p-6 sm:p-8 space-y-6">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                  Project Description
                </h4>
                <p className="text-base leading-relaxed text-slate-200">
                  {project.description}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-3">
                  Technologies Used
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 font-mono"
                    >
                      <Sparkles className="h-3 w-3 text-indigo-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5 space-y-3">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Deployment Status: Production Live</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This micro-application is compiled with modern App Router architecture and deployed live on Vercel infrastructure. Click below to launch the app directly.
                </p>

                <div className="pt-2 flex flex-wrap gap-3">
                  {project.vercelUrl && (
                    <a
                      href={project.vercelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-indigo-500 transition"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Launch Live Demo (Vercel)
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition"
                    >
                      <Github className="h-4 w-4" />
                      View Source Code
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3 text-xs text-slate-400">
          <span className="truncate">{project.title}</span>
          <button
            onClick={onClose}
            className="hover:text-white transition underline cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
