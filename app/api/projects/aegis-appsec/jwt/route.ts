import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

function base64UrlEncode(str: string | Buffer): string {
  const buf = typeof str === "string" ? Buffer.from(str) : str;
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, secret = "secret123", action = "verify" } = body;

    // Generate sample token mode
    if (action === "generate") {
      const header = { alg: "HS256", typ: "JWT" };
      const payload = {
        sub: "user_7894",
        name: "Dev Security Auditor",
        role: "admin",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        tenant_id: "tenant_alpha_01",
      };

      const encodedHeader = base64UrlEncode(JSON.stringify(header));
      const encodedPayload = base64UrlEncode(JSON.stringify(payload));
      const signature = crypto
        .createHmac("sha256", secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest();
      const encodedSignature = base64UrlEncode(signature);

      const generatedJwt = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

      return NextResponse.json({
        ok: true,
        token: generatedJwt,
        header,
        payload,
        secretUsed: secret,
      });
    }

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Please provide a JWT token string" }, { status: 400 });
    }

    const parts = token.trim().split(".");
    if (parts.length !== 3) {
      return NextResponse.json(
        { error: "Invalid JWT format. Token must contain exactly 3 dot-separated segments (Header.Payload.Signature)" },
        { status: 400 }
      );
    }

    let header: any = {};
    let payload: any = {};

    try {
      header = JSON.parse(base64UrlDecode(parts[0]));
    } catch {
      return NextResponse.json({ error: "Failed to decode JWT Header segment" }, { status: 400 });
    }

    try {
      payload = JSON.parse(base64UrlDecode(parts[1]));
    } catch {
      return NextResponse.json({ error: "Failed to decode JWT Payload segment" }, { status: 400 });
    }

    const signature = parts[2];
    const issues: { severity: "CRITICAL" | "HIGH" | "WARNING" | "INFO"; message: string; fix: string }[] = [];

    // Check 1: Algorithm 'none' Bypass
    if (header.alg === "none" || header.alg === "None" || header.alg === "NONE") {
      issues.push({
        severity: "CRITICAL",
        message: "Algorithm 'none' Vulnerability: The token explicitly turns off cryptographic signature verification.",
        fix: "Enforce strict algorithm whitelist (e.g., algorithms: ['HS256', 'RS256']) in JWT verification libraries.",
      });
    }

    // Check 2: Expiration Check
    const nowSec = Math.floor(Date.now() / 1000);
    if (!payload.exp) {
      issues.push({
        severity: "HIGH",
        message: "Missing 'exp' (Expiration) Claim: Token never expires and can be replayed indefinitely if intercepted.",
        fix: "Always set an explicit expiration claim (e.g. 15 minutes for access tokens) alongside refresh token rotation.",
      });
    } else if (payload.exp < nowSec) {
      const expiredAgoMinutes = Math.round((nowSec - payload.exp) / 60);
      issues.push({
        severity: "WARNING",
        message: `Token Expired: Token expired ${expiredAgoMinutes} minutes ago (${new Date(payload.exp * 1000).toLocaleString()}).`,
        fix: "Ensure clients refresh tokens via secure HttpOnly refresh cookie endpoints.",
      });
    }

    // Check 3: Weak Secret Validation (HMAC-SHA256)
    if (header.alg === "HS256" && secret) {
      const expectedSig = base64UrlEncode(
        crypto.createHmac("sha256", secret).update(`${parts[0]}.${parts[1]}`).digest()
      );
      const isSignatureValid = expectedSig === signature;

      if (secret.length < 32) {
        issues.push({
          severity: "HIGH",
          message: "Weak Signing Secret Key (< 32 characters / 256 bits). Vulnerable to offline dictionary brute-forcing.",
          fix: "Generate a cryptographically random secret with at least 32 bytes (256 bits): crypto.randomBytes(32).toString('hex')",
        });
      }

      if (!isSignatureValid) {
        issues.push({
          severity: "CRITICAL",
          message: "Signature Mismatch: The cryptographic signature does not match the header, payload, and provided secret key.",
          fix: "Reject unverified tokens immediately on all backend routes and middleware.",
        });
      }
    }

    return NextResponse.json({
      ok: true,
      header,
      payload,
      signatureSnippet: `${signature.slice(0, 12)}...`,
      issuesCount: issues.length,
      issues,
      status: issues.some((i) => i.severity === "CRITICAL")
        ? "COMPROMISED"
        : issues.some((i) => i.severity === "HIGH")
        ? "VULNERABLE"
        : issues.length > 0
        ? "WARNING"
        : "SECURE",
    });
  } catch (err: any) {
    console.error("[aegis-appsec/jwt error]", err);
    return NextResponse.json({ error: err.message || "JWT Inspection failed" }, { status: 500 });
  }
}
