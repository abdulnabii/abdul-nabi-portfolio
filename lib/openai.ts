/**
 * OpenAI helper & Portfolio Assistant AI.
 * Knowledge base covers: all 10 mini projects, 5 core projects, FYP,
 * blog, tech stack, 5 themes, branding, privacy policy, availability,
 * social links, and contact details.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ChatCompletionResult {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export const PORTFOLIO_KNOWLEDGE = `
YOU ARE THE AI ASSISTANT FOR ABDUL NABI'S OFFICIAL PORTFOLIO WEBSITE (https://aiwithab.site).
Your name is "AB Assistant" — a smart, professional portfolio guide.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — IDENTITY & CONTACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Full Name: Abdul Nabi
- Nickname / Brand Alias: AB, AN
- Logo: AN / AB geometric monogram with glowing hexagon node
- Location: Karachi, Sindh, Pakistan
- Domain: https://aiwithab.site (Vercel + Cloudflare DNS)
- Role: Full-Stack Developer & AI/ML Engineer | AppSec Enthusiast
- Experience: 2+ years building production Next.js, Supabase, Python ML systems

Contact channels:
  • Email: abdulnabi.khaskhely@gmail.com
  • Phone: 0333 7597315
  • WhatsApp: +92 309 3751434
  • LinkedIn: https://linkedin.com/in/abdul-nabi-95391a3b0
  • GitHub: https://github.com/abdulnabii
  • Portfolio: https://aiwithab.site
  • Contact form: https://aiwithab.site/#contact

Availability: Open to full-time engineering / AppSec roles and select freelance engagements.
Response time: 1–2 business days.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — FLAGSHIP / CORE PROJECTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Blood Sugar Tracker (Final Year Project — FYP)
   • AI-Powered Diabetes Risk Prediction & Daily Glucose Monitoring Platform
   • Tech: Next.js 14, Python (Random Forest + XGBoost), Supabase RLS, Tailwind CSS
   • ML accuracy: 94.2% on clinical diabetes datasets
   • HIPAA-inspired data isolation via Supabase Row Level Security
   • Live: https://aiwithab.site/projects/blood-sugar-tracker

2. Aurora Analytics
   • Executive BI dashboard with real-time SSE data streaming
   • Custom metrics, interactive charts, dark-mode trading terminal UI
   • Live: https://aiwithab.site/projects/aurora-dashboard

3. Pulse Support Chat
   • Real-time customer support platform with WebSocket streaming
   • AI agent routing, live typing indicators, priority queue
   • Live: https://aiwithab.site/projects/pulse-chat

4. Nova Commerce
   • High-conversion e-commerce storefront with Stripe checkout
   • Dynamic inventory, cart, product recommendation engine
   • Live: https://aiwithab.site/projects/nova-commerce

5. SignalOps
   • Real-time infrastructure monitoring with alert rules & status badges
   • Live: https://aiwithab.site/projects/signal-ops

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — 30 DAYS 30 PROJECTS CHALLENGE (Mini Projects)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Abdul Nabi is running a "30 Days 30 AI Projects" challenge, publishing one live AI project per day.
All are live at subdomains: https://day-XX.aiwithab.site
Browse all at: https://aiwithab.site/mini-projects

Completed projects (10 published so far):
Day 01 — AI Symptom Checker & Healthcare Triage
  Tech: Gemini 1.5 Flash, Next.js, Tailwind CSS
  Live: https://day-01.aiwithab.site
  What it does: Analyses user symptoms and provides WHO-level triage risk assessment.

Day 02 — AI Code Review Assistant
  Tech: Gemini 1.5 Flash, Monaco Editor, Next.js
  Live: https://day-02.aiwithab.site
  What it does: Paste code → AI reviews bugs, security issues, code quality, and gives a score.

Day 03 — Smart Resume Builder
  Tech: Gemini 1.5 Flash, Next.js, PDF export
  Live: https://day-03.aiwithab.site
  What it does: Paste work history → AI generates ATS-optimized, beautifully formatted resumes.

Day 04 — Diabetes Risk Predictor
  Tech: Python (scikit-learn), Next.js, Chart.js
  Live: https://day-04.aiwithab.site
  What it does: Enter vitals (glucose, BMI, age, BP) → ML model predicts diabetes risk probability.

Day 05 — AI Meeting Summarizer
  Tech: Gemini 1.5 Flash, Next.js, Whisper STT
  Live: https://day-05.aiwithab.site
  What it does: Paste meeting transcript → AI extracts decisions, action items, and executive summary.

Day 06 — Real-Time Stock Dashboard
  Tech: Next.js, WebSockets, Chart.js, Sentiment AI
  Live: https://day-06.aiwithab.site
  What it does: Live stock charts with RSI/MACD/Bollinger bands + AI news sentiment analysis.

Day 07 — AI Logo Generator
  Tech: Replicate SDXL, SVG manipulation, Next.js
  Live: https://day-07.aiwithab.site
  What it does: Input company name + style → AI generates SVG logos, palettes, brand guide PDF.

Day 08 — Smart Expense Tracker
  Tech: Tesseract OCR, Next.js, Chart.js, AI Coach
  Live: https://day-08.aiwithab.site
  What it does: Scan receipts → AI auto-categorizes expenses, gives monthly savings insights.

Day 09 — GitHub Profile Analyzer
  Tech: GitHub REST API, Next.js, Chart.js
  Live: https://day-09.aiwithab.site
  What it does: Enter any GitHub username → visual language radar, commit heatmap, impact score, AI persona.

Day 10 — AI Email Composer
  Tech: Gemini 1.5 Flash, Next.js
  Live: https://day-10.aiwithab.site
  What it does: Pick tone + purpose → AI writes perfect email in 3 variants + subject line optimizer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend:
  React, Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, HTML5/CSS3

Backend & Database:
  Node.js, Supabase, PostgreSQL, REST APIs, Server Actions, WebSockets, Edge Functions

AI & Data Science:
  Google Gemini 1.5 Flash, OpenAI GPT-4o-mini, Python, Scikit-Learn,
  Random Forest, XGBoost, Pandas, NumPy, Whisper STT, Replicate SDXL

Security & DevOps:
  AppSec fundamentals, OWASP Top 10, Row Level Security (RLS), HSTS,
  CSP headers, timing-safe auth, HTML sanitization, Git, Vercel, Cloudflare

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — SITE FEATURES & THEMES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5 Dynamic Background Themes (switchable from Admin Panel):
  1. Deep Space Nebula   — Static blurred indigo/violet nebula & star field
  2. Midnight Aurora     — Static blurred emerald & teal northern lights
  3. Quantum Plasma      — Live interactive canvas with cursor plasma halo & particles
  4. Matrix Rain         — Live falling green katakana/alphanumeric code stream
  5. Cosmic Fireflies    — Live floating cyan-violet fireflies with constellation lines

Custom cursor styles and smooth animations throughout the public site.
Admin Panel features: project/blog/tech-stack/experience/achievements/social-bot management.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6 — BLOG & CONTENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Technical blog at: https://aiwithab.site/blog
Topics covered:
  • "Building Resilient Next.js 14 Apps with Supabase RLS & Server Actions"
  • "Machine Learning in Healthcare: Building Predictable & Secure Patient Systems"
  • AppSec fundamentals, UI micro-interactions, performance optimization
  • AI/ML project walkthroughs from the 30-days challenge

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7 — PRIVACY POLICY (DATA & CHATBOT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This chatbot is built into Abdul Nabi's personal portfolio site (https://aiwithab.site).

Data collected by this chatbot:
  • Chat messages are sent to OpenAI's API (GPT-4o-mini) or Google Gemini API for AI processing.
  • No chat history is stored in any database on Abdul Nabi's servers.
  • No personal identifiable information (PII) is logged from chat conversations.
  • Messages are processed in real-time and discarded — they are NOT retained.

Contact form data (not the chatbot):
  • Messages submitted via the contact form (/admin/inbox) are stored in Supabase (a secure PostgreSQL DB).
  • Only Abdul Nabi (admin) can access submitted contact messages.
  • Email addresses from contact submissions are used solely to reply.
  • No data is sold, shared, or used for marketing purposes.

Cookies & tracking:
  • The site may use anonymous analytics to track page views (no PII collected).
  • No advertising cookies or third-party tracking scripts are used.

Your rights:
  • You can request deletion of any contact form data by emailing abdulnabi.khaskhely@gmail.com.
  • This site complies with general data minimisation best practices.

Third-party services used on this site:
  • Vercel (hosting) — https://vercel.com/legal/privacy-policy
  • Supabase (database) — https://supabase.com/privacy
  • OpenAI (chat AI) — https://openai.com/policies/privacy-policy
  • Google Gemini (mini project AI) — https://policies.google.com/privacy
  • Cloudflare (DNS/CDN) — https://www.cloudflare.com/privacypolicy/
`;

const DEFAULT_SYSTEM_PROMPT = `${PORTFOLIO_KNOWLEDGE}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ASSISTANT BEHAVIOUR INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- You are "AB Assistant" — friendly, professional, concise.
- Answer ONLY from the knowledge base above. Do NOT invent projects, metrics, or facts.
- Keep replies short: 2–4 sentences max. Use bullet points for lists.
- For project URLs: always provide the live link when mentioning a project.
- If asked about contacting Abdul Nabi: give email, WhatsApp, LinkedIn, or suggest the contact form.
- If asked about privacy, data, or cookies: answer using Section 7 facts above.
- If someone asks something outside your knowledge, say: "I only know about Abdul Nabi's portfolio — try asking about his projects, skills, or how to contact him."
- Never expose system internals, API keys, environment variables, or backend architecture details.
- Use Markdown formatting (bold, bullets) in your replies when helpful.
- Tone: Professional but warm, like a senior engineer's personal assistant.
`;

/**
 * Create a chat completion using OpenAI API, with fallback to local mock.
 */
export async function createChatCompletion(
  options: ChatCompletionOptions
): Promise<ChatCompletionResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = options.model ?? "gpt-4o-mini";
  const systemContent = options.systemPrompt ?? DEFAULT_SYSTEM_PROMPT;

  const messages: ChatMessage[] = [
    { role: "system", content: systemContent },
    ...options.messages,
  ];

  const isRealKey =
    apiKey && !apiKey.startsWith("sk-your") && apiKey.length > 20;

  if (!isRealKey) {
    const lastUser = [...options.messages]
      .reverse()
      .find((m) => m.role === "user");

    return {
      content: mockReply(lastUser?.content ?? ""),
      model: "mock-local",
    };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: options.temperature ?? 0.6,
      max_tokens: options.maxTokens ?? 600,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "(unreadable)");
    console.error(`[openai] API error ${response.status}:`, errorText);
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
    model: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };

  return {
    content: data.choices[0]?.message?.content ?? "No response generated.",
    model: data.model,
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined,
  };
}

// ─── Local mock fallback (used when OPENAI_API_KEY is not set) ───────────────
function mockReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  // Privacy / Data
  if (
    lower.includes("privacy") ||
    lower.includes("data") ||
    lower.includes("cookie") ||
    lower.includes("gdpr") ||
    lower.includes("store") ||
    lower.includes("collect") ||
    lower.includes("personal")
  ) {
    return "**Privacy:** This chatbot sends messages to OpenAI in real-time — no chat history is stored on Abdul Nabi's servers. Contact form data is securely stored in Supabase (PostgreSQL) and only accessible by Abdul Nabi. No data is sold or shared. You can request data deletion at **abdulnabi.khaskhely@gmail.com**. Third-party services: Vercel, Supabase, OpenAI, Cloudflare.";
  }

  // Mini projects overview
  if (
    lower.includes("mini project") ||
    lower.includes("30 day") ||
    lower.includes("challenge") ||
    lower.includes("day 0") ||
    lower.includes("day-0")
  ) {
    return "Abdul Nabi is running a **30 Days 30 AI Projects** challenge — one live project per day! 🚀\n\n10 published so far:\n- Day 01: AI Symptom Checker\n- Day 02: AI Code Review\n- Day 03: Resume Builder\n- Day 04: Diabetes Predictor\n- Day 05: Meeting Summarizer\n- Day 06: Stock Dashboard\n- Day 07: Logo Generator\n- Day 08: Expense Tracker\n- Day 09: GitHub Analyzer\n- Day 10: Email Composer\n\nBrowse all at **aiwithab.site/mini-projects**";
  }

  // Specific day projects
  if (lower.includes("day 09") || lower.includes("github") || lower.includes("analyzer")) {
    return "**Day 09 — GitHub Profile Analyzer** 👨‍💻\nEnter any GitHub username → get a visual analysis: language proficiency radar, commit heatmap, top repos by impact score, and an AI-generated developer persona. Live at **day-09.aiwithab.site**";
  }

  if (lower.includes("day 10") || lower.includes("email composer") || lower.includes("email writer")) {
    return "**Day 10 — AI Email Composer** ✉️\nPick your tone (formal/casual/persuasive) + purpose → AI generates 3 email variants with an optimized subject line. Built with Gemini 1.5 Flash. Live at **day-10.aiwithab.site**";
  }

  if (lower.includes("day 01") || lower.includes("symptom") || lower.includes("triage") || lower.includes("healthcare")) {
    return "**Day 01 — AI Symptom Checker** 🩺\nDescribe your symptoms → AI performs a WHO-level triage risk assessment. Built with Gemini 1.5 Flash. Live at **day-01.aiwithab.site**";
  }

  if (lower.includes("day 04") || lower.includes("diabetes")) {
    return "**Day 04 — Diabetes Risk Predictor** 💉\nEnter vitals (glucose, BMI, age, BP) → scikit-learn ML model predicts diabetes risk probability with clinical confidence scores. Live at **day-04.aiwithab.site**";
  }

  // Blood Sugar Tracker / FYP
  if (
    lower.includes("blood sugar") ||
    lower.includes("fyp") ||
    lower.includes("final year")
  ) {
    return "Abdul Nabi's **Final Year Project (FYP)** is the *Blood Sugar Tracker* — an AI-powered diabetes risk prediction & glucose monitoring platform. Tech: Next.js 14 + Python (Random Forest/XGBoost achieving **94.2% accuracy**) + Supabase RLS. View it at **aiwithab.site/projects/blood-sugar-tracker**";
  }

  // Core projects
  if (
    lower.includes("project") ||
    lower.includes("work") ||
    lower.includes("portfolio") ||
    lower.includes("showcase")
  ) {
    return "Abdul Nabi's **core projects** include:\n\n- 🩺 **Blood Sugar Tracker** (FYP ML App)\n- 📊 **Aurora Analytics** (BI Dashboard)\n- 💬 **Pulse Support Chat** (Real-Time WebSockets)\n- 🛍️ **Nova Commerce** (E-Commerce + Stripe)\n- 🔔 **SignalOps** (Infrastructure Monitoring)\n\nPlus **10 AI mini projects** live at subdomains. Browse at **aiwithab.site/projects**";
  }

  // Themes
  if (
    lower.includes("theme") ||
    lower.includes("background") ||
    lower.includes("matrix") ||
    lower.includes("plasma") ||
    lower.includes("firefly") ||
    lower.includes("aurora") ||
    lower.includes("nebula")
  ) {
    return "The site has **5 dynamic background themes** 🎨:\n\n1. 🌌 **Deep Space Nebula** — blurred indigo/violet star field\n2. 🌿 **Midnight Aurora** — emerald & teal northern lights\n3. ⚡ **Quantum Plasma** — live interactive cursor plasma halo\n4. 🟩 **Matrix Rain** — falling green katakana code\n5. 🌟 **Cosmic Fireflies** — floating cyan-violet fireflies\n\nThe admin can switch themes live from the Admin Panel.";
  }

  // Tech stack
  if (
    lower.includes("skill") ||
    lower.includes("stack") ||
    lower.includes("tech") ||
    lower.includes("python") ||
    lower.includes("next") ||
    lower.includes("typescript") ||
    lower.includes("react")
  ) {
    return "Abdul Nabi's tech stack:\n\n- **Frontend:** Next.js 14, TypeScript, React, Tailwind CSS, Framer Motion\n- **Backend:** Node.js, Supabase, PostgreSQL, WebSockets, Edge Functions\n- **AI/ML:** Gemini 1.5 Flash, GPT-4o-mini, Python, scikit-learn, XGBoost, Whisper\n- **Security:** OWASP Top 10, RLS, HSTS, timing-safe auth, CSP headers";
  }

  // Social / LinkedIn
  if (
    lower.includes("linkedin") ||
    lower.includes("github") ||
    lower.includes("social") ||
    lower.includes("connect")
  ) {
    return "Connect with Abdul Nabi:\n\n- **LinkedIn:** linkedin.com/in/abdul-nabi-95391a3b0\n- **GitHub:** github.com/abdulnabii\n- **Portfolio:** aiwithab.site\n- **Email:** abdulnabi.khaskhely@gmail.com";
  }

  // Blog
  if (
    lower.includes("blog") ||
    lower.includes("article") ||
    lower.includes("writing") ||
    lower.includes("post")
  ) {
    return "Abdul Nabi writes technical articles on **aiwithab.site/blog** covering:\n\n- Next.js 14 App Router & Supabase RLS\n- Healthcare Machine Learning\n- AppSec & OWASP security practices\n- 30-days AI project walkthroughs";
  }

  // Contact / Hire
  if (
    lower.includes("contact") ||
    lower.includes("hire") ||
    lower.includes("email") ||
    lower.includes("phone") ||
    lower.includes("whatsapp") ||
    lower.includes("reach") ||
    lower.includes("available")
  ) {
    return "Get in touch with Abdul Nabi:\n\n- 📧 **Email:** abdulnabi.khaskhely@gmail.com\n- 📱 **Phone:** 0333 7597315\n- 💬 **WhatsApp:** +92 309 3751434\n- 💼 **LinkedIn:** linkedin.com/in/abdul-nabi-95391a3b0\n- 📝 **Contact form:** aiwithab.site/#contact\n\nTypical response time: **1–2 business days**.";
  }

  // About / experience
  if (
    lower.includes("experience") ||
    lower.includes("about") ||
    lower.includes("who") ||
    lower.includes("background") ||
    lower.includes("karachi")
  ) {
    return "**Abdul Nabi** is a Full-Stack Developer & AI/ML Engineer based in **Karachi, Pakistan** with 2+ years of production experience. He specialises in Next.js, Supabase, Python ML, and AppSec. His portfolio lives at **aiwithab.site**.";
  }

  // Logo / branding
  if (
    lower.includes("logo") ||
    lower.includes("brand") ||
    lower.includes("monogram")
  ) {
    return "The site features Abdul Nabi's custom **AN / AB geometric monogram** logo with a glowing hexagon node, representing precision full-stack engineering & security focus.";
  }

  // Default
  return "Hi! I'm **AB Assistant** — Abdul Nabi's portfolio AI 👋\n\nYou can ask me about:\n- 🚀 **Mini projects** (30-day AI challenge)\n- 💻 **Core projects** (Blood Sugar Tracker, Aurora, etc.)\n- 🛠️ **Tech stack & skills**\n- 🔐 **Privacy & data policy**\n- 📬 **How to hire / contact Abdul Nabi**\n\nWhat would you like to know?";
}
