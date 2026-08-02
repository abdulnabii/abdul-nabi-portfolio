"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquare, Send, X, Bot, User, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi — I'm the **Pulse Support Assistant**. This is an interactive sandbox showing secure Edge-streaming in action.\n\nAsk about **architecture**, **security**, or **skills** to see instant markdown token streaming!",
};

// Safe simple markdown renderer to avoid React dangerouslySetInnerHTML hazards
function ChatMarkdown({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split("\n");

  return (
    <div className="space-y-2 leading-relaxed text-sm">
      {lines.map((line, idx) => {
        // Renders bold headings starting with ###
        if (line.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-semibold text-white mt-3 mb-1 border-b border-white/5 pb-1">
              {line.replace("### ", "")}
            </h4>
          );
        }

        // Renders bullet lists starting with -
        if (line.startsWith("- ") || line.startsWith("* ")) {
          const content = line.substring(2);
          return (
            <ul key={idx} className="list-disc pl-4 space-y-1 my-1">
              <li>{renderInlineStyles(content)}</li>
            </ul>
          );
        }

        // Renders standard bullet lists with 1. 2.
        const numMatch = line.match(/^\d+\.\s(.*)/);
        if (numMatch) {
          return (
            <ol key={idx} className="list-decimal pl-4 space-y-1 my-1">
              <li>{renderInlineStyles(numMatch[1])}</li>
            </ol>
          );
        }

        // Regular paragraph line
        return <p key={idx}>{renderInlineStyles(line)}</p>;
      })}
    </div>
  );
}

// Helper to replace **bold** and `code` inline
function renderInlineStyles(text: string) {
  // Simple token regex split
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-slate-950/70 border border-white/10 px-1 py-0.5 font-mono text-xs text-indigo-300">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function PulseChatDemo() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const listRef = useRef<HTMLDivElement>(null);

  // Auto scroll logic
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    setInput("");
    setLoading(true);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);

    // Setup streaming placeholder message
    const assistantMsgId = `assistant-${Date.now()}`;
    const assistantPlaceholder: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, assistantPlaceholder]);

    // Track request count in local state to simulate server-side rate limits
    const currentCount = requestCount + 1;
    setRequestCount(currentCount);

    try {
      const response = await fetch("/api/projects/pulse-chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-Timestamp": Date.now().toString(),
          "X-Request-Count": currentCount.toString(),
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? `Server error ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Unable to initialize response stream reader.");
      }

      const decoder = new TextDecoder("utf-8");
      let streamText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamText += chunk;

        // Update assistant bubble in real-time
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: streamText } : m))
        );
      }
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Network stream connection lost.";
      setError(errMsg);

      // Clean up empty assistant bubble if stream failed early
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content:
                  "### Connection Disrupted\n\nUnable to stream tokens right now. Please test your network, verify rate limits, or try submitting another query.",
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setMessages([WELCOME_MESSAGE]);
    setRequestCount(0);
    setError(null);
  }

  return (
    <div className="relative w-full max-w-full rounded-3xl border border-white/10 bg-[#050814]/80 p-1 shadow-glass-lg backdrop-blur-2xl overflow-hidden">
      
      {/* Simulation Header Indicators */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Pulse Support Chat Sandbox
          </h4>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            AppSec Active
          </span>
          <span>Calls: {requestCount}/5</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] min-h-[460px] min-w-0">
        
        {/* Left Side: Live Widget Sandbox */}
        <div className="flex flex-col border-r border-white/5 bg-[#070b18]/60 p-4 min-w-0 overflow-hidden">
          <div
            ref={listRef}
            className="flex-1 max-h-[340px] overflow-y-auto space-y-4 pr-1 mb-4 scrollbar-thin"
          >
            {messages.map((message) => {
              const isAssistant = message.role === "assistant";
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2.5 max-w-[88%]",
                    isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold mt-0.5",
                      isAssistant
                        ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                        : "border-white/10 bg-white/5 text-slate-400"
                    )}
                  >
                    {isAssistant ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                  </span>

                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 shadow-sm",
                      isAssistant
                        ? "rounded-tl-none border border-white/5 bg-white/[0.03] text-slate-300"
                        : "rounded-tr-none bg-accent/80 text-white"
                    )}
                  >
                    <ChatMarkdown text={message.content} />
                  </div>
                </div>
              );
            })}

            {loading && !messages[messages.length - 1].content && (
              <div className="flex gap-2.5 mr-auto max-w-[80%]">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                  <Bot className="h-3.5 w-3.5" />
                </span>
                <div className="rounded-2xl rounded-tl-none border border-white/5 bg-white/[0.03] px-4 py-3 text-slate-300">
                  <span className="flex gap-1.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Form input */}
          <form onSubmit={handleSend} className="mt-auto">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/15">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about 'architecture', 'security', or 'skills'..."
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-50"
                disabled={loading}
                maxLength={1000}
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="!h-9 !w-9 shrink-0 !rounded-xl !px-0 cursor-grow"
                disabled={loading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Right Side: Telemetry & AppSec Console */}
        <div className="p-4 flex flex-col justify-between bg-white/[0.01] min-w-0 overflow-hidden">
          <div className="space-y-4">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
              Security Telemetry
            </h5>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Route Type</span>
                <span className="font-mono text-cyan-400 font-semibold">Edge Runtime</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Max Length Constraint</span>
                <span className="font-mono text-white">1,000 Chars</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Payload Sanitization</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Rate Limit Threshold</span>
                <span className="font-mono text-white">5 Requests/Min</span>
              </div>
            </div>

            {/* Simulated Alerts Area */}
            <div className="mt-4 space-y-2">
              {error ? (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-[11px] text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                  <div className="space-y-1">
                    <p className="font-semibold uppercase tracking-wider">Telemetry Alert</p>
                    <p className="leading-relaxed">{error}</p>
                  </div>
                </div>
              ) : requestCount >= 4 ? (
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                  <div className="space-y-1">
                    <p className="font-semibold uppercase tracking-wider">Throttling Warning</p>
                    <p className="leading-relaxed">Request threshold approached. Next calls will trigger rate limiter.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-emerald-400">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                  <div className="space-y-1">
                    <p className="font-semibold uppercase tracking-wider">System State Healthy</p>
                    <p className="leading-relaxed">Active stream pipelines are secure. No anomalies detected.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 cursor-grow"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Simulation State
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
