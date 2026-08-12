import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

interface ContactPayload {
  name?: string;
  email?: string;
  company?: string;
  subject?: string;
  message?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as ContactPayload;

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const company = body.company?.trim() ?? "";
    const subject = body.subject?.trim() ?? "";
    const message = body.message?.trim() ?? "";

    const errors: string[] = [];

    if (!name || name.length < 2) {
      errors.push("Name must be at least 2 characters.");
    }
    if (!email || !isValidEmail(email)) {
      errors.push("A valid email address is required.");
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

    // Sanitize for email template
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeCompany = escapeHtml(company);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    // 1. Store in inbox store (Supabase DB + Memory store fallback, ZERO filesystem operations)
    try {
      const { addInboxItem } = await import("@/lib/inbox-store");
      await addInboxItem("message", { name, email, company, subject, message });
    } catch (storeErr) {
      console.error("[api/contact] Inbox store error:", storeErr);
    }

    // 2. Transactional Email via Resend SDK
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "[api/contact] Warning: RESEND_API_KEY environment variable is not configured on Vercel."
      );
    } else {
      const resend = new Resend(apiKey);
      const toEmail = process.env.CONTACT_NOTIFICATION_EMAIL || "abdulnabi.khaskhely@gmail.com";
      const fromEmail = process.env.RESEND_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";

      const sendResult = await resend.emails.send({
        from: fromEmail,
        to: [toEmail],
        replyTo: email,
        subject: `[Portfolio Contact] ${subject}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #4338ca; margin-top: 0;">New Portfolio Message</h2>
            <p><strong>From Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
            <p><strong>Company:</strong> ${safeCompany || "N/A"}</p>
            <p><strong>Subject:</strong> ${safeSubject}</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p><strong>Message:</strong></p>
            <div style="white-space: pre-wrap; background: #f8fafc; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6;">${safeMessage}</div>
          </div>
        `,
      });

      if (sendResult.error) {
        console.error("[api/contact] Resend API error:", sendResult.error);
        return NextResponse.json(
          { error: "Failed to deliver message via email provider. Please try again later." },
          { status: 500 }
        );
      }

      console.info("[api/contact] Resend email dispatched successfully:", sendResult.data?.id);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message sent — I'll reply within 1-2 business days.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[api/contact] Unexpected route exception:", error);
    return NextResponse.json(
      { error: "Failed to process contact submission. Please try again later." },
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
