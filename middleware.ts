import { NextRequest, NextResponse } from "next/server";

/**
 * One-page section redirects and Auth Middleware.
 */
const SESSION_COOKIE = "an_admin_session";

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

export function middleware(request: NextRequest) {
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
      const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
      const hasValidToken = Boolean(
        sessionToken && sessionToken.includes(".") && sessionToken.length > 20
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
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
    if (sessionToken && sessionToken.includes(".") && sessionToken.length > 20) {
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
