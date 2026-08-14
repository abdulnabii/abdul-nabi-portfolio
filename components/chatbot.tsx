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
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface TranscriptItem {
  id: string;
  role: "caller" | "receptionist";
  text: string;
  time: string;
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm **AB Assistant** — Abdul Nabi's portfolio AI 👋\n\nAsk me about his projects, skills, the 30-day challenge, how to hire him, or privacy & data policy.\n\nYou can also click **📞 Voice Call** at the top to speak directly with **Abdul Nabi's AI Receptionist**!",
};

const RECEPTIONIST_GREETING =
  "Hi, thanks for calling Abdul Nabi's office. Are you calling about a full-time role, a contract or freelance project, an application security audit, or something else?";

const QUICK_CHIPS = [
  { label: "🚀 Mini Projects", message: "Tell me about the 30-day AI mini projects challenge" },
  { label: "💻 Core Projects", message: "What are Abdul Nabi's main portfolio projects?" },
  { label: "🛠️ Tech Stack", message: "What is Abdul Nabi's tech stack?" },
  { label: "🔐 Privacy Policy", message: "What data does this chatbot collect? What is the privacy policy?" },
  { label: "📬 Contact & Hire", message: "How can I contact or hire Abdul Nabi?" },
  { label: "👨‍💻 Day 09 – GitHub", message: "Tell me about Day 09 GitHub Profile Analyzer project" },
  { label: "✉️ Day 10 – Email", message: "Tell me about Day 10 AI Email Composer project" },
];

const CALL_CHIPS = [
  { label: "💼 Full-Time Role", text: "I'm calling about a full-time engineering role." },
  { label: "⚡ Contract Project", text: "I'm reaching out about a contract / freelance project." },
  { label: "🛡️ AppSec Audit", text: "I'd like to inquire about an application security audit." },
  { label: "📅 Check Availability", text: "When is Abdul available for a quick meeting or call?" },
  { label: "👋 General Inquiry", text: "I have a general question about Abdul's work." },
];

// Simple markdown-like renderer: bold (**text**), line breaks, bullets
function renderContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("- ")) {
      const content = line.slice(2);
      return (
        <li key={i} className="ml-3 list-disc text-slate-300">
          {renderInline(content)}
        </li>
      );
    }
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
  const [assistantMode, setAssistantMode] = useState<"chat" | "call">("chat");

  // ── Chat Mode State ──
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [error, setError] = useState<string | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [chipsUsed, setChipsUsed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Call Agent Mode State ──
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callTranscript, setCallTranscript] = useState<TranscriptItem[]>([]);
  const [callInput, setCallInput] = useState("");
  const [callProcessing, setCallProcessing] = useState(false);
  const [callLogged, setCallLogged] = useState(false);
  const [showAvailabilitySheet, setShowAvailabilitySheet] = useState(false);
  const transcriptListRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Listen to external custom events (e.g. from Contact section "Call AI Receptionist")
  useEffect(() => {
    const handleOpenCall = () => {
      setOpen(true);
      setAssistantMode("call");
      startCall();
    };

    const handleOpenChat = () => {
      setOpen(true);
      setAssistantMode("chat");
    };

    window.addEventListener("open-assistant-call", handleOpenCall);
    window.addEventListener("open-assistant-chat", handleOpenChat);

    return () => {
      window.removeEventListener("open-assistant-call", handleOpenCall);
      window.removeEventListener("open-assistant-chat", handleOpenChat);
    };
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, loading, assistantMode]);

  useEffect(() => {
    if (transcriptListRef.current) {
      transcriptListRef.current.scrollTop = transcriptListRef.current.scrollHeight;
    }
  }, [callTranscript, assistantMode]);

  useEffect(() => {
    if (open && assistantMode === "chat") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, assistantMode]);

  // Call timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callActive) {
      interval = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callActive]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const spokenText = event.results[0][0].transcript;
          if (spokenText) {
            handleCallUserTurn(spokenText);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Text-To-Speech function for Receptionist voice output
  function speakReceptionistText(text: string) {
    if (!speakerEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*_#`]/g, "").trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.lang = "en-US";

      // Select natural or female receptionist voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.includes("Natural") ||
          v.name.includes("Samantha") ||
          v.name.includes("Karen") ||
          v.name.includes("Google US English") ||
          v.name.includes("Zira")
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch {}
  }

  function startCall() {
    setCallActive(true);
    setCallDuration(0);
    setCallLogged(false);
    const initialItem: TranscriptItem = {
      id: `rep-${Date.now()}`,
      role: "receptionist",
      text: RECEPTIONIST_GREETING,
      time: "00:00",
    };
    setCallTranscript([initialItem]);
    speakReceptionistText(RECEPTIONIST_GREETING);
  }

  function endCall() {
    setCallActive(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsSpeaking(false);
    setIsListening(false);

    // Auto-log the call inquiry to admin inbox if transcript has meaningful caller turns
    const callerTurns = callTranscript.filter((t) => t.role === "caller");
    if (callerTurns.length > 0 && !callLogged) {
      logCallSummary();
    }
  }

  async function logCallSummary() {
    try {
      setCallLogged(true);
      const transcriptData = callTranscript.map((t) => ({
        role: t.role,
        text: t.text,
        time: t.time,
      }));

      await fetch("/api/receptionist-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log_call",
          callerName: "Voice Call Visitor",
          inquiryType: "Voice Receptionist Call",
          inquiryDetails: callTranscript.map((t) => `${t.role}: ${t.text}`).join("\n"),
          transcript: transcriptData,
        }),
      });
    } catch (err) {
      console.warn("[receptionist log notice]", err);
    }
  }

  function toggleListening() {
    if (!recognitionRef.current) {
      alert("Microphone voice input is not supported in this browser. You can use the quick response chips or text input below!");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
      }
    }
  }

  async function handleCallUserTurn(text: string) {
    if (!text.trim() || callProcessing) return;

    const pad = (n: number) => String(n).padStart(2, "0");
    const timestamp = `${pad(Math.floor(callDuration / 60))}:${pad(callDuration % 60)}`;

    const userTurn: TranscriptItem = {
      id: `call-${Date.now()}`,
      role: "caller",
      text: text.trim(),
      time: timestamp,
    };

    const nextTranscript = [...callTranscript, userTurn];
    setCallTranscript(nextTranscript);
    setCallInput("");
    setCallProcessing(true);

    try {
      const history = nextTranscript.map((t) => ({
        role: t.role === "caller" ? ("user" as const) : ("assistant" as const),
        content: t.text,
      }));

      const res = await fetch("/api/receptionist-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history,
        }),
      });

      const data = await res.json();
      const reply = data.reply || "Thanks for calling Abdul Nabi's office. Anything else before we wrap up?";

      const repTurn: TranscriptItem = {
        id: `rep-${Date.now()}`,
        role: "receptionist",
        text: reply,
        time: timestamp,
      };

      setCallTranscript((prev) => [...prev, repTurn]);
      speakReceptionistText(reply);

      // Check if call completed
      if (reply.toLowerCase().includes("have a great day") || reply.toLowerCase().includes("thanks for calling")) {
        setTimeout(() => {
          logCallSummary();
        }, 1200);
      }
    } catch {
      const fallbackReply = "Got it! I've noted that down for Abdul Nabi and he will follow up with you within 1 to 2 business days.";
      setCallTranscript((prev) => [
        ...prev,
        {
          id: `rep-${Date.now()}`,
          role: "receptionist",
          text: fallbackReply,
          time: timestamp,
        },
      ]);
      speakReceptionistText(fallbackReply);
    } finally {
      setCallProcessing(false);
    }
  }

  // ── Standard Chatbot Actions ──
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
      const safeMessage = "Service temporarily unavailable. Please try again later.";
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

  function handleChatSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleCallFormSubmit(e: FormEvent) {
    e.preventDefault();
    if (!callActive) {
      startCall();
    }
    handleCallUserTurn(callInput);
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6 print:hidden">
      {open && (
        <div
          className={cn(
            "flex w-[min(100vw-2rem,430px)] flex-col overflow-hidden",
            "rounded-3xl border border-white/15 bg-[#070c1b]/95 shadow-2xl backdrop-blur-2xl",
            "animate-fade-up"
          )}
          role="dialog"
          aria-label="Portfolio AI assistant and voice receptionist"
        >
          {/* ── Top Header & Mode Switcher ── */}
          <div className="border-b border-white/[0.08] bg-[#0a0f1e]/90 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/30 to-purple-600/20 text-indigo-300 shadow-md">
                  {assistantMode === "call" ? (
                    <PhoneCall className="h-4 w-4 text-emerald-400 animate-pulse" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#070c1b] bg-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    {assistantMode === "call" ? "Abdul Nabi Receptionist" : "AB Portfolio Assistant"}
                    <span className="rounded bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.2 border border-indigo-500/30">
                      {assistantMode === "call" ? "Voice Agent" : "AI"}
                    </span>
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {assistantMode === "call"
                      ? callActive
                        ? `Live Call (${formatTimer(callDuration)})`
                        : "Ready to Call"
                      : "Online · Ready to Help"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowPrivacy((v) => !v)}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-slate-400 transition hover:border-indigo-500/30 hover:text-indigo-300"
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
                  aria-label="Close assistant"
                  onClick={() => {
                    if (callActive) endCall();
                    setOpen(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/[0.04] p-1 border border-white/5">
              <button
                onClick={() => {
                  setAssistantMode("chat");
                  if (callActive) endCall();
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition",
                  assistantMode === "chat"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Text Assistant
              </button>
              <button
                onClick={() => {
                  setAssistantMode("call");
                  if (!callActive) startCall();
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition",
                  assistantMode === "call"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <PhoneCall className="h-3.5 w-3.5" />
                Voice Call Agent
              </button>
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
                Conversations are processed in real-time. Logged call messages are delivered securely to Abdul Nabi&apos;s admin inbox. No data is sold or shared with third parties.
              </p>
              <button
                onClick={() => setShowPrivacy(false)}
                className="mt-1.5 text-blue-400 underline underline-offset-2 hover:text-blue-300"
              >
                Close
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════
              MODE 1: VOICE CALL AGENT (Abdul Nabi Receptionist)
             ══════════════════════════════════════════ */}
          {assistantMode === "call" && (
            <div className="flex flex-col flex-1 bg-slate-950/60">
              {/* Voice Call Status & Visualizer Card */}
              <div className="p-4 border-b border-white/[0.08] bg-gradient-to-b from-indigo-950/30 to-transparent space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-mono text-emerald-300 font-semibold">
                      {callActive ? `CONNECTED · ${formatTimer(callDuration)}` : "CALL ENDED"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSpeakerEnabled((v) => !v)}
                      className={cn(
                        "p-1.5 rounded-lg border transition text-xs",
                        speakerEnabled
                          ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                          : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                      )}
                      title={speakerEnabled ? "Mute Speaker" : "Unmute Speaker"}
                    >
                      {speakerEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => setShowAvailabilitySheet((v) => !v)}
                      className="p-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition text-xs flex items-center gap-1"
                      title="View Booking Availability"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold">Schedule</span>
                    </button>
                  </div>
                </div>

                {/* Animated Audio Waveform Visualizer */}
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-3.5 flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center justify-center gap-1 h-8">
                    {[16, 24, 32, 20, 28, 34, 18, 30, 22, 14, 26, 32, 18, 24, 12].map((height, idx) => (
                      <span
                        key={idx}
                        style={{
                          height: (isSpeaking || isListening) ? `${Math.max(6, (height * (Math.sin(idx + callDuration * 2) + 1.2)))}px` : "6px",
                        }}
                        className={cn(
                          "w-1 rounded-full transition-all duration-150",
                          isSpeaking
                            ? "bg-indigo-400 shadow-sm shadow-indigo-400"
                            : isListening
                            ? "bg-emerald-400 shadow-sm shadow-emerald-400"
                            : "bg-slate-700"
                        )}
                      />
                    ))}
                  </div>

                  <p className="text-[11px] font-medium text-slate-300 text-center">
                    {isSpeaking ? (
                      <span className="text-indigo-300 font-semibold animate-pulse">
                        🤖 Receptionist is speaking...
                      </span>
                    ) : isListening ? (
                      <span className="text-emerald-300 font-semibold animate-pulse">
                        🎤 Listening to your voice...
                      </span>
                    ) : callActive ? (
                      "🎙️ Speak with your mic or select an inquiry below"
                    ) : (
                      "Call completed. Tap Start Call to speak again."
                    )}
                  </p>
                </div>

                {/* Availability Calendar Quick Sheet */}
                {showAvailabilitySheet && (
                  <div className="rounded-2xl border border-indigo-500/40 bg-slate-900 p-3.5 text-xs space-y-2 animate-fade-in shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        Abdul Nabi&apos;s Availability
                      </p>
                      <button onClick={() => setShowAvailabilitySheet(false)} className="text-slate-400 hover:text-white">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Abdul is open for <strong>Full-Time Engineering Roles</strong> and <strong>Select Freelance/AppSec Audits</strong>. Standard response time is 1-2 business days.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href="https://wa.me/923093751434?text=Hi%20Abdul%2C%20I%20spoke%20with%20your%20AI%20Receptionist%20and%20would%20like%20to%20schedule%20a%20call."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center py-1.5 text-[11px] transition shadow"
                      >
                        💬 Chat on WhatsApp
                      </a>
                      <a
                        href="mailto:abdulnabi.khaskhely@gmail.com?subject=Meeting%20Inquiry%20via%20Receptionist"
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-center py-1.5 text-[11px] transition"
                      >
                        📧 Send Email
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Call Transcript Log */}
              <div
                ref={transcriptListRef}
                className="flex max-h-[220px] min-h-[160px] flex-col gap-2.5 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 text-xs"
              >
                {callTranscript.map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      "flex flex-col gap-1 rounded-xl p-2.5 border",
                      t.role === "caller"
                        ? "border-emerald-500/30 bg-emerald-500/10 self-end max-w-[85%] text-white"
                        : "border-white/10 bg-white/[0.03] self-start max-w-[90%] text-slate-200"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
                      <span className={t.role === "caller" ? "text-emerald-300 font-bold" : "text-indigo-300 font-bold"}>
                        {t.role === "caller" ? "👤 You" : "🤖 Receptionist"}
                      </span>
                      <span>{t.time}</span>
                    </div>
                    <p className="leading-relaxed">{t.text}</p>
                  </div>
                ))}

                {callProcessing && (
                  <div className="self-start rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-slate-400 text-xs flex items-center gap-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:300ms]" />
                    <span>Receptionist responding...</span>
                  </div>
                )}

                {callLogged && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-[11px] text-emerald-300 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    Inquiry automatically logged to Abdul Nabi&apos;s admin inbox!
                  </div>
                )}
              </div>

              {/* Quick Inquiry Response Chips */}
              <div className="border-t border-white/[0.06] p-2.5 bg-slate-950/40">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Tap to speak your inquiry:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CALL_CHIPS.map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => {
                        if (!callActive) startCall();
                        handleCallUserTurn(chip.text);
                      }}
                      disabled={callProcessing}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-300 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-white disabled:opacity-40"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Call Controls Bar & Input */}
              <div className="border-t border-white/[0.08] bg-[#0a0f1e]/80 p-3 space-y-2">
                <form onSubmit={handleCallFormSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={callInput}
                    onChange={(e) => setCallInput(e.target.value)}
                    placeholder="Type or speak your answer..."
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    disabled={callProcessing}
                  />

                  {/* Microphone Toggle Button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={cn(
                      "p-2 rounded-xl border transition flex items-center justify-center shrink-0",
                      isListening
                        ? "border-emerald-500 bg-emerald-500 text-white animate-pulse shadow-lg shadow-emerald-500/30"
                        : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    )}
                    title={isListening ? "Stop Microphone" : "Speak with Microphone"}
                  >
                    <Mic className="h-4 w-4" />
                  </button>

                  <button
                    type="submit"
                    disabled={callProcessing || !callInput.trim()}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-40 shrink-0"
                    title="Send response"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>

                {/* Call End / Redial Button */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  {callActive ? (
                    <Button
                      onClick={endCall}
                      size="sm"
                      className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
                    >
                      <PhoneOff className="h-4 w-4" />
                      End Call &amp; Log Inquiry
                    </Button>
                  ) : (
                    <Button
                      onClick={startCall}
                      size="sm"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                    >
                      <Phone className="h-4 w-4" />
                      Start Voice Call with Receptionist
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              MODE 2: CHAT ASSISTANT (AB Assistant)
             ══════════════════════════════════════════ */}
          {assistantMode === "chat" && (
            <>
              {/* Message List */}
              <div
                ref={listRef}
                className="flex max-h-[360px] min-h-[260px] flex-col gap-3 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
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

              {/* Quick Chips */}
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

              {/* Input Form */}
              <form
                onSubmit={handleChatSubmit}
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
            </>
          )}
        </div>
      )}

      {/* ── FAB Toggle Button ── */}
      <div className="flex items-center gap-2">
        {!open && (
          <button
            onClick={() => {
              setOpen(true);
              setAssistantMode("call");
              setTimeout(() => startCall(), 150);
            }}
            className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/40 bg-[#0a1226]/90 px-3.5 py-2 text-xs font-bold text-emerald-300 shadow-xl backdrop-blur-xl hover:border-emerald-400 hover:bg-emerald-950/50 transition group"
          >
            <PhoneCall className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
            <span>Call AI Receptionist</span>
          </button>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "group relative flex h-14 w-14 items-center justify-center rounded-full shadow-glow transition-all duration-300",
            "bg-gradient-to-br from-accent to-accent/70 text-white",
            open && "rotate-90"
          )}
          aria-label={open ? "Close assistant" : "Open assistant"}
          aria-expanded={open}
        >
          {open ? (
            <ChevronDown className="h-5 w-5 transition-transform" />
          ) : (
            <>
              <MessageCircle className="h-5 w-5" />
              <span className="absolute inset-0 animate-ping rounded-full bg-accent/30 [animation-duration:2.5s]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
