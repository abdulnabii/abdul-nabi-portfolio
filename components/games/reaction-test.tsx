"use client";

import { useState, useRef, useCallback } from "react";

type Phase = "idle" | "waiting" | "ready" | "clicked" | "early";

const MESSAGES: Record<Phase, string> = {
  idle: "Click Start to begin",
  waiting: "Wait for green...",
  ready: "🟢 CLICK NOW!",
  clicked: "",
  early: "⚠️ Too early! Click to retry",
};

export function ReactionTest() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [times, setTimes] = useState<number[]>([]);
  const startRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    setPhase("waiting");
    setReactionTime(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    const delay = 1500 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      startRef.current = performance.now();
      setPhase("ready");
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (phase === "idle" || phase === "clicked" || phase === "early") {
      start();
      return;
    }
    if (phase === "waiting") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase("early");
      return;
    }
    if (phase === "ready") {
      const rt = Math.round(performance.now() - startRef.current);
      setReactionTime(rt);
      setTimes((prev) => [...prev.slice(-9), rt]);
      setPhase("clicked");
    }
  }, [phase, start]);

  const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;
  const best = times.length > 0 ? Math.min(...times) : null;

  const getRating = (ms: number) => {
    if (ms < 150) return { label: "Godlike ⚡", color: "text-yellow-300" };
    if (ms < 200) return { label: "Elite 🔥", color: "text-orange-400" };
    if (ms < 250) return { label: "Great 💪", color: "text-emerald-400" };
    if (ms < 300) return { label: "Good 👍", color: "text-blue-400" };
    if (ms < 400) return { label: "Average 😐", color: "text-slate-300" };
    return { label: "Slow 🐢", color: "text-slate-500" };
  };

  const bgColor = {
    idle: "bg-[#0d1220]",
    waiting: "bg-[#1a0d0d]",
    ready: "bg-[#0a2010]",
    clicked: "bg-[#0d1220]",
    early: "bg-[#1a1000]",
  }[phase];

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm">
      <div
        onClick={handleClick}
        className={`w-full h-52 rounded-2xl border border-white/10 flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200 ${bgColor}`}
        style={{ touchAction: "none" }}
      >
        <p className="text-4xl mb-2">
          {phase === "ready" ? "🟢" : phase === "waiting" ? "🔴" : phase === "early" ? "⚡" : "⏱️"}
        </p>
        <p className={`text-lg font-semibold ${phase === "ready" ? "text-emerald-300 animate-pulse" : "text-slate-300"}`}>
          {MESSAGES[phase]}
        </p>
        {phase === "clicked" && reactionTime !== null && (
          <div className="text-center mt-2">
            <p className="text-4xl font-bold text-white">{reactionTime}<span className="text-lg text-slate-400"> ms</span></p>
            <p className={`text-sm font-semibold mt-1 ${getRating(reactionTime).color}`}>{getRating(reactionTime).label}</p>
            <p className="text-xs text-slate-500 mt-2">Click to play again</p>
          </div>
        )}
        {phase === "idle" && (
          <p className="text-xs text-slate-500 mt-2">Click anywhere to start</p>
        )}
      </div>

      {times.length > 0 && (
        <div className="w-full bg-[#0d1220] rounded-2xl border border-white/10 p-4">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-slate-400">Avg: <span className="text-white font-bold">{avg} ms</span></span>
            <span className="text-slate-400">Best: <span className="text-yellow-300 font-bold">{best} ms</span></span>
            <span className="text-slate-400">Tests: <span className="text-white font-bold">{times.length}</span></span>
          </div>
          <div className="flex items-end gap-1.5 h-12">
            {times.map((t, i) => {
              const h = Math.max(8, Math.min(100, ((450 - t) / 350) * 100));
              return (
                <div key={i} className="flex-1 rounded-t-sm bg-indigo-500/60 transition-all duration-300 relative group" style={{ height: `${h}%` }}>
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 whitespace-nowrap">{t}ms</span>
                </div>
              );
            })}
          </div>
          <button onClick={() => { setTimes([]); setPhase("idle"); setReactionTime(null); }} className="mt-3 text-xs text-slate-500 hover:text-slate-300 transition-colors">Reset history</button>
        </div>
      )}

      <p className="text-xs text-slate-600">Click when the screen turns green</p>
    </div>
  );
}
