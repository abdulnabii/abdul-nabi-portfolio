import { NextRequest, NextResponse } from "next/server";

/**
 * One-page section redirects and Auth Middleware.
 */
const SESSION_COOKIE = "an_admin_session";

async function hasValidAdminSession(token: string | undefined): Promise<boolean> {
  // Must use the same fallback as lib/auth.ts so the HMAC signatures match.
  const secret = process.env.SESSION_SECRET ?? "an-portfolio-admin-secret-key-2025-secure-random-value-here";
  if (!token || !secret || secret.length < 32) return false;

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
    const expected = Array.from(new Uint8Array(signed))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    if (signature !== expected) return false;

    const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    const payload = JSON.parse(decoded) as { role?: string; exp?: number };
    return payload.role === "admin" && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

const SECTION_REDIRECTS: Record<string, string> = {
  "/about": "/#about",
  "/work": "/#projects",
  "/stack": "/#stack",
  "/skills": "/#stack",
  "/experience": "/#experience",
  "/education": "/#education",
  "/contact": "/#contact",
};

// Public GET routes under /api/admin/ that site visitors need to load public theme, settings & section visibility
const PUBLIC_READ_API_ROUTES = [
  "/api/admin/background-theme",
  "/api/admin/settings",
  "/api/admin/sections",
  "/api/admin/about",
  "/api/admin/stack",
  "/api/admin/experience",
  "/api/admin/education",
  "/api/admin/achievements",
  "/api/admin/mini-projects",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. One-page section redirects
  const target = SECTION_REDIRECTS[pathname];
  if (target) {
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 2. Admin API & Page Auth Guard
  const isApiAdmin = pathname.startsWith("/api/admin");
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isApiAdmin || isAdminPage) {
    // Allow public GET access for public site settings & background theme APIs
    const isPublicRead =
      request.method === "GET" &&
      PUBLIC_READ_API_ROUTES.some((route) => pathname.startsWith(route));

    if (!isPublicRead) {
      const hasValidToken = await hasValidAdminSession(
        request.cookies.get(SESSION_COOKIE)?.value
      );

      if (!hasValidToken) {
        if (isApiAdmin) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
  }

  // 3. Prevent logged-in admin from visiting login page unnecessarily
  if (pathname === "/admin/login") {
    const hasValidToken = await hasValidAdminSession(
      request.cookies.get(SESSION_COOKIE)?.value
    );
    if (hasValidToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/about",
    "/work",
    "/stack",
    "/skills",
    "/experience",
    "/education",
    "/contact",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
