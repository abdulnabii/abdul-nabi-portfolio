"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Shield,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm **AB Assistant** — Abdul Nabi's portfolio AI 👋\n\nAsk me about his projects, skills, the 30-day challenge, how to hire him, or privacy & data policy.\n\nWhat would you like to know?",
};

const QUICK_CHIPS = [
  { label: "🚀 Mini Projects", message: "Tell me about the 30-day AI mini projects challenge" },
  { label: "💻 Core Projects", message: "What are Abdul Nabi's main portfolio projects?" },
  { label: "🛠️ Tech Stack", message: "What is Abdul Nabi's tech stack?" },
  { label: "🔐 Privacy Policy", message: "What data does this chatbot collect? What is the privacy policy?" },
  { label: "📬 Contact & Hire", message: "How can I contact or hire Abdul Nabi?" },
  { label: "👨‍💻 Day 09 – GitHub", message: "Tell me about Day 09 GitHub Profile Analyzer project" },
  { label: "✉️ Day 10 – Email", message: "Tell me about Day 10 AI Email Composer project" },
];

// Simple markdown-like renderer: bold (**text**), line breaks, bullets
function renderContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bullet
    if (line.startsWith("- ")) {
      const content = line.slice(2);
      return (
        <li key={i} className="ml-3 list-disc text-slate-300">
          {renderInline(content)}
        </li>
      );
    }
    // Empty line
    if (line.trim() === "") {
      return <div key={i} className="h-1.5" />;
    }
    return (
      <p key={i} className="leading-relaxed">
        {renderInline(line)}
      </p>
    );
  });
}

function renderInline(text: string) {
  // bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [error, setError] = useState<string | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [chipsUsed, setChipsUsed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);
    setChipsUsed(true);

    try {
      const history = [...messages, userMessage]
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = (await res.json()) as {
        reply?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply ?? "No response.",
        },
      ]);
    } catch (err) {
      console.error("[chatbot]", err);
      const safeMessage =
        "Service temporarily unavailable. Please try again later.";
      setError(safeMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "Sorry — I couldn't process that right now. Please try again or use the contact form at aiwithab.site/#contact.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await sendMessage(input);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6 print:hidden">
      {open && (
        <div
          className={cn(
            "flex w-[min(100vw-2rem,400px)] flex-col overflow-hidden",
            "rounded-2xl border border-white/10 bg-[#070c1b]/90 shadow-2xl backdrop-blur-2xl",
            "animate-fade-up"
          )}
          role="dialog"
          aria-label="Portfolio chat assistant"
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0a0f1e]/80 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-accent/30 bg-gradient-to-br from-accent/20 to-accent/5 text-accent-soft">
                <Bot className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#070c1b] bg-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AB Assistant</p>
                <p className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online · Portfolio AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowPrivacy((v) => !v)}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-slate-400 transition hover:border-accent/30 hover:text-accent-soft"
                aria-label="Privacy notice"
                title="Privacy notice"
              >
                <Shield className="h-3 w-3" />
                Privacy
              </button>
              <Button
                variant="ghost"
                size="sm"
                className="!h-8 !w-8 !p-0"
                aria-label="Close chat"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ── Privacy Notice Banner ── */}
          {showPrivacy && (
            <div className="border-b border-blue-500/20 bg-blue-950/40 px-4 py-3 text-[12px] leading-relaxed text-slate-300">
              <p className="mb-1 flex items-center gap-1.5 font-semibold text-blue-300">
                <Shield className="h-3.5 w-3.5" />
                Privacy Notice
              </p>
              <p>
                Chat messages are sent to{" "}
                <strong className="text-white">OpenAI&apos;s API</strong> in
                real-time for processing.{" "}
                <strong className="text-white">
                  No chat history is stored
                </strong>{" "}
                on Abdul Nabi&apos;s servers. Contact form data is stored
                securely in Supabase and is only accessible by Abdul Nabi. No
                data is sold or shared.
              </p>
              <button
                onClick={() => setShowPrivacy(false)}
                className="mt-1.5 text-blue-400 underline underline-offset-2 hover:text-blue-300"
              >
                Close
              </button>
            </div>
          )}

          {/* ── Message List ── */}
          <div
            ref={listRef}
            className="flex max-h-[380px] min-h-[260px] flex-col gap-3 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2.5",
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs",
                    message.role === "user"
                      ? "border-white/10 bg-white/5 text-slate-300"
                      : "border-accent/25 bg-gradient-to-br from-accent/15 to-accent/5 text-accent-soft"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="h-3.5 w-3.5" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                </span>

                {/* Bubble */}
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm",
                    message.role === "user"
                      ? "rounded-tr-sm bg-gradient-to-br from-accent/80 to-accent/60 text-white"
                      : "rounded-tl-sm border border-white/[0.08] bg-white/[0.04] text-slate-200"
                  )}
                >
                  <div className="flex flex-col gap-0.5">
                    {renderContent(message.content)}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div className="flex gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent/25 bg-gradient-to-br from-accent/15 to-accent/5 text-accent-soft">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div className="rounded-2xl rounded-tl-sm border border-white/[0.08] bg-white/[0.04] px-4 py-3">
                  <span className="flex gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-accent/60 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-accent/60 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-accent/60 [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Quick Chips ── */}
          {!chipsUsed && (
            <div className="border-t border-white/[0.06] px-4 py-2">
              <p className="mb-2 text-[11px] font-medium text-slate-500">
                Quick questions:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CHIPS.slice(0, 5).map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => sendMessage(chip.message)}
                    disabled={loading}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-300 transition hover:border-accent/30 hover:bg-accent/10 hover:text-white disabled:opacity-40"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* More quick chips after first message */}
          {chipsUsed && messages.length < 5 && (
            <div className="border-t border-white/[0.06] px-4 py-2">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CHIPS.slice(2).map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => sendMessage(chip.message)}
                    disabled={loading}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-400 transition hover:border-accent/30 hover:bg-accent/10 hover:text-white disabled:opacity-40"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="px-4 pb-1 text-xs text-red-400/90" role="alert">
              {error}
            </p>
          )}

          {/* ── Input Form ── */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-white/[0.08] bg-[#0a0f1e]/60 p-3"
          >
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 transition focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/10">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about projects, skills, privacy..."
                className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-slate-600"
                aria-label="Chat message"
                disabled={loading}
                maxLength={2000}
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="!h-8 !w-8 shrink-0 !rounded-lg !p-0"
                disabled={loading || !input.trim()}
                aria-label="Send message"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-slate-600">
              <Shield className="mr-0.5 inline h-2.5 w-2.5" />
              No chat history stored · Powered by AI
            </p>
          </form>
        </div>
      )}

      {/* ── FAB Toggle Button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group relative flex h-14 w-14 items-center justify-center rounded-full shadow-glow transition-all duration-300",
          "bg-gradient-to-br from-accent to-accent/70 text-white",
          open && "rotate-90"
        )}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="h-5 w-5 transition-transform" />
        ) : (
          <>
            <MessageCircle className="h-5 w-5" />
            {/* Pulse ring */}
            <span className="absolute inset-0 animate-ping rounded-full bg-accent/30 [animation-duration:2.5s]" />
          </>
        )}
      </button>
    </div>
  );
}
