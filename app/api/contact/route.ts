import { NextRequest, NextResponse } from "next/server";

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

    // 1. Try storing in Inbox store (Supabase DB + Memory + File fallback)
    try {
      const { addInboxItem } = await import("@/lib/inbox-store");
      await addInboxItem("message", { name, email, company, subject, message });
    } catch (storeError) {
      console.error("[api/contact] Warning: Inbox storage failed:", storeError);
    }

    // 2. Try sending email via Resend if RESEND_API_KEY is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const toEmail = process.env.CONTACT_NOTIFICATION_EMAIL || "abdulnabi.khaskhely@gmail.com";
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Portfolio Contact Form <onboarding@resend.dev>",
            to: [toEmail],
            subject: `[Portfolio Inquiry] ${subject}`,
            html: `
              <h2>New Contact Form Message</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Company:</strong> ${company || "N/A"}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <hr />
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            `,
          }),
        });

        if (!emailRes.ok) {
          const resendErr = await emailRes.text();
          console.error("[api/contact] Resend API error:", resendErr);
        } else {
          console.info("[api/contact] Resend email notification sent successfully.");
        }
      } catch (emailError) {
        console.error("[api/contact] Resend fetch exception:", emailError);
      }
    }

    console.info("[api/contact] Contact form submission processed successfully", {
      name,
      email,
      subject,
      company,
      hasResendKey: Boolean(resendApiKey),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thanks for reaching out! Your message was received successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[api/contact] Unexpected submission error:", error);
    return NextResponse.json(
      { error: "Service temporarily unable to store message. Please try emailing directly." },
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
