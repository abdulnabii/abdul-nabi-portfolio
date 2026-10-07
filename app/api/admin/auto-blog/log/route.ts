import { NextResponse } from "next/server";
import { supabaseDbQuery } from "@/lib/supabase";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>(
      "site_settings",
      "select=*&key=eq.auto_blog_cron_log"
    );

    if (rows && rows.length > 0 && rows[0].value) {
      const log = JSON.parse(rows[0].value);
      return NextResponse.json(log);
    }

    return NextResponse.json({
      lastRun: null,
      created: [],
      skipped: [],
      errors: [],
      durationSeconds: 0,
    });
  } catch {
    return NextResponse.json({
      lastRun: null,
      created: [],
      skipped: [],
      errors: [],
      durationSeconds: 0,
    });
  }
}
