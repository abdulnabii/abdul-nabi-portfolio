import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { runAutoBlog } from "@/lib/ai-blog-generator";
import { supabaseDbQuery, supabaseDbUpsert } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max (Vercel Pro allows up to 5min for cron)

const CRON_LOG_KEY = "auto_blog_cron_log";
const ENABLED_KEY = "auto_blog_enabled";

async function isAutoBlogEnabled(): Promise<boolean> {
  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>(
      "site_settings",
      `select=*&key=eq.${ENABLED_KEY}`
    );
    return rows?.[0]?.value !== "false"; // default true if no row
  } catch {
    return true;
  }
}

export async function GET(req: NextRequest) {
  try {
    // Security: Verify cron secret header OR Vercel cron caller
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "auto-blog-secret-2025";

    const isVercelCron = req.headers.get("user-agent")?.includes("vercel-cron");
    const isAuthorized = authHeader === `Bearer ${cronSecret}`;

    if (!isVercelCron && !isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if automation is enabled
    const enabled = await isAutoBlogEnabled();
    if (!enabled) {
      console.log("[auto-blog-cron] Automation is disabled — skipping run.");
      return NextResponse.json({ ok: true, skipped: true, reason: "Automation disabled by admin" });
    }

    const startTime = Date.now();
    console.log("[auto-blog-cron] Starting daily auto-blog run...");

    // Run the auto-blog generator (up to 3 posts)
    const result = await runAutoBlog(3);

    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`[auto-blog-cron] Completed in ${duration}s:`, result);

    // Revalidate blog pages
    if (result.created.length > 0) {
      revalidatePath("/", "layout");
      revalidatePath("/blog", "layout");
      result.created.forEach((slug) => {
        revalidatePath(`/blog/${slug}`, "layout");
      });
    }

    // Persist run log to Supabase for admin panel visibility
    try {
      const logEntry = {
        key: CRON_LOG_KEY,
        value: JSON.stringify({
          lastRun: new Date().toISOString(),
          created: result.created,
          skipped: result.skipped,
          errors: result.errors,
          durationSeconds: duration,
        }),
        updated_at: new Date().toISOString(),
      };
      await supabaseDbUpsert("site_settings", [logEntry]);
    } catch {}

    return NextResponse.json({
      ok: true,
      created: result.created,
      skipped: result.skipped,
      errors: result.errors,
      durationSeconds: duration,
    });
  } catch (err) {
    console.error("[auto-blog-cron] Fatal error:", err);
    return NextResponse.json(
      { error: "Cron job failed", message: String(err) },
      { status: 500 }
    );
  }
}

// Allow manual trigger from admin panel
export async function POST(req: NextRequest) {
  return GET(req);
}
