import { NextRequest, NextResponse } from "next/server";
import { supabaseDbQuery, supabaseDbUpsert } from "@/lib/supabase";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ENABLED_KEY = "auto_blog_enabled";

export async function GET() {
  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>(
      "site_settings",
      `select=*&key=eq.${ENABLED_KEY}`
    );
    const enabled = rows?.[0]?.value !== "false"; // default: true
    return NextResponse.json({ enabled });
  } catch {
    return NextResponse.json({ enabled: true });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { enabled } = (await req.json()) as { enabled: boolean };
    await supabaseDbUpsert("site_settings", [
      {
        key: ENABLED_KEY,
        value: String(enabled),
        updated_at: new Date().toISOString(),
      },
    ]);
    return NextResponse.json({ enabled });
  } catch {
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}
