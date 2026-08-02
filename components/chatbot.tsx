"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageCircle, Send, X, Bot, User } from "lucide-react";
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
    "Hi — I'm Abdul Nabi's portfolio assistant. Ask about selected work, stack, experience, or how to get in touch about a role.",
};

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

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
      // Use safe generic message — raw API errors must never reach the user
      const safeMessage = "Service temporarily unavailable. Please try again later.";
      console.error("[chatbot]", err);
      setError(safeMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "Sorry — I couldn't process that right now. Please try again or use the contact form.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div
          className={cn(
            "flex w-[min(100vw-2.5rem,380px)] flex-col overflow-hidden",
            "rounded-3xl border border-white/15 bg-[#0a0f1e]/85 shadow-glass-lg backdrop-blur-2xl",
            "animate-fade-up"
          )}
          role="dialog"
          aria-label="Portfolio chat assistant"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-accent-soft">
                <Bot className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-white">Ask Abdul Nabi AI</p>
                <p className="text-xs text-slate-500">Portfolio assistant</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="!px-2"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div
            ref={listRef}
            className="flex max-h-[360px] min-h-[280px] flex-col gap-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs",
                    message.role === "user"
                      ? "border-white/10 bg-white/5 text-slate-300"
                      : "border-accent/25 bg-accent/10 text-accent-soft"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="h-3.5 w-3.5" />
                  ) : (
                    <Bot className="h-3.5 w-3.5" />
                  )}
                </span>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    message.role === "user"
                      ? "rounded-tr-md bg-accent/80 text-white"
                      : "rounded-tl-md border border-white/10 bg-white/[0.05] text-slate-200"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent-soft">
                  <Bot className="h-3.5 w-3.5" />
                </span>
                <div className="rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.05] px-4 py-3">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="px-4 pb-1 text-xs text-red-400/90" role="alert">
              {error}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 p-3"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-1.5 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/15">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about projects, skills..."
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500"
                aria-label="Chat message"
                disabled={loading}
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="!h-9 !w-9 shrink-0 !rounded-xl !px-0"
                disabled={loading || !input.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        onClick={() => setOpen((v) => !v)}
        className="h-14 w-14 !rounded-full !p-0 shadow-glow"
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={open}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
