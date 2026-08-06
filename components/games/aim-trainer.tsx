"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Target {
  id: number;
  x: number;
  y: number;
  r: number;
  born: number;
}

const W = 380;
const H = 300;
const GAME_DURATION = 30;
const MAX_TARGETS = 5;
const TARGET_LIFETIME = 2500;

export function AimTrainer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    targets: [] as Target[],
    hits: 0,
    misses: 0,
    nextId: 0,
    running: false,
    timeLeft: GAME_DURATION,
  });
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [over, setOver] = useState(false);
  const [started, setStarted] = useState(false);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spawnTarget = useCallback(() => {
    const s = stateRef.current;
    if (s.targets.length >= MAX_TARGETS) return;
    const r = 18 + Math.random() * 22;
    const x = r + Math.random() * (W - 2 * r);
    const y = r + Math.random() * (H - 2 * r);
    s.targets.push({ id: s.nextId++, x, y, r, born: performance.now() });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;
    const now = performance.now();

    ctx.fillStyle = "#0a0f1e";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    s.targets.forEach((t) => {
      const age = now - t.born;
      const life = Math.max(0, 1 - age / TARGET_LIFETIME);
      const pulse = 0.85 + 0.15 * Math.sin(now / 180);

      // Outer glow ring
      const glow = ctx.createRadialGradient(t.x, t.y, t.r * 0.5, t.x, t.y, t.r * 1.8);
      glow.addColorStop(0, `rgba(239, 68, 68, ${life * 0.3})`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Target rings
      const colors = [
        `rgba(239,68,68,${life * 0.9 * pulse})`,
        `rgba(255,255,255,${life * 0.7})`,
        `rgba(239,68,68,${life * 0.95 * pulse})`,
        `rgba(255,220,220,${life * 0.9})`,
      ];
      const radii = [t.r, t.r * 0.7, t.r * 0.45, t.r * 0.2];
      radii.forEach((radius, i) => {
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Lifetime ring
      ctx.strokeStyle = `rgba(255,255,255,${life * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r + 5, -Math.PI / 2, -Math.PI / 2 + life * Math.PI * 2);
      ctx.stroke();
    });
  }, []);

  const gameLoop = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;
    const now = performance.now();

    // Expire old targets (count as misses)
    const expired = s.targets.filter((t) => now - t.born > TARGET_LIFETIME);
    if (expired.length > 0) {
      s.targets = s.targets.filter((t) => now - t.born <= TARGET_LIFETIME);
      s.misses += expired.length;
      setMisses(s.misses);
    }

    // Spawn new
    while (s.targets.length < MAX_TARGETS && s.running) spawnTarget();

    draw();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [draw, spawnTarget]);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.targets = [];
    s.hits = 0;
    s.misses = 0;
    s.nextId = 0;
    s.running = true;
    s.timeLeft = GAME_DURATION;
    setHits(0);
    setMisses(0);
    setTimeLeft(GAME_DURATION);
    setOver(false);
    setStarted(true);

    // Spawn initial targets
    for (let i = 0; i < 3; i++) spawnTarget();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      s.timeLeft--;
      setTimeLeft(s.timeLeft);
      if (s.timeLeft <= 0) {
        s.running = false;
        clearInterval(timerRef.current!);
        setOver(true);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        draw();
      }
    }, 1000);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop, spawnTarget, draw]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (!s.running) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    let hit = false;
    s.targets = s.targets.filter((t) => {
      const dx = mx - t.x;
      const dy = my - t.y;
      if (!hit && dx * dx + dy * dy <= t.r * t.r) {
        hit = true;
        s.hits++;
        setHits(s.hits);
        return false;
      }
      return true;
    });
    if (!hit) {
      s.misses++;
      setMisses(s.misses);
    }
  }, []);

  useEffect(() => {
    draw();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [draw]);

  const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
  const cps = (hits / Math.max(1, GAME_DURATION - timeLeft)).toFixed(1);

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div className="flex items-center justify-between w-full max-w-[380px]">
        <div className="flex gap-3 text-sm">
          <span className="text-slate-400">Hits: <span className="text-emerald-400 font-bold">{hits}</span></span>
          <span className="text-slate-400">Miss: <span className="text-red-400 font-bold">{misses}</span></span>
        </div>
        <span className={`text-sm font-bold ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-white"}`}>
          {timeLeft}s
        </span>
        <button onClick={startGame} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-all">
          {started ? "Restart" : "▶ Start"}
        </button>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="rounded-xl border border-white/10 cursor-crosshair"
          onClick={handleClick}
        />
        {!started && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-white font-semibold">Aim Trainer</p>
              <p className="text-slate-400 text-xs mt-1">Click targets as fast as you can</p>
              <p className="text-slate-500 text-xs">{GAME_DURATION} second challenge</p>
            </div>
          </div>
        )}
        {over && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/75 rounded-xl backdrop-blur-sm">
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-white font-bold text-lg">Time&apos;s Up!</p>
              <div className="mt-2 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-emerald-300 font-bold text-xl">{hits}</p>
                  <p className="text-xs text-slate-400">Hits</p>
                </div>
                <div>
                  <p className="text-yellow-300 font-bold text-xl">{accuracy}%</p>
                  <p className="text-xs text-slate-400">Accuracy</p>
                </div>
                <div>
                  <p className="text-indigo-300 font-bold text-xl">{cps}</p>
                  <p className="text-xs text-slate-400">CPS</p>
                </div>
              </div>
              <button onClick={startGame} className="mt-3 px-5 py-2 rounded-full text-sm font-semibold bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-all">Play Again</button>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-600">Click the red targets before they disappear</p>
    </div>
  );
}
