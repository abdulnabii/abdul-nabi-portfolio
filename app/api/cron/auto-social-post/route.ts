import { NextRequest, NextResponse } from "next/server";
import { executeAutoPosterCycle } from "@/lib/social-bot-scheduler";
import { getSocialCredentials } from "@/lib/social-credentials-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
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
  } catch (err: any) {
    console.error("GET /api/cron/auto-social-post error:", err);
    return NextResponse.json({ error: err.message || "Auto-poster cycle failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await executeAutoPosterCycle();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("POST /api/cron/auto-social-post error:", err);
    return NextResponse.json({ error: err.message || "Auto-poster cycle failed" }, { status: 500 });
  }
}
