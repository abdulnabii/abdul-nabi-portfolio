import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "an_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SECRET = process.env.SESSION_SECRET;

// Warn at startup if required auth env vars are missing in production.
// We use console.error rather than throw to avoid crashing the module import
// chain — the per-function isAdminAuthConfigured() checks already return 503
// on every auth route when variables are absent.
if (
  process.env.NODE_ENV === "production" &&
  (!ADMIN_EMAIL || !ADMIN_PASSWORD || !SECRET || SECRET.length < 32)
) {
  console.error(
    "[auth] CRITICAL: Missing or invalid admin auth env vars. " +
    "Set ADMIN_EMAIL, ADMIN_PASSWORD, and SESSION_SECRET (>=32 chars) in Vercel."
  );
}

interface SessionPayload {
  role: "admin";
  email: string;
  exp: number;
}

function sign(payloadB64: string): string {
  if (!SECRET) {
    throw new Error("Admin authentication is not configured.");
  }
  return createHmac("sha256", SECRET).update(payloadB64).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyCredentials(email: string, password: string): boolean {
  if (!isAdminAuthConfigured()) return false;
  const emailMatches = safeEqual(
    email.trim().toLowerCase(),
    ADMIN_EMAIL!.toLowerCase()
  );
  const passMatches = safeEqual(password, ADMIN_PASSWORD!);
  return emailMatches && passMatches;
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(
    ADMIN_EMAIL && ADMIN_PASSWORD && SECRET && SECRET.length >= 32
  );
}

export function createSessionToken(email: string): string {
  if (!isAdminAuthConfigured()) {
    throw new Error("Admin authentication is not configured.");
  }
  const payload: SessionPayload = {
    role: "admin",
    email,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function parseSessionToken(
  token: string | undefined | null
): SessionPayload | null {
  if (!token || !isAdminAuthConfigured()) return null;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;
  if (!safeEqual(sign(payloadB64), signature)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as SessionPayload;
    if (payload.role !== "admin" || !payload.exp || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return parseSessionToken(token);
}

export async function requireAdminSession(): Promise<SessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
};
