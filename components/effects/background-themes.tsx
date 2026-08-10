"use client";

import React, { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   NIGHT THEME 1 — Deep Space Nebula (static)
───────────────────────────────────────────────────────────────────────────── */
export function ThemeDeepSpaceNebula() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      <div className="absolute inset-0 bg-[#030511]" />
      <div className="absolute -top-40 -left-20 h-[700px] w-[700px] rounded-full bg-indigo-900/40 blur-[120px]" />
      <div className="absolute top-1/3 right-0 h-[600px] w-[600px] rounded-full bg-violet-900/35 blur-[100px]" />
      <div className="absolute -bottom-20 left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-900/30 blur-[100px]" />
      <div className="absolute top-1/2 left-1/4 h-[400px] w-[400px] rounded-full bg-purple-900/25 blur-[80px]" />
      {Array.from({ length: 80 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${Math.random() * 2.5 + 0.5}px`,
            height: `${Math.random() * 2.5 + 0.5}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.7 + 0.2,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-grid opacity-15 mix-blend-overlay" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NIGHT THEME 2 — Midnight Aurora (static)
───────────────────────────────────────────────────────────────────────────── */
export function ThemeMidnightAurora() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#010a08] via-[#050d12] to-[#020808]" />
      <div className="absolute top-0 left-0 w-full h-[55%] bg-gradient-to-b from-emerald-900/50 via-teal-900/30 to-transparent blur-[60px]" />
      <div className="absolute top-0 left-0 w-full h-[45%] bg-gradient-to-r from-transparent via-cyan-800/25 to-transparent blur-[80px]" />
      <div className="absolute top-0 right-0 w-1/2 h-[60%] bg-gradient-to-bl from-violet-900/30 to-transparent blur-[90px]" />
      <div className="absolute top-[5%] left-[-10%] w-[120%] h-[220px] bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent blur-[30px] rotate-[-3deg]" />
      <div className="absolute top-[18%] left-[-10%] w-[120%] h-[180px] bg-gradient-to-r from-transparent via-teal-400/12 to-transparent blur-[35px] rotate-[2deg]" />
      <div className="absolute top-[30%] left-[-10%] w-[120%] h-[150px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent blur-[40px] rotate-[-1deg]" />
      <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-[#010a08] to-transparent" />
      <div className="absolute inset-0 bg-grid opacity-10 mix-blend-overlay" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NIGHT THEME 3 — Quantum Plasma (animated)
───────────────────────────────────────────────────────────────────────────── */
export function ThemeQuantumPlasma() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);

    const orbs = [
      { x: w * 0.2, y: h * 0.25, vx: 0.7, vy: 0.4, r: 480, hue: 235 },
      { x: w * 0.8, y: h * 0.35, vx: -0.65, vy: 0.5, r: 440, hue: 190 },
      { x: w * 0.55, y: h * 0.75, vx: 0.5, vy: -0.7, r: 520, hue: 275 },
      { x: w * 0.15, y: h * 0.85, vx: -0.4, vy: -0.5, r: 420, hue: 325 },
    ];

    const particles = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 3 + 1.2,
      vy: -(Math.random() * 0.45 + 0.2),
      vx: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.65 + 0.35,
      phase: Math.random() * Math.PI * 2,
    }));

    let mx = w / 2, my = h / 2, tmx = w / 2, tmy = h / 2;
    const onMouse = (e: MouseEvent) => { tmx = e.clientX; tmy = e.clientY; };
    window.addEventListener("mousemove", onMouse);
    const t0 = performance.now();

    const render = (now: number) => {
      const t = (now - t0) / 1000;
      mx += (tmx - mx) * 0.1; my += (tmy - my) * 0.1;
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#030511"); bg.addColorStop(0.5, "#060918"); bg.addColorStop(1, "#030511");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      orbs.forEach((o, i) => {
        o.x += o.vx + Math.sin(t*0.9+i)*0.75; o.y += o.vy + Math.cos(t*0.8+i)*0.75;
        if (o.x < -180 || o.x > w+180) o.vx *= -1;
        if (o.y < -180 || o.y > h+180) o.vy *= -1;
        const hue = (o.hue + t*16)%360;
        const dr = o.r + Math.sin(t*2.4+i*1.6)*55;
        const g = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,dr);
        g.addColorStop(0,`hsla(${hue},90%,65%,0.42)`);
        g.addColorStop(0.45,`hsla(${hue+35},80%,52%,0.20)`);
        g.addColorStop(1,"transparent");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(o.x,o.y,dr+70,0,Math.PI*2); ctx.fill();
      });

      const mhue = (t*30)%360;
      const pulse = 1 + Math.sin(t*4)*0.08;
      const og = ctx.createRadialGradient(mx,my,0,mx,my,420*pulse);
      og.addColorStop(0,`hsla(${mhue},90%,65%,0.30)`); og.addColorStop(0.35,`hsla(${(mhue+40)%360},85%,55%,0.18)`); og.addColorStop(1,"transparent");
      ctx.fillStyle=og; ctx.beginPath(); ctx.arc(mx,my,420*pulse,0,Math.PI*2); ctx.fill();

      particles.forEach(p => {
        p.y+=p.vy; p.x+=p.vx+Math.sin(t*1.2+p.phase)*0.3;
        if (p.y<-10) { p.y=h+10; p.x=Math.random()*w; }
        const a=p.alpha*(0.65+0.35*Math.sin(t*3.5+p.phase));
        const pg=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
        pg.addColorStop(0,`rgba(224,231,255,${a})`); pg.addColorStop(1,"transparent");
        ctx.fillStyle=pg; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2); ctx.fill();
      });

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { window.removeEventListener("resize",onResize); window.removeEventListener("mousemove",onMouse); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-[#040612]/20 backdrop-blur-[12px]" />
      <div className="absolute inset-0 bg-grid opacity-20 mix-blend-overlay" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NIGHT THEME 4 — Matrix Rain (animated)
───────────────────────────────────────────────────────────────────────────── */
export function ThemeMatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    const fontSize = 14;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; drops.length = 0; for (let i=0;i<Math.ceil(w/fontSize);i++) drops.push(Math.random()*h/fontSize*-1); };
    window.addEventListener("resize", onResize);

    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%";
    const cols = Math.ceil(w / fontSize);
    const drops: number[] = Array.from({ length: cols }, () => Math.random() * h / fontSize * -1);

    const render = () => {
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const y = drops[i] * fontSize;
        ctx.fillStyle = drops[i] > 0 && y < h * 0.05 ? "#ffffff" : `rgba(0,${200 + Math.random()*55},${70 + Math.random()*30},${0.8 + Math.random()*0.2})`;
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(char, i * fontSize, y);
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.5;
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { window.removeEventListener("resize", onResize); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <div className="absolute inset-0 bg-black" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-75" />
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NIGHT THEME 5 — Cosmic Fireflies (animated)
───────────────────────────────────────────────────────────────────────────── */
export function ThemeCosmicFireflies() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);

    const fireflies = Array.from({ length: 90 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 5 + 2,
      hue: Math.random() * 80 + 160,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 2 + 1,
    }));

    const t0 = performance.now();
    const render = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h));
      bg.addColorStop(0, "#080b1a"); bg.addColorStop(1, "#020308");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      for (let a = 0; a < fireflies.length; a++) {
        for (let b = a+1; b < fireflies.length; b++) {
          const fa = fireflies[a], fb = fireflies[b];
          const dx = fa.x - fb.x, dy = fa.y - fb.y;
          const dist = Math.sqrt(dx*dx+dy*dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(fa.x, fa.y); ctx.lineTo(fb.x, fb.y);
            ctx.strokeStyle = `rgba(100,150,255,${0.15*(1-dist/120)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }

      fireflies.forEach(f => {
        f.x += f.vx + Math.sin(t*0.7+f.phase)*0.3;
        f.y += f.vy + Math.cos(t*0.8+f.phase)*0.2;
        if (f.x < 0) f.x = w; if (f.x > w) f.x = 0;
        if (f.y < 0) f.y = h; if (f.y > h) f.y = 0;

        const pulse = 0.5 + 0.5*Math.sin(t*f.pulseSpeed+f.phase);
        const alpha = 0.4 + 0.6*pulse;
        const radius = f.r * (0.7 + 0.3*pulse);

        const ig = ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,radius);
        ig.addColorStop(0,`hsla(${f.hue},100%,90%,${alpha})`); ig.addColorStop(1,"transparent");
        ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(f.x,f.y,radius,0,Math.PI*2); ctx.fill();
      });

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { window.removeEventListener("resize", onResize); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-grid opacity-12 mix-blend-overlay" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NEW NIGHT THEME 6 — Cyberpunk Grid (animated holographic synthwave)
───────────────────────────────────────────────────────────────────────────── */
export function ThemeCyberpunkGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);

    const nodes = Array.from({ length: 45 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 3.5 + 1.5,
      vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
      hue: Math.random() > 0.5 ? 190 : 320,
    }));

    const t0 = performance.now();
    const render = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#070210"; ctx.fillRect(0, 0, w, h);

      const horizGlow = ctx.createLinearGradient(0, h * 0.5, 0, h * 0.8);
      horizGlow.addColorStop(0, "rgba(236, 72, 153, 0.22)");
      horizGlow.addColorStop(0.5, "rgba(6, 182, 212, 0.15)");
      horizGlow.addColorStop(1, "transparent");
      ctx.fillStyle = horizGlow; ctx.fillRect(0, h * 0.4, w, h * 0.6);

      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        g.addColorStop(0, `hsla(${n.hue}, 95%, 65%, 0.8)`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2); ctx.fill();
      });

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { window.removeEventListener("resize", onResize); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <div className="absolute inset-0 bg-[#070210]" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(236,72,153,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NEW NIGHT THEME 7 — Emerald Matrix Stream (animated)
───────────────────────────────────────────────────────────────────────────── */
export function ThemeEmeraldMatrix() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);

    const particles = Array.from({ length: 65 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 3 + 1,
      vy: Math.random() * 0.8 + 0.3,
      vx: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.7 + 0.3,
    }));

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#02120a"; ctx.fillRect(0, 0, w, h);

      particles.forEach((p) => {
        p.y += p.vy; p.x += p.vx;
        if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
        ctx.fillStyle = `rgba(16, 185, 129, ${p.alpha})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { window.removeEventListener("resize", onResize); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-b from-[#02120a] via-[#041a0f] to-[#010905]" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-grid opacity-15 mix-blend-overlay" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NEW NIGHT THEME 8 — Solar Corona Flare (animated volcanic gold)
───────────────────────────────────────────────────────────────────────────── */
export function ThemeSolarFlare() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);

    const embers = Array.from({ length: 55 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 3.5 + 1,
      vy: -(Math.random() * 0.5 + 0.2),
      vx: (Math.random() - 0.5) * 0.4,
      hue: Math.random() * 30 + 15,
    }));

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0c0402"; ctx.fillRect(0, 0, w, h);

      embers.forEach((e) => {
        e.y += e.vy; e.x += e.vx;
        if (e.y < -10) { e.y = h + 10; e.x = Math.random() * w; }
        ctx.fillStyle = `hsla(${e.hue}, 95%, 60%, 0.75)`;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
      });

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { window.removeEventListener("resize", onResize); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c0402] via-[#1a0803] to-[#080201]" />
      <div className="absolute top-0 right-1/4 h-[600px] w-[600px] rounded-full bg-amber-600/25 blur-[130px]" />
      <div className="absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-orange-700/20 blur-[110px]" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NEW NIGHT THEME 9 — Obsidian Glass (static)
───────────────────────────────────────────────────────────────────────────── */
export function ThemeObsidianGlass() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <div className="absolute inset-0 bg-[#05060b]" />
      <div className="absolute -top-32 left-1/3 h-[600px] w-[600px] rounded-full bg-indigo-950/40 blur-[140px]" />
      <div className="absolute bottom-0 right-10 h-[500px] w-[500px] rounded-full bg-slate-900/50 blur-[120px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NEW NIGHT THEME 10 — Velvet Night (static)
───────────────────────────────────────────────────────────────────────────── */
export function ThemeVelvetNight() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c061a] via-[#120926] to-[#080312]" />
      <div className="absolute top-1/4 -left-20 h-[650px] w-[650px] rounded-full bg-purple-900/35 blur-[140px]" />
      <div className="absolute bottom-10 -right-20 h-[550px] w-[550px] rounded-full bg-fuchsia-900/30 blur-[120px]" />
      <div className="absolute inset-0 bg-grid opacity-12 mix-blend-overlay" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DAY THEME 1 — Sunrise Dawn
───────────────────────────────────────────────────────────────────────────── */
export function ThemeDaySunriseDawn() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#fffbeb] via-[#fef3c7] to-[#f8fafc]" />
      <div className="absolute -top-32 -left-20 h-[650px] w-[650px] rounded-full bg-amber-300/40 blur-[130px]" />
      <div className="absolute top-1/4 -right-20 h-[550px] w-[550px] rounded-full bg-rose-200/50 blur-[120px]" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DAY THEME 2 — Sky Blue Breeze
───────────────────────────────────────────────────────────────────────────── */
export function ThemeDaySkyBreeze() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f8fafc]" />
      <div className="absolute -top-40 -left-20 h-[700px] w-[700px] rounded-full bg-sky-200/50 blur-[130px]" />
      <div className="absolute top-1/3 -right-20 h-[600px] w-[600px] rounded-full bg-blue-200/40 blur-[120px]" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DAY THEME 3 — Fresh Mint Garden
───────────────────────────────────────────────────────────────────────────── */
export function ThemeDayMintFresh() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ecfdf5] via-[#d1fae5] to-[#f8fafc]" />
      <div className="absolute -top-40 -left-20 h-[700px] w-[700px] rounded-full bg-emerald-200/40 blur-[130px]" />
      <div className="absolute top-1/4 -right-20 h-[600px] w-[600px] rounded-full bg-teal-200/50 blur-[120px]" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DAY THEME 4 — Sunset Pastel Glow
───────────────────────────────────────────────────────────────────────────── */
export function ThemeDaySunsetPastel() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#faf5ff] via-[#f3e8ff] to-[#fff1f2]" />
      <div className="absolute -top-40 -left-20 h-[700px] w-[700px] rounded-full bg-purple-200/45 blur-[130px]" />
      <div className="absolute top-1/4 -right-20 h-[600px] w-[600px] rounded-full bg-rose-200/45 blur-[120px]" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DAY THEME 5 — Cyber Light Matrix
───────────────────────────────────────────────────────────────────────────── */
export function ThemeDayCyberLight() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <div className="absolute inset-0 bg-[#f8fafc]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NEW DAY THEME 6 — Golden Hour Daylight (animated amber gold dust)
───────────────────────────────────────────────────────────────────────────── */
export function ThemeDayGoldenHour() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#fffbeb] via-[#fef3c7] to-[#fff8f0]" />
      <div className="absolute -top-20 left-1/4 h-[600px] w-[600px] rounded-full bg-amber-400/30 blur-[130px]" />
      <div className="absolute bottom-10 right-10 h-[500px] w-[500px] rounded-full bg-orange-300/35 blur-[110px]" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NEW DAY THEME 7 — Nordic Frost (Icy blue arctic glass)
───────────────────────────────────────────────────────────────────────────── */
export function ThemeDayNordicFrost() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0fdfa] via-[#ccfbf1] to-[#f8fafc]" />
      <div className="absolute -top-30 -left-10 h-[650px] w-[650px] rounded-full bg-cyan-200/45 blur-[130px]" />
      <div className="absolute bottom-0 right-1/4 h-[550px] w-[550px] rounded-full bg-teal-100/60 blur-[110px]" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   NEW DAY THEME 8 — Minimal Titanium Silver (minimal corporate slate)
───────────────────────────────────────────────────────────────────────────── */
export function ThemeDayMinimalTitanium() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      <div className="absolute inset-0 bg-[#f1f5f9]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  );
}
