"use client";

import React, { useEffect, useState } from "react";
import { Terminal, Copy, Check } from "lucide-react";

interface TerminalLine {
  prompt: string;
  command: string;
  output?: string | React.ReactNode;
  outputColor?: string;
}

const TERMINAL_COMMANDS: TerminalLine[] = [
  {
    prompt: "➜  ~",
    command: "whoami",
    output: "Abdul Nabi — Full-Stack Developer & AppSec Engineer",
    outputColor: "text-indigo-300",
  },
  {
    prompt: "➜  ~",
    command: "cat stack.json",
    output: '{\n  "core": ["Next.js 14", "TypeScript", "Python"],\n  "database": ["Supabase", "PostgreSQL"],\n  "focus": "High-Performance Full-Stack & AppSec"\n}',
    outputColor: "text-emerald-400 font-mono text-[11px]",
  },
  {
    prompt: "➜  ~",
    command: "./status --check-availability",
    output: "✓ Status: Ready for engineering roles & select freelance projects.",
    outputColor: "text-cyan-300",
  },
];

export function TerminalTypewriter() {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedCommand, setDisplayedCommand] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentLineIndex >= TERMINAL_COMMANDS.length) {
      // Loop after pause
      const timeout = setTimeout(() => {
        setCurrentLineIndex(0);
        setDisplayedCommand("");
        setShowOutput(false);
      }, 7000);
      return () => clearTimeout(timeout);
    }

    const currentCmd = TERMINAL_COMMANDS[currentLineIndex].command;
    setShowOutput(false);

    let charIdx = 0;
    setDisplayedCommand("");

    const typeInterval = setInterval(() => {
      if (charIdx < currentCmd.length) {
        setDisplayedCommand(currentCmd.slice(0, charIdx + 1));
        charIdx++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setShowOutput(true);
          setTimeout(() => {
            setCurrentLineIndex((prev) => prev + 1);
          }, 1800);
        }, 300);
      }
    }, 45);

    return () => clearInterval(typeInterval);
  }, [currentLineIndex]);

  const copyCode = () => {
    navigator.clipboard.writeText("npx abdulnabi-portfolio");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-6 w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#060918]/90 font-mono text-xs shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all hover:border-indigo-500/30">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 flex items-center gap-1 text-[11px] text-slate-400">
            <Terminal className="h-3 w-3 text-indigo-400" />
            bash — 80x24
          </span>
        </div>

        <button
          onClick={copyCode}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
          title="Copy command"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>npx abdulnabi</span>
            </>
          )}
        </button>
      </div>

      {/* Terminal Body */}
      <div className="p-4 space-y-2.5 min-h-[140px]">
        {TERMINAL_COMMANDS.slice(0, currentLineIndex).map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-indigo-400 font-semibold">{item.prompt}</span>
              <span className="text-slate-100">{item.command}</span>
            </div>
            {item.output && (
              <div className={`pl-4 whitespace-pre-wrap ${item.outputColor || "text-slate-300"}`}>
                {item.output}
              </div>
            )}
          </div>
        ))}

        {currentLineIndex < TERMINAL_COMMANDS.length && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-indigo-400 font-semibold">
                {TERMINAL_COMMANDS[currentLineIndex].prompt}
              </span>
              <span className="text-slate-100">{displayedCommand}</span>
              <span className="inline-block h-3.5 w-1.5 bg-indigo-400 animate-pulse" />
            </div>
            {showOutput && TERMINAL_COMMANDS[currentLineIndex].output && (
              <div
                className={`pl-4 whitespace-pre-wrap animate-fade-in ${
                  TERMINAL_COMMANDS[currentLineIndex].outputColor || "text-slate-300"
                }`}
              >
                {TERMINAL_COMMANDS[currentLineIndex].output}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
