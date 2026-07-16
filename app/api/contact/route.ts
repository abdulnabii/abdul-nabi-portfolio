import { NextRequest, NextResponse } from "next/server";

interface ContactPayload {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactPayload;

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const subject = body.subject?.trim() ?? "";
    const message = body.message?.trim() ?? "";

    const errors: string[] = [];

    if (!name || name.length < 2) {
      errors.push("Name must be at least 2 characters.");
    }
    if (!email || !isValidEmail(email)) {
      errors.push("A valid email is required.");
    }
    if (!subject || subject.length < 3) {
      errors.push("Subject must be at least 3 characters.");
    }
    if (!message || message.length < 10) {
      errors.push("Message must be at least 10 characters.");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join(" "), errors },
        { status: 400 }
      );
    }

    // Scaffold: log the submission. Wire to Supabase, Resend, Nodemailer, etc.
    // Example with Supabase:
    // const { supabase } = await import("@/lib/supabase");
    // await supabase?.from("contact_messages").insert({ name, email, subject, message });

    console.info("[api/contact] New message", {
      name,
      email,
      subject,
      messageLength: message.length,
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thanks for your message. I'll get back to you soon.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[api/contact]", error);
    return NextResponse.json(
      { error: "Failed to process contact form." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/contact",
    methods: ["POST"],
    body: {
      name: "string",
      email: "string",
      subject: "string",
      message: "string",
    },
  });
}
