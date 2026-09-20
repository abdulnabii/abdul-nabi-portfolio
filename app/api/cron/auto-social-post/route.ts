import { NextRequest, NextResponse } from "next/server";
import { executeAutoPosterCycle } from "@/lib/social-bot-scheduler";
import { getSocialCredentials } from "@/lib/social-credentials-store";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function isAuthorizedCaller(req: NextRequest): Promise<boolean> {
  // 1. Check CRON_SECRET Bearer header (for Vercel Cron or automated schedulers)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // 2. Check logged-in admin session (for manual trigger from Admin Dashboard)
  const session = await getAdminSession();
  if (session && session.role === "admin") {
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  try {
    if (!(await isAuthorizedCaller(req))) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    const creds = await getSocialCredentials();
    if (!force && !creds.autoPosterActive) {
      return NextResponse.json({
        ok: false,
        message: "Auto-Poster Bot is currently paused in Admin Panel.",
      });
    }

    const result = await executeAutoPosterCycle();
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Auto-poster cycle failed";
    console.error("GET /api/cron/auto-social-post error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAuthorizedCaller(req))) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }

    const result = await executeAutoPosterCycle();
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Auto-poster cycle failed";
    console.error("POST /api/cron/auto-social-post error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
