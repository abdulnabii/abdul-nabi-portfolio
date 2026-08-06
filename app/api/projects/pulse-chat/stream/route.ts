import { NextRequest } from "next/server";

export const runtime = "edge";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. AppSec Request Size Validation
    const body = await request.json().catch(() => ({}));
    const messages = body.messages as ChatMessage[] | undefined;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user" || !lastMessage.content) {
      return new Response(JSON.stringify({ error: "Last message must be from user." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Defensive input length sanitization (avoid large payload DDoS / injection patterns)
    if (lastMessage.content.length > 1000) {
      return new Response(JSON.stringify({ error: "Payload exceeds 1000 character security limit." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Security rate-limit simulation
    // Using custom headers passed by client (X-Client-Timestamp) to prevent rapid automated replay attacks
    const clientTimeHeader = request.headers.get("X-Client-Timestamp");
    if (clientTimeHeader) {
      const clientTime = parseInt(clientTimeHeader, 10);
      const serverTime = Date.now();
      // Rejects requests from the future or if client skew is excessive (> 5 mins)
      if (isNaN(clientTime) || Math.abs(serverTime - clientTime) > 300000) {
        return new Response(JSON.stringify({ error: "Request validation failed (skew mismatch)." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Mock Rate Limiting: Simulating 429 when messages are sent too quickly (throttling threshold)
    const requestCount = parseInt(request.headers.get("X-Request-Count") ?? "0", 10);
    if (requestCount > 5) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Throttled 5 req/min. Please try again shortly." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const textEncoder = new TextEncoder();

    // Treat placeholder keys (sk-your-...) as absent — fall back to mock stream
    const isRealKey =
      apiKey && !apiKey.startsWith("sk-your") && apiKey.length > 20;

    // 3. OpenAI Streaming vs Local Edge Mock Streaming
    if (isRealKey) {
      // Proxy streaming request to OpenAI
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are the Pulse Support Chat agent, demonstrating secure Edge streaming. Keep answers concise, and speak to Abdul Nabi's skills in Next.js, TypeScript, and Application Security. Use simple markdown (bold, lists, code).",
            },
            ...messages,
          ],
          temperature: 0.6,
          max_tokens: 500,
          stream: true,
        }),
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ error: "Failed to connect to OpenAI Stream API." }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Edge Stream pipeline
      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          const decoder = new TextDecoder();
          let buffer = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";

              for (const line of lines) {
                const cleanLine = line.trim();
                if (!cleanLine || cleanLine === "data: [DONE]") continue;

                if (cleanLine.startsWith("data: ")) {
                  try {
                    const json = JSON.parse(cleanLine.slice(6));
                    const token = json.choices[0]?.delta?.content;
                    if (token) {
                      controller.enqueue(textEncoder.encode(token));
                    }
                  } catch (e) {
                    // Ignore parsing errors of partial chunks
                  }
                }
              }
            }
          } catch (err) {
            controller.error(err);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
        },
      });
    } else {
      // Fallback: Custom Edge Mock stream responder
      const userText = lastMessage.content.toLowerCase();
      let responseText =
        "Hello! I am the Pulse Support Assistant running on a secure Edge handler. I can guide you through the architecture, deployment metrics, or security features of this specific chat build. What would you like to know?";

      if (userText.includes("architecture") || userText.includes("design") || userText.includes("flow")) {
        responseText =
          "### Pulse Streaming Architecture\n\nThe system uses an Edge-hosted Next.js API route that reads input payloads securely, validates query limits, and initiates server-sent streams. The client fetches the route and parses chunks incrementally.\n\n- **Client**: Custom stream parser decoding UTF-8 chunks\n- **Server**: Next.js Edge Runtime piping completions directly\n- **Security**: Secret API keys are fully hidden on the server";
      } else if (userText.includes("security") || userText.includes("rbac") || userText.includes("rate")) {
        responseText =
          "### Integrated Security Controls\n\nTo demonstrate AppSec developer principles, this chat project implements:\n\n1. **Input Length Validation**: Blocks messages longer than 1000 characters.\n2. **Time Skew Validation**: Rejects out-of-bounds client timestamps via `X-Client-Timestamp` headers.\n3. **Throttling**: Throttles request rates (mock 429 triggered in this demo frame after 5 requests).\n4. **No Secret Leakage**: API key bindings are strictly server-only.";
      } else if (userText.includes("abdul") || userText.includes("skills") || userText.includes("hiring")) {
        responseText =
          "### Abdul Nabi's Background\n\nAbdul Nabi is a Full-Stack Developer building clean Web & ML applications, actively learning AppSec fundamentals. He works with **Next.js**, **TypeScript**, **Python**, and **Tailwind CSS**, and designs data layers with **PostgreSQL/Supabase**. You can send him a message through the portfolio contact form at the bottom of the home page!";
      }

      const stream = new ReadableStream({
        async start(controller) {
          const words = responseText.split(" ");
          for (let i = 0; i < words.length; i++) {
            const chunk = words[i] + (i === words.length - 1 ? "" : " ");
            controller.enqueue(textEncoder.encode(chunk));
            // Add a small delay between words to simulate real model stream output
            await new Promise((resolve) => setTimeout(resolve, 60));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
        },
      });
    }
  } catch (err) {
    console.error("[Pulse Edge Stream API Error]:", err);
    return new Response(JSON.stringify({ error: "Internal Edge Stream processing error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
