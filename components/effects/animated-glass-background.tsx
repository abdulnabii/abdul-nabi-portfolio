"use client";

import React, { useEffect, useRef } from "react";

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  hue: number;
}

/**
 * Quantum Light Wave & Interactive Plasma Mouse Glow Background.
 * Features multi-layer color-shifting cursor plasma halo, magnetic particle attraction field,
 * dynamic mouse spark trails, and undulating liquid aurora ribbons.
 */
export function AnimatedGlassBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Dynamic morphing glowing orbs
    const orbs = [
      { x: width * 0.2, y: height * 0.25, vx: 0.7, vy: 0.4, radius: 480, hue: 235 },
      { x: width * 0.8, y: height * 0.35, vx: -0.65, vy: 0.5, radius: 440, hue: 190 },
      { x: width * 0.55, y: height * 0.75, vx: 0.5, vy: -0.7, radius: 520, hue: 275 },
      { x: width * 0.15, y: height * 0.85, vx: -0.4, vy: -0.5, radius: 420, hue: 325 },
    ];

    // Floating quantum particles (glowing data nodes)
    const particleCount = 60;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 3 + 1.2,
      vy: -(Math.random() * 0.45 + 0.2),
      vx: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.65 + 0.35,
      phase: Math.random() * Math.PI * 2,
    }));

    // Dynamic mouse spark trails
    const trail: TrailParticle[] = [];

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;
    let lastSpawnTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;

      const now = performance.now();
      if (now - lastSpawnTime > 25) {
        lastSpawnTime = now;
        trail.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          life: 1,
          maxLife: Math.random() * 25 + 20,
          radius: Math.random() * 3.5 + 1.5,
          hue: (Math.random() * 60 + 200) % 360,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    let startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      // Smooth mouse inertia
      const dxMouse = targetMouseX - mouseX;
      const dyMouse = targetMouseY - mouseY;
      mouseX += dxMouse * 0.1;
      mouseY += dyMouse * 0.1;

      ctx.clearRect(0, 0, width, height);

      // 1. Deep space base gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#030511");
      bgGrad.addColorStop(0.5, "#060918");
      bgGrad.addColorStop(1, "#030511");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Render morphing aurora background orbs
      orbs.forEach((orb, i) => {
        orb.x += orb.vx + Math.sin(elapsed * 0.9 + i) * 0.75;
        orb.y += orb.vy + Math.cos(elapsed * 0.8 + i) * 0.75;

        if (orb.x < -180 || orb.x > width + 180) orb.vx *= -1;
        if (orb.y < -180 || orb.y > height + 180) orb.vy *= -1;

        const currentHue = (orb.hue + elapsed * 16) % 360;
        const dynamicRadius = orb.radius + Math.sin(elapsed * 2.4 + i * 1.6) * 55;

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          dynamicRadius
        );

        gradient.addColorStop(0, `hsla(${currentHue}, 90%, 65%, 0.42)`);
        gradient.addColorStop(0.45, `hsla(${currentHue + 35}, 80%, 52%, 0.20)`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, dynamicRadius + 70, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Multi-Layer Color-Shifting Cyber Plasma Mouse Glow Halo
      const mouseHue = (elapsed * 30) % 360;
      const pulseFactor = 1 + Math.sin(elapsed * 4) * 0.08;

      // Outer Plasma Glow Aura
      const outerMouseGrad = ctx.createRadialGradient(
        mouseX,
        mouseY,
        0,
        mouseX,
        mouseY,
        420 * pulseFactor
      );
      outerMouseGrad.addColorStop(0, `hsla(${mouseHue}, 90%, 65%, 0.30)`);
      outerMouseGrad.addColorStop(0.35, `hsla(${(mouseHue + 40) % 360}, 85%, 55%, 0.18)`);
      outerMouseGrad.addColorStop(0.7, `hsla(${(mouseHue + 90) % 360}, 80%, 45%, 0.07)`);
      outerMouseGrad.addColorStop(1, "transparent");

      ctx.fillStyle = outerMouseGrad;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 420 * pulseFactor, 0, Math.PI * 2);
      ctx.fill();

      // Inner Sharp Plasma Core Ring
      const innerCoreGrad = ctx.createRadialGradient(
        mouseX,
        mouseY,
        0,
        mouseX,
        mouseY,
        140
      );
      innerCoreGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
      innerCoreGrad.addColorStop(0.3, `hsla(${mouseHue}, 95%, 70%, 0.35)`);
      innerCoreGrad.addColorStop(1, "transparent");

      ctx.fillStyle = innerCoreGrad;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 140, 0, Math.PI * 2);
      ctx.fill();

      // 4. Undulating liquid light wave ribbons
      ctx.save();
      for (let w = 0; w < 4; w++) {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        const waveHue = (210 + w * 45 + elapsed * 12) % 360;
        ctx.strokeStyle = `hsla(${waveHue}, 85%, 68%, 0.22)`;

        const startY = height * (0.2 + w * 0.22);
        ctx.moveTo(0, startY);

        for (let x = 0; x <= width; x += 25) {
          const y =
            startY +
            Math.sin(x * 0.0035 + elapsed * 1.8 + w) * 50 +
            Math.cos(x * 0.0022 - elapsed * 1.3) * 35;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();

      // 5. Floating quantum particles with cursor magnetic field attraction
      particles.forEach((p) => {
        // Magnetic attraction to cursor
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 260 && dist > 1) {
          const pull = (1 - dist / 260) * 0.4;
          p.x += (dx / dist) * pull;
          p.y += (dy / dist) * pull;
        }

        p.y += p.vy;
        p.x += p.vx + Math.sin(elapsed * 1.2 + p.phase) * 0.3;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const twinklingAlpha =
          p.alpha * (0.65 + 0.35 * Math.sin(elapsed * 3.5 + p.phase));

        const particleGrad = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius * 3
        );
        particleGrad.addColorStop(0, `rgba(224, 231, 255, ${twinklingAlpha})`);
        particleGrad.addColorStop(0.5, `rgba(129, 140, 248, ${twinklingAlpha * 0.5})`);
        particleGrad.addColorStop(1, "transparent");

        ctx.fillStyle = particleGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // 6. Interactive Mouse Spark Particle Trails
      for (let i = trail.length - 1; i >= 0; i--) {
        const tp = trail[i];
        tp.x += tp.vx;
        tp.y += tp.vy;
        tp.life++;

        const lifeRatio = 1 - tp.life / tp.maxLife;
        if (lifeRatio <= 0) {
          trail.splice(i, 1);
          continue;
        }

        const trailGrad = ctx.createRadialGradient(
          tp.x,
          tp.y,
          0,
          tp.x,
          tp.y,
          tp.radius * 2.5
        );
        trailGrad.addColorStop(0, `hsla(${tp.hue}, 90%, 75%, ${lifeRatio * 0.8})`);
        trailGrad.addColorStop(0.6, `hsla(${tp.hue + 30}, 80%, 60%, ${lifeRatio * 0.4})`);
        trailGrad.addColorStop(1, "transparent");

        ctx.fillStyle = trailGrad;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, tp.radius * 2.5 * lifeRatio, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-100" />
      {/* Light Frosted Glass Diffusion Overlay */}
      <div className="absolute inset-0 bg-[#040612]/20 backdrop-blur-[12px]" />
      {/* Low-Opacity Technical Grid Overlay */}
      <div className="absolute inset-0 bg-grid opacity-25 mix-blend-overlay" />
    </div>
  );
}

export function GlassBackground() {
  return <AnimatedGlassBackground />;
}
