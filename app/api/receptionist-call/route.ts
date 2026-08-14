import { NextRequest, NextResponse } from "next/server";
import { addInboxItem } from "@/lib/inbox-store";

export const dynamic = "force-dynamic";

export interface ReceptionistLogPayload {
  callerName?: string;
  contactInfo?: string;
  inquiryType?: string;
  inquiryDetails?: string;
  transcript?: { role: "caller" | "receptionist"; text: string; time?: string }[];
  action?: "log_call" | "process_turn";
}

const RECEPTIONIST_SYSTEM_PROMPT = `# Role
You are the phone receptionist for Abdul Nabi, a full-stack developer specializing in application security (AppSec), data, and machine learning. You take incoming calls, figure out why the caller is reaching out, and collect the details Abdul needs to follow up.

# Context
Abdul offers: full-time engineering roles (open to hire), freelance/contract projects, application security audits and consulting, and full-stack web/data/ML development work. He typically responds within 1-2 business days by email or WhatsApp. He does not keep fixed office hours.

## Step 1: Identify the inquiry type
Ask the caller what they're calling about, if not already stated. Categorize it as one of: full-time role, contract/freelance project, AppSec audit, or general inquiry.
Provide a natural variation of:
"Got it — so this is about [inquiry type], is that right?"

## Step 2: Collect caller details
Ask for the caller's name and the best email or phone number to reach them back at.
Respond exactly with:
"Can I get your name, and the best email or phone number to reach you at?"

## Step 3: Collect inquiry details
Ask a follow-up question suited to the inquiry type:
- Full-time role: ask what role or position they're reaching out about.
- Contract/freelance project: ask for a brief description of the project and rough timeline.
- AppSec audit: ask what system or application they'd like audited.
- General inquiry: ask them to briefly describe their question.
Provide a natural variation of:
"Can you tell me a bit more about [the role / the project / what you'd like audited / your question]?"

## Step 4: Close the call
Summarize what was captured and let the caller know Abdul will follow up.
Provide a natural variation of:
"Thanks, [name]. I've noted that down — Abdul will get back to you within 1 to 2 business days at [contact info]. Anything else before we wrap up?"

If the caller has nothing else, end the call.
Respond exactly with:
"Thanks for calling, have a great day."

# Guardrails
- Do not quote pricing or make commitments on Abdul's behalf beyond confirming that he will follow up.
- If the caller asks something outside of taking a message (e.g. detailed technical questions), let them know Abdul will address it when he follows up.
- Keep responses short, natural, conversational, and courteous, suited for spoken phone voice.
`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReceptionistLogPayload & {
      message?: string;
      history?: { role: "user" | "assistant"; content: string }[];
    };

    // If this is a call completion log action:
    if (body.action === "log_call") {
      const name = body.callerName?.trim() || "Anonymous Caller";
      const contact = body.contactInfo?.trim() || "No contact provided";
      const type = body.inquiryType || "Voice Call Lead";
      const details = body.inquiryDetails || "Call completed with receptionist.";

      const formattedTranscript = body.transcript
        ? body.transcript.map((t) => `${t.role === "caller" ? "👤 Caller" : "🤖 Receptionist"}: ${t.text}`).join("\n")
        : "No transcript recorded";

      const subject = `[📞 Voice Call Lead] ${type} — ${name}`;
      const message = `CALLER SUMMARY:
• Name: ${name}
• Contact Info: ${contact}
• Inquiry Category: ${type}
• Details: ${details}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALL TRANSCRIPT:
${formattedTranscript}
`;

      await addInboxItem("message", {
        name,
        email: contact.includes("@") ? contact : "voice-caller@aiwithab.site",
        company: type,
        subject,
        message,
      });

      return NextResponse.json({ ok: true, message: "Call inquiry logged to admin inbox." });
    }

    // Process a conversational voice turn using OpenAI or local logic
    const apiKey = process.env.OPENAI_API_KEY;
    const history = body.history || [];
    const userMessage = body.message || "";

    if (apiKey && !apiKey.startsWith("sk-your") && apiKey.length > 20) {
      const messages = [
        { role: "system", content: RECEPTIONIST_SYSTEM_PROMPT },
        ...history,
        { role: "user", content: userMessage },
      ];

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.5,
          max_tokens: 250,
          messages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content || "Thanks for calling Abdul Nabi's office. How can I help you today?";
        return NextResponse.json({ reply, ok: true });
      }
    }

    // Smart Local Conversational Voice Receptionist Fallback
    const lower = userMessage.toLowerCase();
    let reply = "Got it. Can I get your name, and the best email or phone number to reach you at?";

    if (lower.includes("full-time") || lower.includes("hire") || lower.includes("job") || lower.includes("position") || lower.includes("developer")) {
      reply = "Got it — so this is about a full-time engineering role, is that right? Can I get your name, and the best email or phone number to reach you at?";
    } else if (lower.includes("contract") || lower.includes("freelance") || lower.includes("project") || lower.includes("build") || lower.includes("app")) {
      reply = "Got it — so this is about a contract or freelance project, is that right? Can I get your name, and the best email or phone number to reach you at?";
    } else if (lower.includes("security") || lower.includes("audit") || lower.includes("appsec") || lower.includes("vulnerability") || lower.includes("pentest")) {
      reply = "Got it — so this is about an application security audit, is that right? Can I get your name, and the best email or phone number to reach you at?";
    } else if (lower.includes("availab") || lower.includes("calendar") || lower.includes("book") || lower.includes("slot") || lower.includes("meeting")) {
      reply = "Abdul is currently open for full-time roles and select engineering engagements! He typically responds within 1 to 2 business days. Can I get your name and email or phone number to lock in a time?";
    } else if (lower.includes("@") || lower.includes("03") || lower.includes("+") || lower.includes("phone") || lower.includes("email") || lower.includes("my name is") || lower.includes("this is")) {
      reply = "Thanks for providing that! Can you tell me a bit more about the project, role, or what you'd like audited?";
    } else if (lower.length > 25 && !lower.includes("bye") && !lower.includes("thank")) {
      reply = "Thanks! I've noted that down — Abdul will get back to you within 1 to 2 business days. Anything else before we wrap up?";
    } else if (lower.includes("no") || lower.includes("bye") || lower.includes("that's all") || lower.includes("thats all") || lower.includes("thanks")) {
      reply = "Thanks for calling, have a great day.";
    }

    return NextResponse.json({ reply, ok: true });
  } catch (err: any) {
    console.error("[api/receptionist-call]", err);
    return NextResponse.json({ error: err.message || "Failed to process receptionist call." }, { status: 500 });
  }
}
