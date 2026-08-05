"use client";

import React, { useEffect, useRef } from "react";

/**
 * Continuous Millisecond-Precision Animated Liquid Glass Aurora Background.
 * Powered by requestAnimationFrame for real-time 60-120 FPS canvas gradient morphing,
 * dynamic hue shifting, and organic mouse light attraction.
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

    // 4 Dynamic glowing orbs that drift and shift hues on every frame (ms-level animation)
    const orbs = [
      { x: width * 0.25, y: height * 0.25, vx: 0.7, vy: 0.4, radius: 460, hue: 240 },
      { x: width * 0.75, y: height * 0.3, vx: -0.6, vy: 0.5, radius: 420, hue: 190 },
      { x: width * 0.5, y: height * 0.75, vx: 0.5, vy: -0.7, radius: 500, hue: 270 },
      { x: width * 0.15, y: height * 0.8, vx: -0.4, vy: -0.5, radius: 400, hue: 320 },
    ];

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      ctx.clearRect(0, 0, width, height);

      // Deep rich ambient dark background base
      ctx.fillStyle = "#040612";
      ctx.fillRect(0, 0, width, height);

      orbs.forEach((orb, i) => {
        // Move orbs continuously every millisecond frame
        orb.x += orb.vx + Math.sin(elapsed * 0.9 + i) * 0.6;
        orb.y += orb.vy + Math.cos(elapsed * 0.8 + i) * 0.6;

        // Bounce smoothly off boundaries
        if (orb.x < -150 || orb.x > width + 150) orb.vx *= -1;
        if (orb.y < -150 || orb.y > height + 150) orb.vy *= -1;

        // Gentle interactive mouse attraction
        const dx = mouseX - orb.x;
        const dy = mouseY - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 450) {
          orb.x += (dx / dist) * 0.4;
          orb.y += (dy / dist) * 0.4;
        }

        // Morph color hues dynamically every millisecond
        const currentHue = (orb.hue + elapsed * 14) % 360;
        const dynamicRadius = orb.radius + Math.sin(elapsed * 2.5 + i * 1.5) * 45;

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          dynamicRadius
        );

        gradient.addColorStop(0, `hsla(${currentHue}, 85%, 62%, 0.35)`);
        gradient.addColorStop(0.45, `hsla(${currentHue + 35}, 75%, 48%, 0.16)`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, dynamicRadius + 60, 0, Math.PI * 2);
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
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-90" />
      {/* Frosted Glass Overlay for Liquid Mesh Diffusion */}
      <div className="absolute inset-0 bg-[#050814]/35 backdrop-blur-[65px]" />
      {/* Low-Opacity Technical Grid Overlay */}
      <div className="absolute inset-0 bg-grid opacity-20 mix-blend-overlay" />
    </div>
  );
}

export function GlassBackground() {
  return <AnimatedGlassBackground />;
}
