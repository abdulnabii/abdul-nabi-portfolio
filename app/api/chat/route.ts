import { createChatCompletion, type ChatMessage } from "@/lib/openai";
import { NextRequest, NextResponse } from "next/server";

interface ChatRequestBody {
  messages?: ChatMessage[];
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody;

    let messages: ChatMessage[] = [];

    if (Array.isArray(body.messages) && body.messages.length > 0) {
      messages = body.messages
        .filter(
          (m) =>
            m &&
            typeof m.content === "string" &&
            (m.role === "user" || m.role === "assistant" || m.role === "system")
        )
        .map((m) => ({
          role: m.role,
          content: m.content.trim(),
        }))
        .filter((m) => m.content.length > 0);
    } else if (typeof body.message === "string" && body.message.trim()) {
      messages = [{ role: "user", content: body.message.trim() }];
    }

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "Please provide a message or messages array." },
        { status: 400 }
      );
    }

    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) {
      return NextResponse.json(
        { error: "At least one user message is required." },
        { status: 400 }
      );
    }

    if (lastUser.content.length > 2000) {
      return NextResponse.json(
        { error: "Message is too long (max 2000 characters)." },
        { status: 400 }
      );
    }

    const result = await createChatCompletion({
      messages,
      temperature: 0.6,
      maxTokens: 500,
    });

    return NextResponse.json({
      reply: result.content,
      model: result.model,
      usage: result.usage,
    });
  } catch (error) {
    // Log the full error server-side only — never expose raw messages to the client
    // (raw errors can leak API key fragments, internal paths, or provider-specific details)
    console.error("[api/chat]", error);
    return NextResponse.json(
      { error: "Service temporarily unavailable. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/chat",
    methods: ["POST"],
    body: {
      messages: [{ role: "user", content: "Tell me about your projects" }],
    },
  });
}
