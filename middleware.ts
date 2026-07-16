import { NextRequest, NextResponse } from "next/server";

/**
 * Keep a true one-page portfolio while preventing 404s on common paths.
 * /about → /#about, /projects → /#projects, etc.
 */
const SECTION_REDIRECTS: Record<string, string> = {
  "/about": "/#about",
  "/work": "/#projects",
  "/projects": "/#projects",
  "/stack": "/#stack",
  "/skills": "/#stack",
  "/experience": "/#experience",
  "/education": "/#education",
  "/contact": "/#contact",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const target = SECTION_REDIRECTS[pathname];

  if (target) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.hash = target.split("#")[1] ?? "";
    // Hash is client-only; use rewrite path + hash via redirect to home with hash
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/about",
    "/work",
    "/projects",
    "/stack",
    "/skills",
    "/experience",
    "/education",
    "/contact",
  ],
};
