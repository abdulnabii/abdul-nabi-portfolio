"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Grid = (number | null)[][];

function createGrid(): Grid {
  return Array(4).fill(null).map(() => Array(4).fill(null));
}

function addRandom(grid: Grid): Grid {
  const empty: [number, number][] = [];
  grid.forEach((row, r) => row.forEach((v, c) => { if (!v) empty.push([r, c]); }));
  if (empty.length === 0) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const next = grid.map((row) => [...row]);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function compress(row: (number | null)[]): (number | null)[] {
  return [...row.filter(Boolean), ...row.filter((v) => !v)];
}

function merge(row: (number | null)[]): { row: (number | null)[]; score: number } {
  let score = 0;
  const r = [...row];
  for (let i = 0; i < 3; i++) {
    if (r[i] && r[i] === r[i + 1]) {
      const val = (r[i] as number) * 2;
      r[i] = val;
      r[i + 1] = null;
      score += val;
    }
  }
  return { row: compress(r), score };
}

function moveLeft(grid: Grid): { grid: Grid; score: number } {
  let total = 0;
  const next = grid.map((row) => {
    const { row: r, score } = merge(compress(row));
    total += score;
    return r;
  });
  return { grid: next, score: total };
}

function rotateRight(g: Grid): Grid {
  return g[0].map((_, c) => g.map((row) => row[c]).reverse());
}

function move(grid: Grid, dir: "left" | "right" | "up" | "down"): { grid: Grid; score: number } {
  if (dir === "left") return moveLeft(grid);
  if (dir === "right") {
    const { grid: g, score } = moveLeft(grid.map((r) => [...r].reverse()));
    return { grid: g.map((r) => [...r].reverse()), score };
  }
  if (dir === "up") {
    const { grid: g, score } = moveLeft(rotateRight(rotateRight(rotateRight(grid))));
    return { grid: rotateRight(g), score };
  }
  const { grid: g, score } = moveLeft(rotateRight(grid));
  return { grid: rotateRight(rotateRight(rotateRight(g))), score };
}

function gridsEqual(a: Grid, b: Grid) {
  return a.every((row, r) => row.every((v, c) => v === b[r][c]));
}

const COLORS: Record<number, string> = {
  2: "bg-slate-700 text-slate-100",
  4: "bg-slate-600 text-slate-100",
  8: "bg-orange-700 text-white",
  16: "bg-orange-600 text-white",
  32: "bg-orange-500 text-white",
  64: "bg-red-600 text-white",
  128: "bg-yellow-500 text-white",
  256: "bg-yellow-400 text-slate-900",
  512: "bg-amber-400 text-slate-900",
  1024: "bg-indigo-500 text-white",
  2048: "bg-violet-500 text-white",
};

export function Game2048() {
  const [grid, setGrid] = useState<Grid>(() => addRandom(addRandom(createGrid())));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [won, setWon] = useState(false);
  const [over, setOver] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const isGameOver = useCallback((g: Grid) => {
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      if (!g[r][c]) return false;
      if (c < 3 && g[r][c] === g[r][c + 1]) return false;
      if (r < 3 && g[r][c] === g[r + 1][c]) return false;
    }
    return true;
  }, []);

  const handleMove = useCallback((dir: "left" | "right" | "up" | "down") => {
    if (over) return;
    setGrid((prev) => {
      const { grid: next, score: gained } = move(prev, dir);
      if (gridsEqual(prev, next)) return prev;
      const withNew = addRandom(next);
      setScore((s) => {
        const ns = s + gained;
        setBest((b) => Math.max(b, ns));
        return ns;
      });
      if (withNew.some((row) => row.some((v) => v === 2048))) setWon(true);
      if (isGameOver(withNew)) setOver(true);
      return withNew;
    });
  }, [over, isGameOver]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { handleMove("left"); e.preventDefault(); }
      if (e.key === "ArrowRight") { handleMove("right"); e.preventDefault(); }
      if (e.key === "ArrowUp") { handleMove("up"); e.preventDefault(); }
      if (e.key === "ArrowDown") { handleMove("down"); e.preventDefault(); }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [handleMove]);

  const reset = () => {
    setGrid(addRandom(addRandom(createGrid())));
    setScore(0);
    setWon(false);
    setOver(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      handleMove(dx > 20 ? "right" : "left");
    } else {
      handleMove(dy > 20 ? "down" : "up");
    }
    touchStart.current = null;
  };

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div className="flex items-center justify-between w-full max-w-[320px]">
        <div className="flex gap-3">
          <div className="bg-[#1a1f35] rounded-xl px-4 py-2 text-center min-w-[70px]">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Score</p>
            <p className="text-lg font-bold text-white">{score}</p>
          </div>
          <div className="bg-[#1a1f35] rounded-xl px-4 py-2 text-center min-w-[70px]">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Best</p>
            <p className="text-lg font-bold text-yellow-300">{best}</p>
          </div>
        </div>
        <button onClick={reset} className="px-4 py-1.5 rounded-full text-xs font-semibold bg-violet-500/20 border border-violet-500/40 text-violet-300 hover:bg-violet-500/30 transition-all">
          New Game
        </button>
      </div>

      <div
        className="relative bg-[#0d1220] p-3 rounded-2xl border border-white/10 touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: "none" }}
      >
        <div className="grid grid-cols-4 gap-2">
          {grid.flat().map((val, i) => (
            <div
              key={i}
              className={`w-[66px] h-[66px] flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-100 ${
                val ? COLORS[val] ?? "bg-violet-700 text-white" : "bg-white/5"
              }`}
            >
              {val || ""}
            </div>
          ))}
        </div>
        {(over || won) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-2xl backdrop-blur-sm">
            <div className="text-center">
              <div className="text-3xl mb-2">{won ? "🏆" : "😵"}</div>
              <p className="text-white font-bold text-lg">{won ? "You Won!" : "Game Over!"}</p>
              <p className="text-slate-300 text-sm mt-1">Score: <span className="text-yellow-300 font-bold">{score}</span></p>
              <button onClick={reset} className="mt-3 px-5 py-2 rounded-full text-sm font-semibold bg-violet-500/20 border border-violet-500/40 text-violet-300 hover:bg-violet-500/30 transition-all">Play Again</button>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-600">Arrow keys or swipe to slide tiles</p>
    </div>
  );
}
