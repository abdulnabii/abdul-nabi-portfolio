"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "info";
}

interface ToastContextType {
  toast: (options: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = "default" }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-4">
        {toasts.map((t) => {
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-fade-up",
                t.variant === "success"
                  ? "border-emerald-500/30 bg-[#061814]/95 text-emerald-200"
                  : t.variant === "error"
                  ? "border-rose-500/30 bg-[#1e0a0f]/95 text-rose-200"
                  : "border-indigo-500/30 bg-[#090e24]/95 text-slate-200"
              )}
            >
              <div className="mt-0.5 shrink-0">
                {t.variant === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : t.variant === "error" ? (
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                ) : (
                  <Info className="h-5 w-5 text-indigo-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white">{t.title}</h4>
                {t.description && (
                  <p className="mt-1 text-xs leading-relaxed opacity-90">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 text-slate-400 hover:text-white transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if not inside provider
    return {
      toast: (opts: Omit<Toast, "id">) => {
        console.log("[Toast]", opts.title, opts.description);
      },
    };
  }
  return ctx;
}
