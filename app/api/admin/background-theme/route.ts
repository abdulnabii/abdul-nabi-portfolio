import { NextRequest, NextResponse } from "next/server";
import { supabaseDbQuery, supabaseDbUpsert } from "@/lib/supabase";

const SETTING_KEY = "background_theme";
let memoryTheme = "quantum-plasma";

async function getTheme(): Promise<string> {
  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>(
      "site_settings",
      `select=*&key=eq.${SETTING_KEY}`
    );
    if (rows && rows.length > 0) {
      memoryTheme = rows[0].value;
    }
  } catch {}
  return memoryTheme;
}

async function saveTheme(theme: string): Promise<void> {
  memoryTheme = theme;
  try {
    await supabaseDbUpsert("site_settings", [
      { key: SETTING_KEY, value: theme, updated_at: new Date().toISOString() },
    ]);
  } catch {}
}

export async function GET() {
  const theme = await getTheme();
  return NextResponse.json({ theme });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { theme } = body;
  if (!theme || typeof theme !== "string") {
    return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
  }
  await saveTheme(theme);
  return NextResponse.json({ theme, ok: true });
}
