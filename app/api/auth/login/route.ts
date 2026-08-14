import {
  createSessionToken,
  getSessionCookieName,
  isAdminAuthConfigured,
  sessionCookieOptions,
  verifyCredentials,
} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiting map for login protection
const failedLoginAttempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthConfigured()) {
      console.error("[api/auth/login] Admin authentication is not configured.");
      return NextResponse.json(
        { error: "Admin sign-in is temporarily unavailable." },
        { status: 503 }
      );
    }

    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
    const now = Date.now();

    // Check rate limit threshold (5 failed attempts per 15 minutes window)
    const attemptRecord = failedLoginAttempts.get(clientIp);
    if (attemptRecord) {
      if (now < attemptRecord.resetAt && attemptRecord.count >= 5) {
        return NextResponse.json(
          { error: "Too many failed login attempts. Account locked for 15 minutes." },
          { status: 429 }
        );
      }
      if (now >= attemptRecord.resetAt) {
        failedLoginAttempts.delete(clientIp);
      }
    }

    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (!verifyCredentials(email, password)) {
      const current = failedLoginAttempts.get(clientIp) || { count: 0, resetAt: now + 900000 };
      failedLoginAttempts.set(clientIp, {
        count: current.count + 1,
        resetAt: current.resetAt,
      });

      return NextResponse.json(
        { error: "Invalid credentials provided." },
        { status: 401 }
      );
    }

    // Reset failed login counter on success
    failedLoginAttempts.delete(clientIp);

    const token = createSessionToken(email);
    const response = NextResponse.json({
      success: true,
      email: email.toLowerCase(),
    });

    response.cookies.set(getSessionCookieName(), token, sessionCookieOptions);
    return response;
  } catch (err) {
    console.error("[api/auth/login] Login exception:", err);
    return NextResponse.json({ error: "Internal authentication error." }, { status: 500 });
  }
}
