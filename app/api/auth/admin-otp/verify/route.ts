import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminOtp,
  ADMIN_OTP_CHALLENGE_COOKIE,
  getAdminEmails,
  isAdminEmail,
} from "@/lib/admin-otp";
import {
  createSessionToken,
  getSessionCookieName,
  sessionCookieOptions,
} from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 verification attempts per 5 minutes per IP
    const rateCheck = checkRateLimit(req, "admin-otp-verify", 10, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please wait 5 minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    let targetEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const bodyToken = typeof body?.challengeToken === "string" ? body.challengeToken : "";

    const allowedAdmins = getAdminEmails();
    if (!targetEmail && allowedAdmins.length > 0) {
      targetEmail = allowedAdmins[0];
    }

    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Please enter the valid 6-digit numeric security OTP code." },
        { status: 400 }
      );
    }

    if (!targetEmail || !isAdminEmail(targetEmail)) {
      return NextResponse.json(
        { error: "Access denied: Unauthorized administrator email address." },
        { status: 403 }
      );
    }

    // Resolve challenge token from cookie or body
    const cookieToken = req.cookies.get(ADMIN_OTP_CHALLENGE_COOKIE)?.value;
    const challengeToken = cookieToken || bodyToken;

    if (!challengeToken) {
      return NextResponse.json(
        { error: "No security challenge session found. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify cryptographic challenge token & code
    const verification = verifyAdminOtp(challengeToken, targetEmail, code);
    if (!verification.valid || !verification.email) {
      return NextResponse.json(
        { error: verification.error || "Invalid or expired security code. Please try again." },
        { status: 401 }
      );
    }

    const verifiedEmail = verification.email;
    const sessionToken = createSessionToken(verifiedEmail);

    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful!",
      email: verifiedEmail,
      redirect: "/admin",
    });

    // Set the standard admin session cookie
    response.cookies.set(getSessionCookieName(), sessionToken, sessionCookieOptions);

    // Delete the challenge cookie
    response.cookies.delete(ADMIN_OTP_CHALLENGE_COOKIE);

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification exception";
    console.error("[admin-otp/verify] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
