"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { X } from "lucide-react";

const SnakeGame = dynamic(() => import("@/components/games/snake-game").then(m => m.SnakeGame), { ssr: false, loading: () => <GameLoading /> });
const Game2048 = dynamic(() => import("@/components/games/game-2048").then(m => m.Game2048), { ssr: false, loading: () => <GameLoading /> });
const FlappyBird = dynamic(() => import("@/components/games/flappy-bird").then(m => m.FlappyBird), { ssr: false, loading: () => <GameLoading /> });
const ReactionTest = dynamic(() => import("@/components/games/reaction-test").then(m => m.ReactionTest), { ssr: false, loading: () => <GameLoading /> });
const AimTrainer = dynamic(() => import("@/components/games/aim-trainer").then(m => m.AimTrainer), { ssr: false, loading: () => <GameLoading /> });

function GameLoading() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  );
}

const GAMES = [
  {
    id: "snake",
    emoji: "🐍",
    name: "Snake",
    description: "Classic snake — eat, grow, don't crash",
    color: "from-emerald-500/20 to-emerald-900/10",
    border: "border-emerald-500/30",
    glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]",
    tag: "Classic",
    component: <SnakeGame />,
  },
  {
    id: "2048",
    emoji: "🧩",
    name: "2048",
    description: "Slide tiles to reach the golden tile",
    color: "from-violet-500/20 to-violet-900/10",
    border: "border-violet-500/30",
    glow: "hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]",
    tag: "Puzzle",
    component: <Game2048 />,
  },
  {
    id: "flappy",
    emoji: "🐦",
    name: "Flappy Bird",
    description: "Tap to fly through the pipes",
    color: "from-yellow-500/20 to-yellow-900/10",
    border: "border-yellow-500/30",
    glow: "hover:shadow-[0_0_30px_rgba(234,179,8,0.25)]",
    tag: "Viral",
    component: <FlappyBird />,
  },
  {
    id: "reaction",
    emoji: "⚡",
    name: "Reaction Test",
    description: "How fast are your reflexes? Find out",
    color: "from-cyan-500/20 to-cyan-900/10",
    border: "border-cyan-500/30",
    glow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]",
    tag: "Trending",
    component: <ReactionTest />,
  },
  {
    id: "aim",
    emoji: "🎯",
    name: "Aim Trainer",
    description: "Sharpen your aim — hit the targets fast",
    color: "from-red-500/20 to-red-900/10",
    border: "border-red-500/30",
    glow: "hover:shadow-[0_0_30px_rgba(239,68,68,0.25)]",
    tag: "FPS Warm-up",
    component: <AimTrainer />,
  },
];

export function MiniGames() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const game = GAMES.find((g) => g.id === activeGame);

  return (
    <section id="games" className="section-padding relative" aria-labelledby="games-heading">
      <div className="container-narrow">
        <Reveal>
          <SectionHeading
            eyebrow="Mini Games"
            title="Play something fun"
            subtitle="5 trending browser games built right into the portfolio — no installs, just play."
          />
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {GAMES.map((g, i) => (
            <Reveal key={g.id} delay={i * 80}>
              <button
                onClick={() => setActiveGame(g.id)}
                className={`group w-full text-left rounded-2xl border bg-gradient-to-br ${g.color} ${g.border} p-5 transition-all duration-300 ${g.glow} hover:-translate-y-1`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{g.emoji}</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-slate-300 border border-white/10">
                    {g.tag}
                  </span>
                </div>
                <p className="text-base font-semibold text-white group-hover:text-white/90">{g.name}</p>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">{g.description}</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  Play Now
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Game Modal Overlay */}
      {activeGame && game && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setActiveGame(null); }}
        >
          <div className={`relative w-full max-w-xl rounded-3xl border ${game.border} bg-[#050814]/95 p-6 shadow-2xl`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{game.emoji}</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{game.name}</h3>
                  <p className="text-xs text-slate-400">{game.description}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveGame(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-center overflow-auto">
              {game.component}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
