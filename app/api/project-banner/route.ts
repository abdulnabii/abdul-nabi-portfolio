import { NextRequest, NextResponse } from "next/server";
import { INITIAL_MINI_PROJECTS } from "@/lib/mini-projects-store";

export const dynamic = "force-dynamic";

// ─── Per-project theme config ─────────────────────────────────────────────────
interface ProjectTheme {
  accent1: string;
  accent2: string;
  accent3: string;
  glow1: string;
  glow2: string;
  glow3: string;
  stat1Label: string;
  stat1Value: string;
  stat1Sub: string;
  stat1Color: string;
  stat2Label: string;
  stat2Value: string;
  stat2Sub: string;
  stat2Color: string;
  stat3Label: string;
  stat3Value: string;
  stat3Sub: string;
  stat3Color: string;
  emoji: string;
  uiMockup: string;
}

function getProjectTheme(dayNum: number, tags: string[]): ProjectTheme {
  const defaults: ProjectTheme = {
    accent1: "#818cf8", accent2: "#c084fc", accent3: "#38bdf8",
    glow1: "#4f46e5", glow2: "#9333ea", glow3: "#0284c7",
    stat1Label: "AI MODEL STATUS", stat1Value: "99.4%", stat1Sub: "🟢 Model Confidence", stat1Color: "#38bdf8",
    stat2Label: "TECH STACK", stat2Value: tags[0] || "Next.js", stat2Sub: "⚡ Serverless Edge Functions", stat2Color: "#c084fc",
    stat3Label: "DEPLOYMENT", stat3Value: "LIVE ✓", stat3Sub: "🚀 Vercel Global CDN", stat3Color: "#f472b6",
    emoji: "🤖",
    uiMockup: "",
  };

  const themes: Record<number, Partial<ProjectTheme>> = {
    1: { // Healthcare AI – greens & teals
      accent1: "#34d399", accent2: "#06b6d4", accent3: "#a3e635",
      glow1: "#059669", glow2: "#0891b2", glow3: "#65a30d",
      stat1Label: "TRIAGE ACCURACY", stat1Value: "94.7%", stat1Sub: "🟢 WHO Risk Classifier Active",
      stat1Color: "#34d399",
      stat2Label: "CONDITIONS SCANNED", stat2Value: "247+", stat2Sub: "💊 OWASP Medical DB Integrated",
      stat2Color: "#06b6d4",
      stat3Label: "EMERGENCY ALERTS", stat3Value: "ACTIVE", stat3Sub: "🚨 Real-Time Triage Engine", stat3Color: "#f87171",
      emoji: "🩺",
    },
    2: { // Code Review – orange & amber
      accent1: "#fb923c", accent2: "#f59e0b", accent3: "#fde68a",
      glow1: "#ea580c", glow2: "#d97706", glow3: "#b45309",
      stat1Label: "VULNERABILITIES FOUND", stat1Value: "0 Critical", stat1Sub: "🟢 OWASP Top-10 Scanned",
      stat1Color: "#fb923c",
      stat2Label: "CODE QUALITY SCORE", stat2Value: "A+ 98", stat2Sub: "⚡ Static Analysis + AST Parser",
      stat2Color: "#f59e0b",
      stat3Label: "SCAN STATUS", stat3Value: "PASSED", stat3Sub: "🔐 Security Audit Complete", stat3Color: "#4ade80",
      emoji: "🔐",
    },
    3: { // Resume Builder – violet & rose
      accent1: "#c084fc", accent2: "#f472b6", accent3: "#e879f9",
      glow1: "#7c3aed", glow2: "#be185d", glow3: "#a21caf",
      stat1Label: "ATS MATCH SCORE", stat1Value: "96/100", stat1Sub: "🟢 Keyword Density Optimal",
      stat1Color: "#c084fc",
      stat2Label: "RESUME GENERATED", stat2Value: "PDF Ready", stat2Sub: "📄 3 Templates Available",
      stat2Color: "#f472b6",
      stat3Label: "JOB FIT ANALYSIS", stat3Value: "TOP 5%", stat3Sub: "🚀 AI-Optimized Resume", stat3Color: "#a78bfa",
      emoji: "📄",
    },
    4: { // Diabetes Risk – red & health orange
      accent1: "#f87171", accent2: "#fb923c", accent3: "#fbbf24",
      glow1: "#dc2626", glow2: "#ea580c", glow3: "#d97706",
      stat1Label: "DIABETES RISK SCORE", stat1Value: "23% Low", stat1Sub: "🟢 ElasticNet ML Inference",
      stat1Color: "#4ade80",
      stat2Label: "VITALS ANALYZED", stat2Value: "6 Inputs", stat2Sub: "💉 Glucose, BMI, BP, Insulin",
      stat2Color: "#fb923c",
      stat3Label: "CLINICAL CONFIDENCE", stat3Value: "94.2%", stat3Sub: "📊 scikit-learn Trained Model", stat3Color: "#f87171",
      emoji: "💉",
    },
    5: { // Meeting Summarizer – blue & sky
      accent1: "#60a5fa", accent2: "#38bdf8", accent3: "#a5f3fc",
      glow1: "#2563eb", glow2: "#0284c7", glow3: "#0e7490",
      stat1Label: "TRANSCRIPT PROCESSED", stat1Value: "8,432 words", stat1Sub: "🟢 Whisper STT Complete",
      stat1Color: "#60a5fa",
      stat2Label: "ACTION ITEMS FOUND", stat2Value: "14 Tasks", stat2Sub: "📋 Owners & Deadlines Assigned",
      stat2Color: "#38bdf8",
      stat3Label: "SUMMARY QUALITY", stat3Value: "EXECUTIVE", stat3Sub: "📧 Notion Export Ready", stat3Color: "#a5f3fc",
      emoji: "🎙️",
    },
    6: { // Stock Dashboard – green trading terminal
      accent1: "#4ade80", accent2: "#22d3ee", accent3: "#fbbf24",
      glow1: "#16a34a", glow2: "#0e7490", glow3: "#b45309",
      stat1Label: "LIVE PORTFOLIO", stat1Value: "+4.32%", stat1Sub: "🟢 WebSocket Feed Active",
      stat1Color: "#4ade80",
      stat2Label: "RSI / MACD", stat2Value: "72 / Bull", stat2Sub: "📈 Bollinger Bands Overlay",
      stat2Color: "#22d3ee",
      stat3Label: "SENTIMENT SCORE", stat3Value: "BULLISH", stat3Sub: "🤖 AI News Sentiment Active", stat3Color: "#fbbf24",
      emoji: "📈",
    },
    7: { // Logo Generator – creative purple/pink
      accent1: "#e879f9", accent2: "#f472b6", accent3: "#c084fc",
      glow1: "#a21caf", glow2: "#be185d", glow3: "#7c3aed",
      stat1Label: "BRAND ASSETS CREATED", stat1Value: "12 Files", stat1Sub: "🎨 SVG + PNG + Brand Guide",
      stat1Color: "#e879f9",
      stat2Label: "COLOR PALETTES", stat2Value: "5 Moods", stat2Sub: "🖌️ Minimalist / Bold / Playful",
      stat2Color: "#f472b6",
      stat3Label: "LOGO STYLE", stat3Value: "EXPORTED", stat3Sub: "✨ SDXL via Replicate API", stat3Color: "#c084fc",
      emoji: "🎨",
    },
    8: { // Expense Tracker – emerald & lime
      accent1: "#34d399", accent2: "#a3e635", accent3: "#fbbf24",
      glow1: "#059669", glow2: "#65a30d", glow3: "#d97706",
      stat1Label: "MONTHLY SAVINGS", stat1Value: "$847.20", stat1Sub: "🟢 Budget Alerts Active",
      stat1Color: "#34d399",
      stat2Label: "RECEIPTS SCANNED", stat2Value: "43 Items", stat2Sub: "📷 Tesseract OCR Extracted",
      stat2Color: "#a3e635",
      stat3Label: "SPENDING INSIGHT", stat3Value: "ON TRACK", stat3Sub: "💡 AI Coach Recommendation", stat3Color: "#fbbf24",
      emoji: "💳",
    },
    9: { // GitHub Analyzer – dev slate & orange
      accent1: "#f97316", accent2: "#fb923c", accent3: "#fbbf24",
      glow1: "#ea580c", glow2: "#d97706", glow3: "#b45309",
      stat1Label: "REPOS ANALYZED", stat1Value: "47 Public", stat1Sub: "🟢 GitHub REST API Live",
      stat1Color: "#f97316",
      stat2Label: "TOP LANGUAGE", stat2Value: "TypeScript", stat2Sub: "🔷 82% Language Proficiency",
      stat2Color: "#fb923c",
      stat3Label: "IMPACT SCORE", stat3Value: "9.4 / 10", stat3Sub: "⭐ Commit Streak: 128 Days", stat3Color: "#fbbf24",
      emoji: "👨‍💻",
    },
    10: { // Email Composer – indigo & sky blue
      accent1: "#818cf8", accent2: "#60a5fa", accent3: "#a5f3fc",
      glow1: "#4338ca", glow2: "#1d4ed8", glow3: "#0e7490",
      stat1Label: "EMAIL VARIANTS", stat1Value: "3 Generated", stat1Sub: "🟢 Formal / Casual / Persuasive",
      stat1Color: "#818cf8",
      stat2Label: "OPEN RATE SCORE", stat2Value: "74% est.", stat2Sub: "📩 Subject Line Optimized",
      stat2Color: "#60a5fa",
      stat3Label: "TONE ANALYSIS", stat3Value: "REFINED", stat3Sub: "✍️ Gemini 1.5 Flash Composed", stat3Color: "#a5f3fc",
      emoji: "✉️",
    },
  };

  return { ...defaults, ...themes[dayNum] };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dayStr = searchParams.get("day") || "1";
  const dayNum = parseInt(dayStr, 10) || 1;

  const project =
    INITIAL_MINI_PROJECTS.find((p) => p.dayNumber === dayNum) ||
    INITIAL_MINI_PROJECTS[0];

  const title = project.title;
  const category = project.category;
  const rawDesc = project.description;
  const tags = project.tags;
  const vercelUrl = project.vercelUrl;

  // Wrap description into 2 lines for readability
  const words = rawDesc.split(" ");
  let line1 = "", line2 = "";
  let len = 0;
  for (const w of words) {
    if (len + w.length < 72) { line1 += (line1 ? " " : "") + w; len += w.length + 1; }
    else { line2 += (line2 ? " " : "") + w; }
  }
  if (line2.length > 72) line2 = line2.slice(0, 70) + "…";

  const t = getProjectTheme(dayNum, tags);

  const dayPad = String(dayNum).padStart(2, "0");
  const catUpper = category.toUpperCase();

  // Tag pills (up to 4)
  const tagPills = tags.slice(0, 4).map((tag, i) => {
    const x = 90 + i * 220;
    return `
    <rect x="${x}" y="285" width="200" height="28" rx="14"
          fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <text x="${x + 100}" y="303" fill="#e2e8f0" font-family="monospace" font-size="13"
          font-weight="600" text-anchor="middle">${escapeXml(tag)}</text>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#030712"/>
      <stop offset="55%" stop-color="#080d1a"/>
      <stop offset="100%" stop-color="#030712"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="0" y2="530" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="rgba(15,23,42,0.85)"/>
      <stop offset="100%" stop-color="rgba(3,7,18,0.95)"/>
    </linearGradient>
    <linearGradient id="titleGrad" x1="0" y1="0" x2="900" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${t.accent1}"/>
      <stop offset="50%" stop-color="${t.accent2}"/>
      <stop offset="100%" stop-color="${t.accent3}"/>
    </linearGradient>
    <linearGradient id="accentLine" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${t.accent1}" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="${t.accent2}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${t.accent3}" stop-opacity="0.1"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="18" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <clipPath id="cardClip">
      <rect x="30" y="30" width="1140" height="570" rx="20"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Ambient Glow Orbs per project -->
  <ellipse cx="150" cy="180" rx="320" ry="250" fill="${t.glow1}" opacity="0.18" filter="url(#glow)"/>
  <ellipse cx="1050" cy="460" rx="280" ry="220" fill="${t.glow2}" opacity="0.18" filter="url(#glow)"/>
  <ellipse cx="620" cy="580" rx="240" ry="160" fill="${t.glow3}" opacity="0.14" filter="url(#glow)"/>

  <!-- Subtle Grid Mesh -->
  <g stroke="rgba(255,255,255,0.04)" stroke-width="1">
    <line x1="0" y1="105" x2="1200" y2="105"/>
    <line x1="0" y1="210" x2="1200" y2="210"/>
    <line x1="0" y1="315" x2="1200" y2="315"/>
    <line x1="0" y1="420" x2="1200" y2="420"/>
    <line x1="0" y1="525" x2="1200" y2="525"/>
    <line x1="240" y1="0" x2="240" y2="630"/>
    <line x1="480" y1="0" x2="480" y2="630"/>
    <line x1="720" y1="0" x2="720" y2="630"/>
    <line x1="960" y1="0" x2="960" y2="630"/>
  </g>

  <!-- Main Card -->
  <rect x="30" y="30" width="1140" height="570" rx="20"
        fill="url(#card)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>

  <!-- Top Accent Line (colored per project) -->
  <rect x="30" y="30" width="1140" height="4" rx="2" fill="url(#accentLine)"/>

  <!-- Browser Window Titlebar -->
  <rect x="30" y="34" width="1140" height="48" rx="16"
        fill="rgba(8,12,28,0.95)" stroke="none"/>
  <line x1="30" y1="82" x2="1170" y2="82" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>

  <!-- Traffic Lights -->
  <circle cx="68" cy="58" r="7" fill="#ef4444" opacity="0.9"/>
  <circle cx="92" cy="58" r="7" fill="#f59e0b" opacity="0.9"/>
  <circle cx="116" cy="58" r="7" fill="#22c55e" opacity="0.9"/>

  <!-- URL Bar -->
  <rect x="340" y="44" width="520" height="28" rx="8"
        fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <text x="600" y="62" fill="#64748b" font-family="system-ui,sans-serif"
        font-size="12" font-weight="500" text-anchor="middle">
    🔒 ${escapeXml(vercelUrl)}
  </text>

  <!-- Share Icon placeholder on right -->
  <text x="1120" y="64" fill="#475569" font-family="system-ui,sans-serif" font-size="20" text-anchor="middle">⬡</text>

  <!-- ── LEFT COLUMN: Identity ── -->

  <!-- Emoji Project Icon Badge -->
  <rect x="66" y="105" width="74" height="74" rx="18"
        fill="rgba(255,255,255,0.05)" stroke="${t.accent1}" stroke-width="1.5" stroke-opacity="0.5"/>
  <text x="103" y="155" font-size="38" text-anchor="middle">${t.emoji}</text>

  <!-- Day Badge -->
  <rect x="156" y="108" width="110" height="26" rx="13"
        fill="${t.accent1}" fill-opacity="0.15"
        stroke="${t.accent1}" stroke-width="1" stroke-opacity="0.5"/>
  <text x="211" y="125" fill="${t.accent1}" font-family="system-ui,sans-serif"
        font-size="12" font-weight="800" text-anchor="middle">DAY ${dayPad} OF 30</text>

  <!-- Category Badge -->
  <rect x="276" y="108" width="180" height="26" rx="13"
        fill="${t.accent2}" fill-opacity="0.12"
        stroke="${t.accent2}" stroke-width="1" stroke-opacity="0.4"/>
  <text x="366" y="125" fill="${t.accent2}" font-family="system-ui,sans-serif"
        font-size="11" font-weight="700" text-anchor="middle">● ${catUpper}</text>

  <!-- Live Status Dot -->
  <circle cx="503" cy="121" r="5" fill="#22c55e" filter="url(#softGlow)"/>
  <rect x="514" y="108" width="72" height="26" rx="13"
        fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.35)" stroke-width="1"/>
  <text x="550" y="125" fill="#22c55e" font-family="system-ui,sans-serif"
        font-size="11" font-weight="700" text-anchor="middle">LIVE</text>

  <!-- Project Title (gradient) -->
  <text x="66" y="218" fill="url(#titleGrad)" font-family="system-ui,sans-serif"
        font-size="${title.length > 42 ? 30 : 36}" font-weight="900" letter-spacing="-0.5">
    ${escapeXml(title)}
  </text>

  <!-- Description Line 1 -->
  <text x="66" y="251" fill="#94a3b8" font-family="system-ui,sans-serif"
        font-size="16" font-weight="400">${escapeXml(line1)}</text>

  <!-- Description Line 2 -->
  ${line2 ? `<text x="66" y="272" fill="#94a3b8" font-family="system-ui,sans-serif"
        font-size="16" font-weight="400">${escapeXml(line2)}</text>` : ""}

  <!-- Tech Stack Tag Pills -->
  ${tagPills}

  <!-- ── BOTTOM METRIC CARDS ── -->
  <rect x="60" y="330" width="330" height="220" rx="16"
        fill="rgba(3,7,18,0.7)" stroke="${t.accent1}" stroke-width="1" stroke-opacity="0.3"/>
  <text x="82" y="362" fill="#64748b" font-family="system-ui,sans-serif"
        font-size="11" font-weight="700" letter-spacing="1">${escapeXml(t.stat1Label)}</text>
  <text x="82" y="420" fill="${t.stat1Color}" font-family="system-ui,sans-serif"
        font-size="40" font-weight="900">${escapeXml(t.stat1Value)}</text>
  <text x="82" y="452" fill="${t.stat1Color}" font-family="system-ui,sans-serif"
        font-size="13" font-weight="600" opacity="0.8">${escapeXml(t.stat1Sub)}</text>
  <!-- sparkline placeholder -->
  <polyline points="82,510 110,495 138,505 166,488 194,500 222,480 250,492 278,475 306,482 334,468"
            fill="none" stroke="${t.stat1Color}" stroke-width="2.5" opacity="0.5" stroke-linecap="round" stroke-linejoin="round"/>

  <rect x="410" y="330" width="360" height="220" rx="16"
        fill="rgba(3,7,18,0.7)" stroke="${t.accent2}" stroke-width="1" stroke-opacity="0.3"/>
  <text x="432" y="362" fill="#64748b" font-family="system-ui,sans-serif"
        font-size="11" font-weight="700" letter-spacing="1">${escapeXml(t.stat2Label)}</text>
  <text x="432" y="420" fill="${t.stat2Color}" font-family="system-ui,sans-serif"
        font-size="40" font-weight="900">${escapeXml(t.stat2Value)}</text>
  <text x="432" y="452" fill="${t.stat2Color}" font-family="system-ui,sans-serif"
        font-size="13" font-weight="600" opacity="0.8">${escapeXml(t.stat2Sub)}</text>
  <!-- bar chart placeholder -->
  <rect x="432" y="490" width="36" height="38" rx="4" fill="${t.stat2Color}" opacity="0.35"/>
  <rect x="476" y="475" width="36" height="53" rx="4" fill="${t.stat2Color}" opacity="0.45"/>
  <rect x="520" y="460" width="36" height="68" rx="4" fill="${t.stat2Color}" opacity="0.55"/>
  <rect x="564" y="482" width="36" height="46" rx="4" fill="${t.stat2Color}" opacity="0.40"/>
  <rect x="608" y="466" width="36" height="62" rx="4" fill="${t.stat2Color}" opacity="0.50"/>
  <rect x="652" y="448" width="36" height="80" rx="4" fill="${t.stat2Color}" opacity="0.65"/>
  <rect x="696" y="470" width="36" height="58" rx="4" fill="${t.stat2Color}" opacity="0.48"/>

  <rect x="790" y="330" width="340" height="220" rx="16"
        fill="rgba(3,7,18,0.7)" stroke="${t.accent3}" stroke-width="1" stroke-opacity="0.3"/>
  <text x="812" y="362" fill="#64748b" font-family="system-ui,sans-serif"
        font-size="11" font-weight="700" letter-spacing="1">${escapeXml(t.stat3Label)}</text>
  <text x="812" y="420" fill="${t.stat3Color}" font-family="system-ui,sans-serif"
        font-size="40" font-weight="900">${escapeXml(t.stat3Value)}</text>
  <text x="812" y="452" fill="${t.stat3Color}" font-family="system-ui,sans-serif"
        font-size="13" font-weight="600" opacity="0.8">${escapeXml(t.stat3Sub)}</text>
  <!-- donut ring placeholder -->
  <circle cx="906" cy="493" r="35" fill="none" stroke="${t.stat3Color}" stroke-width="10" stroke-opacity="0.2"/>
  <circle cx="906" cy="493" r="35" fill="none" stroke="${t.stat3Color}" stroke-width="10"
          stroke-dasharray="165 55" stroke-dashoffset="0" stroke-linecap="round" stroke-opacity="0.85"/>
  <text x="906" y="499" fill="${t.stat3Color}" font-family="system-ui,sans-serif"
        font-size="14" font-weight="800" text-anchor="middle">75%</text>

  <!-- ── FOOTER BRANDING ── -->
  <line x1="30" y1="574" x2="1170" y2="574" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>

  <!-- AB Logo Badge (small) -->
  <rect x="60" y="585" width="34" height="34" rx="8"
        fill="rgba(15,23,42,0.9)" stroke="${t.accent1}" stroke-width="1.2" stroke-opacity="0.6"/>
  <text x="77" y="607" fill="${t.accent1}" font-family="monospace"
        font-size="13" font-weight="900" text-anchor="middle">AB</text>

  <text x="104" y="608" fill="#475569" font-family="system-ui,sans-serif"
        font-size="13" font-weight="500">
    Abdul Nabi  ·  Full-Stack Engineer &amp; AI/ML Developer
  </text>

  <text x="1140" y="608" fill="${t.accent2}" font-family="system-ui,sans-serif"
        font-size="13" font-weight="600" text-anchor="end" opacity="0.8">
    aiwithab.site
  </text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
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
