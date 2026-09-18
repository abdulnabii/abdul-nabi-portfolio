"use client";

import { useState, FormEvent } from "react";
import { Mail, Sparkles, Send, CheckCircle2, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/components/ui/toast";

interface NewsletterSignupProps {
  variant?: "card" | "compact";
  className?: string;
}

export function NewsletterSignup({ variant = "card", className = "" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "blog_footer" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Subscription failed");
      }

      setStatus("success");
      setEmail("");
      toast({
        variant: "success",
        title: "Subscribed to AI & Tech Insights! 🚀",
        description: data.message || "You're all set. No spam, ever.",
      });
    } catch (err) {
      setStatus("error");
      const errText = err instanceof Error ? err.message : "Failed to subscribe. Please try again.";
      setErrorMessage(errText);
      toast({
        variant: "error",
        title: "Subscription Failed",
        description: errText,
      });
    }
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-2 ${className}`}>
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            placeholder="Enter your email..."
            disabled={status === "loading" || status === "success"}
            className="w-full rounded-xl border border-white/10 bg-[#060a17] pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {status === "loading" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : status === "success" ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <>
              <span>Subscribe</span>
              <Send className="h-3 w-3" />
            </>
          )}
        </button>
      </form>
    );
  }

  return (
    <GlassCard
      padding="lg"
      className={`relative overflow-hidden border-indigo-500/30 bg-gradient-to-br from-[#0a0f26]/90 via-[#060a19]/95 to-[#0e1738]/90 ${className}`}
    >
      <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-md">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            Weekly AI & Web Insights
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Stay Ahead of AI & Full-Stack Trends
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Curated breakdowns on Next.js 15, LLM agents, application security threat modeling, and shipping discipline. Zero spam, unsubscribe anytime.
          </p>
        </div>

        <div className="w-full md:max-w-sm">
          {status === "success" ? (
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-emerald-300">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <p className="text-xs font-semibold">
                You&apos;re subscribed! Look out for the next issue.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="you@company.com"
                    disabled={status === "loading"}
                    className="w-full rounded-xl border border-white/15 bg-[#060a17]/90 pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 transition-all focus:border-indigo-400 focus:bg-[#090f24] focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 cursor-pointer"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Join</span>
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
              {errorMessage && (
                <p className="text-[11px] text-rose-400 px-1">{errorMessage}</p>
              )}
              <p className="text-[10px] text-slate-400 px-1">
                🔒 Privacy guaranteed. Delivered straight to your inbox.
              </p>
            </form>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
