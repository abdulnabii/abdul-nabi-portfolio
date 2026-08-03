import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ?? "admin@localhost";
export const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ?? "change-this-password-in-env";

const SESSION_COOKIE = "an_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SECRET =
  process.env.SESSION_SECRET ?? "dev-only-secret-key-do-not-use-in-prod";

interface SessionPayload {
  role: "admin";
  email: string;
  exp: number;
}

function sign(payloadB64: string): string {
  return createHmac("sha256", SECRET).update(payloadB64).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    password === ADMIN_PASSWORD
  );
}

export function createSessionToken(email: string): string {
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
  if (!token) return null;
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
