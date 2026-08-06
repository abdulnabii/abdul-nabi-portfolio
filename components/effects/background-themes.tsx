"use client";

import React, { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   STATIC THEME 1 — Deep Space Nebula (blur image)
───────────────────────────────────────────────────────────────────────────── */
export function ThemeDeepSpaceNebula() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[#030511]" />
      {/* Nebula orbs */}
      <div className="absolute -top-40 -left-20 h-[700px] w-[700px] rounded-full bg-indigo-900/40 blur-[120px]" />
      <div className="absolute top-1/3 right-0 h-[600px] w-[600px] rounded-full bg-violet-900/35 blur-[100px]" />
      <div className="absolute -bottom-20 left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-900/30 blur-[100px]" />
      <div className="absolute top-1/2 left-1/4 h-[400px] w-[400px] rounded-full bg-purple-900/25 blur-[80px]" />
      {/* Star field */}
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
      {/* Technical grid */}
      <div className="absolute inset-0 bg-grid opacity-15 mix-blend-overlay" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   STATIC THEME 2 — Midnight Aurora (blur image)
───────────────────────────────────────────────────────────────────────────── */
export function ThemeMidnightAurora() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      {/* Dark forest base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#010a08] via-[#050d12] to-[#020808]" />
      {/* Aurora layers */}
      <div className="absolute top-0 left-0 w-full h-[55%] bg-gradient-to-b from-emerald-900/50 via-teal-900/30 to-transparent blur-[60px]" />
      <div className="absolute top-0 left-0 w-full h-[45%] bg-gradient-to-r from-transparent via-cyan-800/25 to-transparent blur-[80px]" />
      <div className="absolute top-0 right-0 w-1/2 h-[60%] bg-gradient-to-bl from-violet-900/30 to-transparent blur-[90px]" />
      {/* Northern lights ribbons */}
      <div className="absolute top-[5%] left-[-10%] w-[120%] h-[220px] bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent blur-[30px] rotate-[-3deg]" />
      <div className="absolute top-[18%] left-[-10%] w-[120%] h-[180px] bg-gradient-to-r from-transparent via-teal-400/12 to-transparent blur-[35px] rotate-[2deg]" />
      <div className="absolute top-[30%] left-[-10%] w-[120%] h-[150px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent blur-[40px] rotate-[-1deg]" />
      {/* Terrain silhouette */}
      <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-[#010a08] to-transparent" />
      {/* Reflection shimmer */}
      <div className="absolute bottom-[15%] left-[10%] w-[80%] h-[100px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent blur-[20px] rotate-[1deg]" />
      <div className="absolute inset-0 bg-grid opacity-10 mix-blend-overlay" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATED THEME 1 — Quantum Plasma (canvas: interactive mouse glow + particles)
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

    interface Trail { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; r: number; hue: number; }
    const trail: Trail[] = [];
    let mx = w / 2, my = h / 2, tmx = w / 2, tmy = h / 2, lastSpawn = 0;
    const onMouse = (e: MouseEvent) => {
      tmx = e.clientX; tmy = e.clientY;
      const now = performance.now();
      if (now - lastSpawn > 25) {
        lastSpawn = now;
        trail.push({ x: e.clientX, y: e.clientY, vx: (Math.random()-0.5)*1.5, vy: (Math.random()-0.5)*1.5-0.5, life: 1, maxLife: Math.random()*25+20, r: Math.random()*3.5+1.5, hue: (Math.random()*60+200)%360 });
      }
    };
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
      og.addColorStop(0,`hsla(${mhue},90%,65%,0.30)`); og.addColorStop(0.35,`hsla(${(mhue+40)%360},85%,55%,0.18)`); og.addColorStop(0.7,`hsla(${(mhue+90)%360},80%,45%,0.07)`); og.addColorStop(1,"transparent");
      ctx.fillStyle=og; ctx.beginPath(); ctx.arc(mx,my,420*pulse,0,Math.PI*2); ctx.fill();
      const ig = ctx.createRadialGradient(mx,my,0,mx,my,140);
      ig.addColorStop(0,"rgba(255,255,255,0.45)"); ig.addColorStop(0.3,`hsla(${mhue},95%,70%,0.35)`); ig.addColorStop(1,"transparent");
      ctx.fillStyle=ig; ctx.beginPath(); ctx.arc(mx,my,140,0,Math.PI*2); ctx.fill();

      ctx.save();
      for (let wv=0;wv<4;wv++) {
        ctx.beginPath(); ctx.lineWidth=2.5;
        ctx.strokeStyle=`hsla(${(210+wv*45+t*12)%360},85%,68%,0.22)`;
        const sy=h*(0.2+wv*0.22); ctx.moveTo(0,sy);
        for (let x=0;x<=w;x+=25) ctx.lineTo(x,sy+Math.sin(x*0.0035+t*1.8+wv)*50+Math.cos(x*0.0022-t*1.3)*35);
        ctx.stroke();
      }
      ctx.restore();

      particles.forEach(p => {
        const dx=mx-p.x, dy=my-p.y, dist=Math.sqrt(dx*dx+dy*dy);
        if (dist<260&&dist>1) { const pull=(1-dist/260)*0.4; p.x+=(dx/dist)*pull; p.y+=(dy/dist)*pull; }
        p.y+=p.vy; p.x+=p.vx+Math.sin(t*1.2+p.phase)*0.3;
        if (p.y<-10) { p.y=h+10; p.x=Math.random()*w; }
        if (p.x<-10) p.x=w+10; if (p.x>w+10) p.x=-10;
        const a=p.alpha*(0.65+0.35*Math.sin(t*3.5+p.phase));
        const pg=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
        pg.addColorStop(0,`rgba(224,231,255,${a})`); pg.addColorStop(0.5,`rgba(129,140,248,${a*0.5})`); pg.addColorStop(1,"transparent");
        ctx.fillStyle=pg; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2); ctx.fill();
      });

      for (let i=trail.length-1;i>=0;i--) {
        const tp=trail[i]; tp.x+=tp.vx; tp.y+=tp.vy; tp.life++;
        const lr=1-tp.life/tp.maxLife;
        if (lr<=0) { trail.splice(i,1); continue; }
        const tg=ctx.createRadialGradient(tp.x,tp.y,0,tp.x,tp.y,tp.r*2.5);
        tg.addColorStop(0,`hsla(${tp.hue},90%,75%,${lr*0.8})`); tg.addColorStop(0.6,`hsla(${tp.hue+30},80%,60%,${lr*0.4})`); tg.addColorStop(1,"transparent");
        ctx.fillStyle=tg; ctx.beginPath(); ctx.arc(tp.x,tp.y,tp.r*2.5*lr,0,Math.PI*2); ctx.fill();
      }

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
   ANIMATED THEME 2 — Matrix Rain (canvas: falling green code)
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
        // Bright head
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
   ANIMATED THEME 3 — Cosmic Fireflies (canvas: glowing floating orbs)
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
      hue: Math.random() * 80 + 160, // cyan-violet range
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 2 + 1,
      trailX: [] as number[], trailY: [] as number[],
    }));

    const t0 = performance.now();
    const render = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);

      // Starfield base
      const bg = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h));
      bg.addColorStop(0, "#080b1a"); bg.addColorStop(1, "#020308");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      // Connection lines
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

        // Outer glow
        const og = ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,radius*8);
        og.addColorStop(0,`hsla(${f.hue},90%,70%,${alpha*0.3})`);
        og.addColorStop(1,"transparent");
        ctx.fillStyle = og; ctx.beginPath(); ctx.arc(f.x,f.y,radius*8,0,Math.PI*2); ctx.fill();

        // Core
        const ig = ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,radius);
        ig.addColorStop(0,`hsla(${f.hue},100%,90%,${alpha})`);
        ig.addColorStop(0.5,`hsla(${f.hue},90%,65%,${alpha*0.6})`);
        ig.addColorStop(1,"transparent");
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
