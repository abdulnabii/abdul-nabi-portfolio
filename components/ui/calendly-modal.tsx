"use client";

import { useEffect, useState } from "react";
import { X, Calendar, ExternalLink, Loader2, Sparkles } from "lucide-react";

interface CalendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendlyUrl?: string;
}

export function CalendlyModal({ isOpen, onClose, calendlyUrl }: CalendlyModalProps) {
  const [iframeLoading, setIframeLoading] = useState(true);

  // Fallback to a default Calendly profile or general booking URL
  const bookingUrl =
    calendlyUrl && calendlyUrl.trim().length > 0
      ? calendlyUrl.trim()
      : "https://calendly.com";

  useEffect(() => {
    if (isOpen) {
      setIframeLoading(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendly-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        className="relative flex flex-col w-full max-w-4xl h-[90vh] max-h-[780px] rounded-3xl border border-white/15 bg-[#080d24] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 id="calendly-modal-title" className="text-sm font-semibold text-white flex items-center gap-2">
                Schedule a 1-on-1 Discovery Call
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  <Sparkles className="h-2.5 w-2.5" /> 30 Min
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pick a time that works best for your timezone
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              title="Open full page in new tab"
            >
              <span>Open in Tab</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close scheduling modal"
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Calendly Embed */}
        <div className="relative flex-1 w-full bg-[#050814] overflow-hidden">
          {iframeLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#080d24]/90 z-10 text-slate-400">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
              <p className="text-xs font-medium">Loading scheduling calendar...</p>
            </div>
          )}
          <iframe
            src={bookingUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            title="Select a Date & Time - Calendly"
            onLoad={() => setIframeLoading(false)}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
