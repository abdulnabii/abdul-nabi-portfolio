import {
  createSessionToken,
  getSessionCookieName,
  sessionCookieOptions,
  verifyCredentials,
} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
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
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = createSessionToken(email);
    const response = NextResponse.json({
      success: true,
      email: email.toLowerCase(),
    });

    response.cookies.set(getSessionCookieName(), token, sessionCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
