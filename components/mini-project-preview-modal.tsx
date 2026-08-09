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
  AlertCircle,
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-7xl h-[92vh] rounded-3xl border border-white/20 bg-[#050814] shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-white/10 bg-white/[0.04]">
          <div className="flex items-center gap-3 min-w-0">
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
            {/* Refresh Live Frame */}
            <button
              onClick={reloadIframe}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition"
              title="Reload Preview Frame"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>

            {/* Device Viewport Toggle */}
            <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
              <button
                onClick={() => setDeviceMode("desktop")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition ${
                  deviceMode === "desktop"
                    ? "bg-indigo-600 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Full Responsive Desktop View"
              >
                <Monitor className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setDeviceMode("mobile")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition ${
                  deviceMode === "mobile"
                    ? "bg-indigo-600 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Mobile Screen Frame View"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            {/* Open Direct Vercel App */}
            {project.vercelUrl && (
              <a
                href={project.vercelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/20 px-3.5 py-1.5 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/30 transition"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Full App ↗</span>
              </a>
            )}

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              title="Close Preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Iframe Main Viewport */}
        <div className="relative flex-1 w-full bg-[#02040a] overflow-hidden flex items-center justify-center p-2 sm:p-4">
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050814]/95 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              <p className="text-xs font-medium text-slate-300">
                Loading live Vercel application...
              </p>
            </div>
          )}

          <div
            className={`transition-all duration-300 w-full h-full flex items-center justify-center ${
              deviceMode === "mobile" ? "max-w-[400px] h-[96%]" : "max-w-full h-full"
            }`}
          >
            <div
              className={`w-full h-full transition-all ${
                deviceMode === "mobile"
                  ? "rounded-[40px] border-8 border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/20 bg-black"
                  : "rounded-2xl border border-white/10 bg-slate-950 overflow-hidden"
              }`}
            >
              <iframe
                key={iframeKey}
                src={project.vercelUrl}
                title={`Live preview of ${project.title}`}
                onLoad={() => setLoading(false)}
                className="w-full h-full border-0 block bg-slate-950"
                style={{ width: "100%", height: "100%" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
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
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition"
              >
                <Github className="h-3.5 w-3.5" />
                <span>Source Code</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
