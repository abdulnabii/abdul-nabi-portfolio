"use client";

import React, { useEffect, useRef } from "react";

/**
 * Quantum Light Wave & Floating Particle Field Background.
 * Renders real-time 60-120 FPS undulating liquid aurora waves, floating glowing particle nodes,
 * and interactive cursor spotlight refraction.
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
      { x: width * 0.2, y: height * 0.25, vx: 0.6, vy: 0.35, radius: 480, hue: 235 },
      { x: width * 0.8, y: height * 0.35, vx: -0.55, vy: 0.45, radius: 440, hue: 190 },
      { x: width * 0.55, y: height * 0.75, vx: 0.45, vy: -0.65, radius: 520, hue: 275 },
      { x: width * 0.15, y: height * 0.85, vx: -0.35, vy: -0.45, radius: 420, hue: 325 },
    ];

    // Floating quantum particles
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.8,
      vy: -(Math.random() * 0.35 + 0.15),
      vx: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.6 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      // Smooth mouse inertia
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // 1. Deep space base gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#030511");
      bgGrad.addColorStop(0.5, "#060919");
      bgGrad.addColorStop(1, "#030511");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Render morphing aurora orbs
      orbs.forEach((orb, i) => {
        orb.x += orb.vx + Math.sin(elapsed * 0.8 + i) * 0.65;
        orb.y += orb.vy + Math.cos(elapsed * 0.7 + i) * 0.65;

        if (orb.x < -180 || orb.x > width + 180) orb.vx *= -1;
        if (orb.y < -180 || orb.y > height + 180) orb.vy *= -1;

        const currentHue = (orb.hue + elapsed * 15) % 360;
        const dynamicRadius = orb.radius + Math.sin(elapsed * 2.2 + i * 1.6) * 50;

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          dynamicRadius
        );

        gradient.addColorStop(0, `hsla(${currentHue}, 88%, 64%, 0.38)`);
        gradient.addColorStop(0.4, `hsla(${currentHue + 30}, 78%, 50%, 0.18)`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, dynamicRadius + 70, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Interactive cursor glowing spotlight
      const mouseGrad = ctx.createRadialGradient(
        mouseX,
        mouseY,
        0,
        mouseX,
        mouseY,
        350
      );
      mouseGrad.addColorStop(0, "rgba(99, 102, 241, 0.22)");
      mouseGrad.addColorStop(0.5, "rgba(34, 211, 238, 0.08)");
      mouseGrad.addColorStop(1, "transparent");
      ctx.fillStyle = mouseGrad;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 350, 0, Math.PI * 2);
      ctx.fill();

      // 4. Undulating liquid light wave ribbons
      ctx.save();
      ctx.lineWidth = 2;
      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        const waveHue = (220 + w * 40 + elapsed * 10) % 360;
        ctx.strokeStyle = `hsla(${waveHue}, 80%, 65%, 0.08)`;

        const startY = height * (0.3 + w * 0.25);
        ctx.moveTo(0, startY);

        for (let x = 0; x <= width; x += 30) {
          const y =
            startY +
            Math.sin(x * 0.003 + elapsed * 1.5 + w) * 45 +
            Math.cos(x * 0.002 - elapsed * 1.1) * 30;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();

      // 5. Floating twinkling quantum particles
      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(elapsed + p.phase) * 0.2;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const twinklingAlpha =
          p.alpha * (0.6 + 0.4 * Math.sin(elapsed * 3 + p.phase));

        ctx.fillStyle = `rgba(224, 231, 255, ${twinklingAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

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
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-95" />
      {/* Frosted Glass Overlay for Liquid Mesh Diffusion */}
      <div className="absolute inset-0 bg-[#040612]/30 backdrop-blur-[70px]" />
      {/* Low-Opacity Technical Grid Overlay */}
      <div className="absolute inset-0 bg-grid opacity-20 mix-blend-overlay" />
    </div>
  );
}

export function GlassBackground() {
  return <AnimatedGlassBackground />;
}
