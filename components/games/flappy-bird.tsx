"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Pipe {
  x: number;
  top: number;
  scored: boolean;
}

const W = 360;
const H = 480;
const BIRD_X = 80;
const GRAVITY = 0.45;
const JUMP = -8;
const PIPE_GAP = 145;
const PIPE_WIDTH = 55;
const PIPE_SPEED = 2.8;
const PIPE_INTERVAL = 220;

export function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    birdY: H / 2,
    birdVy: 0,
    pipes: [] as Pipe[],
    score: 0,
    best: 0,
    frame: 0,
    running: false,
    dead: false,
    started: false,
  });
  const [displayScore, setDisplayScore] = useState(0);
  const [displayBest, setDisplayBest] = useState(0);
  const [dead, setDead] = useState(false);
  const [started, setStarted] = useState(false);
  const rafRef = useRef<number | null>(null);
  const bestRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#0a1628");
    sky.addColorStop(1, "#1a2a4a");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Ground
    ctx.fillStyle = "#1d3d1a";
    ctx.fillRect(0, H - 40, W, 40);
    ctx.fillStyle = "#2a5a25";
    ctx.fillRect(0, H - 40, W, 6);

    // Pipes
    s.pipes.forEach((p) => {
      const pipeGrad = ctx.createLinearGradient(p.x, 0, p.x + PIPE_WIDTH, 0);
      pipeGrad.addColorStop(0, "#1a6b2a");
      pipeGrad.addColorStop(0.5, "#27a83d");
      pipeGrad.addColorStop(1, "#1a6b2a");
      ctx.fillStyle = pipeGrad;
      // Top pipe
      ctx.beginPath();
      ctx.roundRect(p.x, 0, PIPE_WIDTH, p.top, [0, 0, 8, 8]);
      ctx.fill();
      // Cap top
      ctx.fillRect(p.x - 4, p.top - 20, PIPE_WIDTH + 8, 20);
      // Bottom pipe
      const btm = p.top + PIPE_GAP;
      ctx.beginPath();
      ctx.roundRect(p.x, btm, PIPE_WIDTH, H - btm - 40, [8, 8, 0, 0]);
      ctx.fill();
      ctx.fillRect(p.x - 4, btm, PIPE_WIDTH + 8, 20);
    });

    // Bird
    const bx = BIRD_X;
    const by = s.birdY;
    const angle = Math.min(Math.max(s.birdVy * 0.08, -0.4), 1.2);
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(angle);
    // Body
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wing
    ctx.fillStyle = "#FFA500";
    ctx.beginPath();
    ctx.ellipse(-4, 4, 12, 7, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(8, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(9, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Beak
    ctx.fillStyle = "#FF6600";
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(22, -2);
    ctx.lineTo(22, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Score
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 28px monospace";
    ctx.textAlign = "center";
    ctx.fillText(String(s.score), W / 2, 50);
  }, []);

  const gameLoop = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;

    s.frame++;
    s.birdVy += GRAVITY;
    s.birdY += s.birdVy;

    // Spawn pipes
    if (s.frame % PIPE_INTERVAL === 0) {
      const top = 80 + Math.random() * (H - PIPE_GAP - 160);
      s.pipes.push({ x: W, top, scored: false });
    }

    // Move pipes
    s.pipes = s.pipes.filter((p) => p.x + PIPE_WIDTH > -10);
    s.pipes.forEach((p) => {
      p.x -= PIPE_SPEED;
      // Score
      if (!p.scored && p.x + PIPE_WIDTH < BIRD_X) {
        p.scored = true;
        s.score++;
        setDisplayScore(s.score);
      }
    });

    // Collision: ground / ceiling
    if (s.birdY > H - 40 - 14 || s.birdY < 14) {
      s.running = false; s.dead = true;
      bestRef.current = Math.max(bestRef.current, s.score);
      setDisplayBest(bestRef.current);
      setDead(true);
      draw();
      return;
    }

    // Collision: pipes
    for (const p of s.pipes) {
      if (BIRD_X + 14 > p.x && BIRD_X - 14 < p.x + PIPE_WIDTH) {
        if (s.birdY - 14 < p.top || s.birdY + 14 > p.top + PIPE_GAP) {
          s.running = false; s.dead = true;
          bestRef.current = Math.max(bestRef.current, s.score);
          setDisplayBest(bestRef.current);
          setDead(true);
          draw();
          return;
        }
      }
    }

    draw();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [draw]);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.dead) return;
    if (!s.running) {
      s.birdY = H / 2;
      s.birdVy = 0;
      s.pipes = [];
      s.score = 0;
      s.frame = 0;
      s.running = true;
      s.dead = false;
      setDisplayScore(0);
      setDead(false);
      setStarted(true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(gameLoop);
    }
    stateRef.current.birdVy = JUMP;
  }, [gameLoop]);

  useEffect(() => {
    draw();
    const handle = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); jump(); }
    };
    window.addEventListener("keydown", handle);
    return () => {
      window.removeEventListener("keydown", handle);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw, jump]);

  return (
    <div className="flex flex-col items-center gap-2 max-w-full">
      <div className="flex items-center justify-between w-full max-w-[360px] px-1 text-xs">
        <span className="text-slate-400">Best: <span className="text-yellow-300 font-bold">{displayBest}</span></span>
        <span className="text-slate-400">Score: <span className="text-white font-bold">{displayScore}</span></span>
      </div>
      <div className="relative max-w-full flex justify-center">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="rounded-2xl border border-white/10 cursor-pointer max-h-[min(50vh,400px)] w-auto max-w-full object-contain shadow-lg"
          onClick={jump}
          style={{ touchAction: "none" }}
          onTouchStart={(e) => { e.preventDefault(); jump(); }}
        />
        {!started && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl backdrop-blur-sm">
            <div className="text-center">
              <div className="text-5xl mb-3">🐦</div>
              <p className="text-white font-bold text-lg">Flappy Bird</p>
              <p className="text-slate-300 text-sm mt-2">Tap / Click / Space to fly</p>
              <button onClick={jump} className="mt-4 px-6 py-2 rounded-full text-sm font-semibold bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/30 transition-all">▶ Start</button>
            </div>
          </div>
        )}
        {dead && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-2xl backdrop-blur-sm">
            <div className="text-center">
              <div className="text-3xl mb-2">💥</div>
              <p className="text-white font-bold text-lg">Game Over!</p>
              <p className="text-slate-300 text-sm mt-1">Score: <span className="text-yellow-300 font-bold">{displayScore}</span></p>
              <button onClick={jump} className="mt-3 px-5 py-2 rounded-full text-sm font-semibold bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/30 transition-all">Play Again</button>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-600">Tap or press Space to flap</p>
    </div>
  );
}
