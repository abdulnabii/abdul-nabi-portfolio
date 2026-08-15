"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Gamepad2,
  Cpu,
  Zap,
  Target,
  Grid3X3,
  Flame,
  X,
  Play,
  Sparkles,
  Layers,
  Activity,
  Code2,
  Keyboard,
} from "lucide-react";

const SnakeGame = dynamic(() => import("@/components/games/snake-game").then(m => m.SnakeGame), {
  ssr: false,
  loading: () => <GameLoading />,
});
const Game2048 = dynamic(() => import("@/components/games/game-2048").then(m => m.Game2048), {
  ssr: false,
  loading: () => <GameLoading />,
});
const FlappyBird = dynamic(() => import("@/components/games/flappy-bird").then(m => m.FlappyBird), {
  ssr: false,
  loading: () => <GameLoading />,
});
const ReactionTest = dynamic(() => import("@/components/games/reaction-test").then(m => m.ReactionTest), {
  ssr: false,
  loading: () => <GameLoading />,
});
const AimTrainer = dynamic(() => import("@/components/games/aim-trainer").then(m => m.AimTrainer), {
  ssr: false,
  loading: () => <GameLoading />,
});

function GameLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      <span className="text-xs font-mono text-slate-400">Loading Canvas Engine...</span>
    </div>
  );
}

interface GameSpec {
  id: string;
  name: string;
  category: string;
  architecture: string;
  description: string;
  controls: string;
  icon: React.ElementType;
  gradient: string;
  accentColor: string;
  borderColor: string;
  glowColor: string;
  techBadge: string;
  component: React.ReactNode;
}

const GAMES: GameSpec[] = [
  {
    id: "snake",
    name: "Snake Grid Engine",
    category: "Spatial Grid Loop",
    architecture: "requestAnimationFrame loop with 20x18 grid matrix and collision detection.",
    description: "Real-time canvas-rendered snake mechanics with velocity vectors and food spawn algorithms.",
    controls: "Arrow Keys / WASD",
    icon: Gamepad2,
    gradient: "from-emerald-500/20 via-slate-900/60 to-emerald-950/40",
    accentColor: "text-emerald-400",
    borderColor: "border-emerald-500/30 hover:border-emerald-400/60",
    glowColor: "hover:shadow-[0_0_35px_rgba(16,185,129,0.2)]",
    techBadge: "HTML5 Canvas · 60 FPS",
    component: <SnakeGame />,
  },
  {
    id: "2048",
    name: "2048 Matrix Reducer",
    category: "2D Array Algorithm",
    architecture: "4x4 matrix row/column shifts, tile fusion math, and game-over state checks.",
    description: "Sliding tile puzzle engine computing logarithmic numeric mergers with animated transitions.",
    controls: "Arrow Keys / Swipe",
    icon: Grid3X3,
    gradient: "from-purple-500/20 via-slate-900/60 to-purple-950/40",
    accentColor: "text-purple-400",
    borderColor: "border-purple-500/30 hover:border-purple-400/60",
    glowColor: "hover:shadow-[0_0_35px_rgba(168,85,247,0.2)]",
    techBadge: "2D Matrix Math · State Engine",
    component: <Game2048 />,
  },
  {
    id: "flappy",
    name: "Aero Physics Simulator",
    category: "Kinematic Physics",
    architecture: "Continuous gravity acceleration vectors, velocity dampening, and obstacle hitboxes.",
    description: "Real-time physics arcade simulator evaluating continuous vertical kinematics and obstacle collisions.",
    controls: "Spacebar / Tap",
    icon: Cpu,
    gradient: "from-amber-500/20 via-slate-900/60 to-amber-950/40",
    accentColor: "text-amber-400",
    borderColor: "border-amber-500/30 hover:border-amber-400/60",
    glowColor: "hover:shadow-[0_0_35px_rgba(245,158,11,0.2)]",
    techBadge: "Physics Engine · Hitbox Collision",
    component: <FlappyBird />,
  },
  {
    id: "reaction",
    name: "Neural Reflex Benchmark",
    category: "Reflex Telemetry",
    architecture: "High-resolution performance.now() timestamps measuring browser event loop delays.",
    description: "High-precision human latency testing instrument tracking visual stimuli response in milliseconds.",
    controls: "Left Click / Tap",
    icon: Zap,
    gradient: "from-cyan-500/20 via-slate-900/60 to-cyan-950/40",
    accentColor: "text-cyan-400",
    borderColor: "border-cyan-500/30 hover:border-cyan-400/60",
    glowColor: "hover:shadow-[0_0_35px_rgba(6,182,212,0.2)]",
    techBadge: "performance.now() · <1ms Precision",
    component: <ReactionTest />,
  },
  {
    id: "aim",
    name: "Spatial Precision Trainer",
    category: "Spatial Raycasting",
    architecture: "Dynamic Cartesian coordinate generation, lifespan timeouts, and accuracy scoring.",
    description: "Dynamic precision targeting sandbox computing click accuracy percentages and target hit rates.",
    controls: "Mouse Click Targets",
    icon: Target,
    gradient: "from-rose-500/20 via-slate-900/60 to-rose-950/40",
    accentColor: "text-rose-400",
    borderColor: "border-rose-500/30 hover:border-rose-400/60",
    glowColor: "hover:shadow-[0_0_35px_rgba(244,63,94,0.2)]",
    techBadge: "Spatial Tracking · Accuracy Math",
    component: <AimTrainer />,
  },
];

export function MiniGames() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const game = GAMES.find((g) => g.id === activeGame);

  return (
    <section id="games" className="section-padding relative" aria-labelledby="games-heading">
      <div className="container-narrow space-y-10">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Interactive Dev Labs"
              title="Canvas Benchmarks & Game Engines"
              subtitle="Zero-dependency browser engines demonstrating real-time canvas rendering, kinematic physics, and state-machine algorithms."
              className="mb-0"
            />
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 shrink-0 font-mono">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>5 Interactive Sandboxes</span>
            </div>
          </div>
        </Reveal>

        {/* ── Interactive Game Cards Grid ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {GAMES.map((g, i) => {
            const Icon = g.icon;
            return (
              <Reveal key={g.id} delay={i * 70}>
                <button
                  onClick={() => setActiveGame(g.id)}
                  className={`group relative flex flex-col justify-between w-full h-full text-left rounded-3xl border bg-gradient-to-b ${g.gradient} ${g.borderColor} p-5 transition-all duration-300 ${g.glowColor} hover:-translate-y-1 cursor-pointer`}
                >
                  <div className="space-y-3.5">
                    {/* Top Icon & Tech Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${g.accentColor} shadow-inner`}>
                        <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                      </div>
                      <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                        {g.category}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-white transition-colors">
                        {g.name}
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-300/80 leading-relaxed line-clamp-2">
                        {g.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom: Tech Badge & Launch Trigger */}
                  <div className="pt-4 border-t border-white/[0.08] space-y-2">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Keyboard className="h-3 w-3 text-slate-500" />
                      <span className="truncate">{g.controls}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={`text-[11px] ${g.accentColor} flex items-center gap-1.5`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
                        Launch Engine
                      </span>
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white transition">
                        <Play className="h-3 w-3 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* ── High-End Game Modal Overlay ── */}
      {activeGame && game && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveGame(null);
          }}
        >
          <div className={`relative w-full max-w-2xl rounded-3xl border ${game.borderColor} bg-[#060a17]/95 p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-in`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${game.accentColor}`}>
                  <game.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{game.name}</h3>
                    <span className="rounded-md bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                      {game.techBadge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{game.architecture}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveGame(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Close Engine"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Canvas Viewport */}
            <div className="flex justify-center rounded-2xl border border-white/10 bg-[#030611] p-3 sm:p-4 overflow-hidden shadow-inner">
              {game.component}
            </div>

            {/* Modal Footer Controls Hint */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <Keyboard className="h-3.5 w-3.5 text-indigo-400" />
                <span>Controls: <strong className="text-white">{game.controls}</strong></span>
              </div>
              <span className="text-[11px] text-slate-500">
                Rendered on HTML5 Canvas · TypeScript Engine
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
