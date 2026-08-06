/**
 * OpenAI helper & Portfolio Assistant AI.
 * Updated with all recent portfolio features, projects (FYP Blood Sugar Tracker),
 * blogs, branding (AN/AB monogram), 5 background themes, and contact details.
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

KEY FACTS & RECENT UPDATES ABOUT ABDUL NABI:
1. DEVELOPER PROFILE:
   - Full Name: Abdul Nabi (Brand Logo: AN / AB Monogram with glowing hexagon node).
   - Location: Karachi, Sindh, Pakistan.
   - Domain: https://aiwithab.site (Hosted on Vercel with Cloudflare DNS).
   - Role: Full-Stack Developer & AppSec Enthusiast (1+ years experience).
   - Contact: Email abdulnabi.khaskhely@gmail.com | Phone: 0333 7597315 | WhatsApp: +92 309 3751434.
   - Availability: Open to full-time engineering / security roles and select freelance projects. Typical response time: 1–2 business days.

2. FEATURED PROJECTS:
   - Blood Sugar Tracker (Final Year Project / FYP):
     * Description: AI-Powered Diabetes Risk Prediction & Daily Glucose Tracking System.
     * Tech Stack: Next.js 14, Python (Scikit-Learn, Random Forest, XGBoost), Supabase RLS, Tailwind CSS.
     * Highlights: Achieved 94.2% ML prediction accuracy on clinical diabetes datasets; HIPAA-inspired data isolation via Supabase RLS.
   - Aurora Analytics: Executive BI dashboard with real-time SSE streaming, custom metrics, and interactive charts.
   - Pulse Support Chat: Real-time customer support platform with WebSocket streaming and agent routing.
   - Nova Commerce: High-conversion e-commerce storefront with Stripe checkout integration and dynamic inventory.
   - SignalOps: Real-time infrastructure monitoring platform with alert rules and status badges.

3. BLOG & WRITING:
   - Regularly publishes SEO-optimized technical articles on:
     * "Building Resilient Next.js 14 Apps with Supabase RLS & Server Actions"
     * "Machine Learning in Healthcare: Building Predictable & Secure Patient Systems"
     * AppSec fundamentals, UI micro-interactions, and performance optimization.

4. SITE FEATURES & THEMING:
   - 5 Custom Background Themes (Admin can switch dynamically from /admin/background-theme):
     1. Deep Space Nebula (Static blurred indigo/violet nebula & star field)
     2. Midnight Aurora (Static blurred emerald & teal northern lights)
     3. Quantum Plasma (Live interactive canvas with cursor plasma halo & particle field)
     4. Matrix Rain (Live falling green katakana/alphanumeric code)
     5. Cosmic Fireflies (Live floating cyan-violet fireflies with constellation lines)
   - Custom AN / AB Monogram Logo in navbar.
   - Admin Panel for managing projects, blogs, tech stack, experience, achievements, background themes, and messages.

5. TECH STACK:
   - Frontend: React, Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, HTML5/CSS3.
   - Backend & Database: Node.js, Supabase, PostgreSQL, REST APIs, Server Actions, WebSockets.
   - AI & Data Science: Python, Scikit-Learn, Random Forest, XGBoost, Pandas, NumPy.
   - Security & Tools: AppSec fundamentals, Row Level Security (RLS), Git, Vercel, Cloudflare.
`;

const DEFAULT_SYSTEM_PROMPT = `${PORTFOLIO_KNOWLEDGE}
INSTRUCTIONS FOR THE ASSISTANT:
- Answer user questions accurately and concisely using the facts above.
- Be polite, professional, and helpful.
- If asked about contacting Abdul Nabi, provide his email, phone, or suggest using the contact form on https://aiwithab.site/
- Do not invent non-existent projects or metrics.
`;

/**
 * Create a chat completion.
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
      max_tokens: options.maxTokens ?? 500,
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

function mockReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes("blood sugar") || lower.includes("fyp") || lower.includes("diabetes") || lower.includes("health")) {
    return "Abdul Nabi's flagship Final Year Project (FYP) is the 'Blood Sugar Tracker' — an AI-powered diabetes risk prediction & glucose monitoring platform built with Next.js 14, Python (Random Forest/XGBoost achieving 94.2% accuracy), and Supabase RLS.";
  }

  if (lower.includes("theme") || lower.includes("background") || lower.includes("matrix") || lower.includes("plasma") || lower.includes("firefly")) {
    return "The portfolio features 5 custom background themes (2 static: Deep Space Nebula & Midnight Aurora; 3 live animated: Quantum Plasma, Matrix Rain, & Cosmic Fireflies). The admin can change the live theme directly from the Admin Panel (/admin/background-theme).";
  }

  if (lower.includes("project") || lower.includes("work") || lower.includes("portfolio")) {
    return "Abdul Nabi's showcase includes 5 core projects: Blood Sugar Tracker (FYP ML App), Aurora Analytics (BI Dashboard), Pulse Support Chat (Real-Time WebSockets), Nova Commerce (E-Commerce), and SignalOps (Infrastructure Monitoring). Click 'View all projects' in the Portfolio section to see the full showcase!";
  }

  if (lower.includes("blog") || lower.includes("article") || lower.includes("writing") || lower.includes("post")) {
    return "Abdul Nabi writes technical articles on Next.js 14 App Router, Supabase RLS, Healthcare Machine Learning, and AppSec security practices. Check out the Journal / Blog section on https://aiwithab.site/blog for the latest posts!";
  }

  if (lower.includes("skill") || lower.includes("stack") || lower.includes("tech") || lower.includes("python") || lower.includes("next")) {
    return "Abdul Nabi's tech stack includes Next.js 14, TypeScript, Tailwind CSS, Node.js, Supabase, PostgreSQL, and Python (Scikit-Learn, Random Forest, XGBoost) for Machine Learning, with a strong focus on AppSec & security fundamentals.";
  }

  if (lower.includes("logo") || lower.includes("an") || lower.includes("ab") || lower.includes("brand")) {
    return "The website features Abdul Nabi's custom AN / AB geometric monogram logo with a glowing hexagon node, representing precision full-stack engineering and security.";
  }

  if (lower.includes("contact") || lower.includes("hire") || lower.includes("email") || lower.includes("phone") || lower.includes("whatsapp")) {
    return "You can get in touch with Abdul Nabi via email at abdulnabi.khaskhely@gmail.com, phone at 0333 7597315, or WhatsApp at +92 309 3751434. You can also use the contact form at the bottom of the site!";
  }

  if (lower.includes("experience") || lower.includes("about") || lower.includes("background") || lower.includes("who")) {
    return "Abdul Nabi is a Full-Stack Developer & AppSec enthusiast based in Karachi, Sindh, Pakistan with 1+ years experience building production Next.js, Supabase, TypeScript, and ML systems. His official domain is https://aiwithab.site.";
  }

  return "I'm Abdul Nabi's Portfolio AI! You can ask me about his FYP Blood Sugar Tracker, tech stack, 5 background themes, technical blog posts, or how to hire him. How can I help you today?";
}
