import { NextRequest, NextResponse } from "next/server";
import { INITIAL_MINI_PROJECTS } from "@/lib/mini-projects-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dayStr = searchParams.get("day") || "1";
  const dayNum = parseInt(dayStr, 10) || 1;

  const project =
    INITIAL_MINI_PROJECTS.find((p) => p.dayNumber === dayNum) ||
    INITIAL_MINI_PROJECTS[0];

  const title = project.title;
  const category = project.category;
  const desc = project.description.slice(0, 110) + "...";
  const tags = project.tags.join(" • ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#030712" />
        <stop offset="50%" stop-color="#090d1f" />
        <stop offset="100%" stop-color="#050814" />
      </linearGradient>
      <linearGradient id="cardGrad" x1="0" y1="0" x2="1100" y2="480" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="rgba(30, 41, 59, 0.7)" />
        <stop offset="100%" stop-color="rgba(15, 23, 42, 0.85)" />
      </linearGradient>
      <linearGradient id="accentGrad" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#818cf8" />
        <stop offset="50%" stop-color="#c084fc" />
        <stop offset="100%" stop-color="#38bdf8" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="15" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bgGrad)" />

    <!-- Ambient Glow Orbs -->
    <circle cx="200" cy="150" r="280" fill="#4f46e5" opacity="0.15" filter="url(#glow)" />
    <circle cx="1000" cy="450" r="250" fill="#9333ea" opacity="0.15" filter="url(#glow)" />
    <circle cx="600" cy="550" r="200" fill="#0284c7" opacity="0.12" filter="url(#glow)" />

    <!-- Grid lines -->
    <g opacity="0.08" stroke="#ffffff" stroke-width="1">
      <line x1="0" y1="100" x2="1200" y2="100" />
      <line x1="0" y1="200" x2="1200" y2="200" />
      <line x1="0" y1="300" x2="1200" y2="300" />
      <line x1="0" y1="400" x2="1200" y2="400" />
      <line x1="0" y1="500" x2="1200" y2="500" />
      <line x1="200" y1="0" x2="200" y2="630" />
      <line x1="400" y1="0" x2="400" y2="630" />
      <line x1="600" y1="0" x2="600" y2="630" />
      <line x1="800" y1="0" x2="800" y2="630" />
      <line x1="1000" y1="0" x2="1000" y2="630" />
    </g>

    <!-- Main Dashboard Window Mockup -->
    <rect x="50" y="50" width="1100" height="530" rx="24" fill="url(#cardGrad)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.5" />

    <!-- Window Header Bar -->
    <rect x="50" y="50" width="1100" height="50" rx="24" fill="rgba(15, 23, 42, 0.9)" />
    <line x1="50" y1="100" x2="1150" y2="100" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />

    <!-- Traffic Lights -->
    <circle cx="85" cy="75" r="7" fill="#ef4444" />
    <circle cx="107" cy="75" r="7" fill="#f59e0b" />
    <circle cx="129" cy="75" r="7" fill="#10b981" />

    <!-- Window URL Bar -->
    <rect x="350" y="63" width="500" height="24" rx="8" fill="rgba(0, 0, 0, 0.4)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />
    <text x="600" y="79" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12" font-weight="500" text-anchor="middle">
      🔒 https://day-${String(dayNum).padStart(2, "0")}.aiwithab.site
    </text>

    <!-- Project Badge -->
    <rect x="90" y="140" width="160" height="32" rx="16" fill="rgba(79, 70, 229, 0.2)" stroke="rgba(129, 140, 248, 0.4)" stroke-width="1" />
    <text x="170" y="161" fill="#c7d2fe" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="middle">
      DAY ${String(dayNum).padStart(2, "0")} OF 30
    </text>

    <!-- Category Badge -->
    <rect x="265" y="140" width="180" height="32" rx="16" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(52, 211, 153, 0.4)" stroke-width="1" />
    <text x="355" y="161" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="middle">
      🟢 ${category.toUpperCase()}
    </text>

    <!-- Main Title -->
    <text x="90" y="235" fill="url(#accentGrad)" font-family="system-ui, sans-serif" font-size="38" font-weight="900" letter-spacing="-0.5">
      ${escapeXml(title)}
    </text>

    <!-- Subtitle Description -->
    <text x="90" y="280" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="18" font-weight="400">
      ${escapeXml(desc)}
    </text>

    <!-- Inner Live Dashboard UI Card Panel -->
    <rect x="90" y="320" width="1020" height="190" rx="16" fill="rgba(3, 7, 18, 0.6)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />

    <!-- Stat Metric Box 1 -->
    <rect x="120" y="345" width="280" height="140" rx="12" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(99, 102, 241, 0.3)" stroke-width="1" />
    <text x="140" y="375" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13" font-weight="600">LIVE AI TELEMETRY</text>
    <text x="140" y="420" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="32" font-weight="800">99.4%</text>
    <text x="140" y="455" fill="#10b981" font-family="system-ui, sans-serif" font-size="12" font-weight="600">🟢 Model Confidence Verified</text>

    <!-- Stat Metric Box 2 -->
    <rect x="420" y="345" width="310" height="140" rx="12" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(168, 85, 247, 0.3)" stroke-width="1" />
    <text x="440" y="375" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13" font-weight="600">TECH STACK ARCHITECTURE</text>
    <text x="440" y="415" fill="#e2e8f0" font-family="monospace" font-size="14" font-weight="600">${escapeXml(tags)}</text>
    <text x="440" y="455" fill="#c084fc" font-family="system-ui, sans-serif" font-size="12" font-weight="600">⚡ Next.js 16 + Serverless Edge</text>

    <!-- Stat Metric Box 3 -->
    <rect x="750" y="345" width="330" height="140" rx="12" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(236, 72, 153, 0.3)" stroke-width="1" />
    <text x="770" y="375" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13" font-weight="600">DEPLOYMENT STATUS</text>
    <text x="770" y="420" fill="#f43f5e" font-family="system-ui, sans-serif" font-size="26" font-weight="800">PRODUCTION LIVE</text>
    <text x="770" y="455" fill="#f472b6" font-family="system-ui, sans-serif" font-size="12" font-weight="600">🚀 Deployed on Vercel Sub-Domain</text>

    <!-- Footer Branding -->
    <text x="600" y="550" fill="#64748b" font-family="system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle">
      Built by Abdul Nabi • Full-Stack Software & AI Engineer | https://www.aiwithab.site
    </text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
