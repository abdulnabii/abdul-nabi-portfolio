"use client";

import React, { useEffect, useState } from "react";
import { Download, Sparkles, X, Smartphone } from "lucide-react";

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register service worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // 2. Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show after a slight delay
      const dismissed = localStorage.getItem("an_pwa_dismissed");
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      localStorage.setItem("an_pwa_dismissed", "true");
    } catch {}
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-up max-w-xs select-none">
      <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/30 bg-[#070b1e]/95 p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-xs text-white">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
          <Smartphone className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white truncate">Install Portfolio App</p>
          <p className="text-[11px] text-slate-400">Add to Home Screen for fast offline access.</p>
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="rounded-lg bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="text-[11px] text-slate-400 hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="rounded-md p-1 text-slate-400 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
