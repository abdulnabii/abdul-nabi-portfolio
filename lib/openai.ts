/**
 * OpenAI helper placeholder.
 *
 * Install when ready:
 *   npm install openai
 *
 * Set in .env.local:
 *   OPENAI_API_KEY=
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

const DEFAULT_SYSTEM_PROMPT = `You are a helpful assistant embedded on Abdul Nabi's portfolio website.
Answer concisely about his skills, projects, and experience based on the site content.
If you don't know something, say so politely and suggest using the contact form.
Do not invent employers, metrics, or live demo URLs that are not on the site.`;

/**
 * Create a chat completion. Scaffolded for OpenAI; falls back to a local mock
 * response when OPENAI_API_KEY is not set so the chatbot still works in demo mode.
 */
export async function createChatCompletion(
  options: ChatCompletionOptions
): Promise<ChatCompletionResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = options.model ?? "gpt-4o-mini";
  const messages: ChatMessage[] = [
    { role: "system", content: DEFAULT_SYSTEM_PROMPT },
    ...options.messages,
  ];

  if (!apiKey) {
    const lastUser = [...options.messages]
      .reverse()
      .find((m) => m.role === "user");

    return {
      content: mockReply(lastUser?.content ?? ""),
      model: "mock-local",
    };
  }

  // When you install `openai`, replace this block with the official SDK:
  // import OpenAI from "openai";
  // const client = new OpenAI({ apiKey });
  // const completion = await client.chat.completions.create({ ... });

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
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
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

  if (lower.includes("project") || lower.includes("work")) {
    return "Abdul's selected work includes Aurora Analytics, Nova Commerce, and Pulse Support Chat — framed as problem / role / outcome case studies. Scroll to Selected work for details.";
  }

  if (lower.includes("skill") || lower.includes("stack") || lower.includes("tech")) {
    return "Primary stack: React, Next.js (App Router), TypeScript, Tailwind, Node.js, PostgreSQL/Supabase. Focus is product UI and full-stack delivery.";
  }

  if (lower.includes("contact") || lower.includes("hire") || lower.includes("email")) {
    return "Best path: the contact form on this site. Share role type, stack, and timeline — he typically responds in 1–2 business days. He's open to full-time and select freelance work.";
  }

  if (lower.includes("experience") || lower.includes("background")) {
    return "Abdul is a full-stack developer with 1+ years building web products — strongest in product UI, Next.js App Router, and end-to-end feature delivery.";
  }

  return "I can help with questions about Abdul's projects, stack, experience, or how to get in touch. What would you like to know?";
}
