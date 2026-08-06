"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const CELL = 20;
const COLS = 20;
const ROWS = 18;
const INITIAL_SPEED = 120;

type Dir = { x: number; y: number };
type Pos = { x: number; y: number };

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    snake: [{ x: 10, y: 9 }, { x: 9, y: 9 }, { x: 8, y: 9 }] as Pos[],
    dir: { x: 1, y: 0 } as Dir,
    nextDir: { x: 1, y: 0 } as Dir,
    food: { x: 15, y: 9 } as Pos,
    score: 0,
    running: false,
    dead: false,
    speed: INITIAL_SPEED,
  });
  const [displayScore, setDisplayScore] = useState(0);
  const [dead, setDead] = useState(false);
  const [started, setStarted] = useState(false);
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const spawnFood = useCallback((snake: Pos[]): Pos => {
    let pos: Pos;
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;
    const W = COLS * CELL;
    const H = ROWS * CELL;

    // Background
    ctx.fillStyle = "#0a0f1e";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += CELL) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += CELL) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Food
    const fx = s.food.x * CELL + CELL / 2;
    const fy = s.food.y * CELL + CELL / 2;
    const gFood = ctx.createRadialGradient(fx, fy, 1, fx, fy, CELL / 2 - 1);
    gFood.addColorStop(0, "#ff6b6b");
    gFood.addColorStop(1, "#ff1744");
    ctx.fillStyle = gFood;
    ctx.beginPath();
    ctx.arc(fx, fy, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Snake
    s.snake.forEach((seg, i) => {
      const x = seg.x * CELL + 2;
      const y = seg.y * CELL + 2;
      const w = CELL - 4;
      const ratio = 1 - i / s.snake.length;
      const hue = 150 + (1 - ratio) * 60;
      ctx.fillStyle = `hsl(${hue}, 80%, ${45 + ratio * 20}%)`;
      ctx.beginPath();
      ctx.roundRect(x, y, w, w, 5);
      ctx.fill();
    });
  }, []);

  const gameLoop = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;

    s.dir = s.nextDir;
    const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };

    // Wall collision
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      s.running = false;
      s.dead = true;
      setDead(true);
      draw();
      return;
    }

    // Self collision
    if (s.snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
      s.running = false;
      s.dead = true;
      setDead(true);
      draw();
      return;
    }

    s.snake.unshift(head);

    if (head.x === s.food.x && head.y === s.food.y) {
      s.score++;
      s.food = spawnFood(s.snake);
      s.speed = Math.max(60, INITIAL_SPEED - s.score * 4);
      setDisplayScore(s.score);
    } else {
      s.snake.pop();
    }

    draw();
    loopRef.current = setTimeout(gameLoop, s.speed);
  }, [draw, spawnFood]);

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.snake = [{ x: 10, y: 9 }, { x: 9, y: 9 }, { x: 8, y: 9 }];
    s.dir = { x: 1, y: 0 };
    s.nextDir = { x: 1, y: 0 };
    s.food = spawnFood(s.snake);
    s.score = 0;
    s.speed = INITIAL_SPEED;
    s.running = true;
    s.dead = false;
    setDisplayScore(0);
    setDead(false);
    setStarted(true);
    if (loopRef.current) clearTimeout(loopRef.current);
    gameLoop();
  }, [gameLoop, spawnFood]);

  useEffect(() => {
    draw();
    const handleKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (!s.running) return;
      if (e.key === "ArrowUp" && s.dir.y !== 1) s.nextDir = { x: 0, y: -1 };
      if (e.key === "ArrowDown" && s.dir.y !== -1) s.nextDir = { x: 0, y: 1 };
      if (e.key === "ArrowLeft" && s.dir.x !== 1) s.nextDir = { x: -1, y: 0 };
      if (e.key === "ArrowRight" && s.dir.x !== -1) s.nextDir = { x: 1, y: 0 };
      e.preventDefault();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (loopRef.current) clearTimeout(loopRef.current);
    };
  }, [draw]);

  // Mobile swipe controls
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const s = stateRef.current;
    if (!s.running) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 20 && s.dir.x !== -1) s.nextDir = { x: 1, y: 0 };
      else if (dx < -20 && s.dir.x !== 1) s.nextDir = { x: -1, y: 0 };
    } else {
      if (dy > 20 && s.dir.y !== -1) s.nextDir = { x: 0, y: 1 };
      else if (dy < -20 && s.dir.y !== 1) s.nextDir = { x: 0, y: -1 };
    }
    touchStart.current = null;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[400px]">
        <span className="text-sm text-slate-400">Score: <span className="text-white font-bold">{displayScore}</span></span>
        <button
          onClick={startGame}
          className="px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-all"
        >
          {started ? "Restart" : "▶ Start"}
        </button>
      </div>
      <div className="relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <canvas
          ref={canvasRef}
          width={COLS * CELL}
          height={ROWS * CELL}
          className="rounded-xl border border-white/10"
          style={{ touchAction: "none" }}
        />
        {!started && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
            <div className="text-center">
              <div className="text-4xl mb-2">🐍</div>
              <p className="text-white font-semibold">Snake</p>
              <p className="text-slate-400 text-xs mt-1">Arrow keys or swipe to move</p>
            </div>
          </div>
        )}
        {dead && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl backdrop-blur-sm">
            <div className="text-center">
              <div className="text-3xl mb-2">💀</div>
              <p className="text-white font-semibold text-lg">Game Over!</p>
              <p className="text-slate-300 text-sm mt-1">Score: <span className="text-emerald-400 font-bold">{displayScore}</span></p>
              <button onClick={startGame} className="mt-3 px-5 py-2 rounded-full text-sm font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-all">Play Again</button>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-600">Use arrow keys or swipe on mobile</p>
    </div>
  );
}
