import { NextRequest, NextResponse } from "next/server";
import {
  generateAdminOtp,
  getAdminEmails,
  isAdminEmail,
  sendAdminOtpEmail,
  ADMIN_OTP_CHALLENGE_COOKIE,
} from "@/lib/admin-otp";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 requests per 5 minutes per IP
    const rateCheck = checkRateLimit(req, "admin-otp-request", 5, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many security code requests. Please wait 5 minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    let targetEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    const allowedAdmins = getAdminEmails();
    if (allowedAdmins.length === 0) {
      return NextResponse.json(
        { error: "Admin authentication is not configured on server (ADMIN_EMAIL is missing)." },
        { status: 503 }
      );
    }

    if (!targetEmail) {
      targetEmail = allowedAdmins[0];
    }

    // Verify email is authorized admin
    if (!isAdminEmail(targetEmail)) {
      return NextResponse.json(
        { error: "Access denied: This email is not authorized as an administrator." },
        { status: 403 }
      );
    }

    // Generate cryptographic OTP and challenge token
    const { code, challengeToken, expiresAt } = generateAdminOtp(targetEmail);

    // Send email via Resend (or log to console in dev/fallback)
    const emailResult = await sendAdminOtpEmail(targetEmail, code);

    // Mask email for display: e.g. a***i@gmail.com
    const [local, domain] = targetEmail.split("@");
    const maskedEmail =
      local.length > 2
        ? `${local[0]}***${local[local.length - 1]}@${domain}`
        : `${local[0]}***@${domain}`;

    const response = NextResponse.json({
      success: true,
      emailDelivered: emailResult.deliveredRealEmail,
      message: emailResult.deliveredRealEmail
        ? `Security OTP code has been dispatched to ${maskedEmail}. Please check your inbox and Spam / Junk folder.`
        : `Security code generated! (Email provider not configured, code logged to console).`,
      maskedEmail,
      expiresAt,
    });

    // Store challengeToken in HTTP-only cookie for secure multi-step verification
    response.cookies.set(ADMIN_OTP_CHALLENGE_COOKIE, challengeToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60, // 10 minutes
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate security code";
    console.error("[admin-otp/request] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
