import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitRecord>>();

/**
 * In-memory sliding-window rate limiter for Next.js API routes.
 * Automatically cleans up stale entries to prevent memory leaks.
 */
export function checkRateLimit(
  req: NextRequest,
  bucketName: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown-client";

  let bucket = stores.get(bucketName);
  if (!bucket) {
    bucket = new Map<string, RateLimitRecord>();
    stores.set(bucketName, bucket);
  }

  const now = Date.now();
  const record = bucket.get(ip);

  // Sweep expired entries if map gets large
  if (bucket.size > 2000) {
    bucket.forEach((val, key) => {
      if (now > val.resetAt) {
        bucket?.delete(key);
      }
    });
  }

  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    bucket.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
}
