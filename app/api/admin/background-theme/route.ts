import { NextRequest, NextResponse } from "next/server";
import { supabaseDbQuery, supabaseDbUpsert } from "@/lib/supabase";

const KEY_NIGHT = "background_theme_night";
const KEY_DAY = "background_theme_day";

let memoryNight = "quantum-plasma";
let memoryDay = "day-sunrise-dawn";

async function getThemes() {
  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>(
      "site_settings",
      `select=*&key=in.(${KEY_NIGHT},${KEY_DAY},background_theme)`
    );
    if (rows && rows.length > 0) {
      for (const row of rows) {
        if (row.key === KEY_NIGHT || row.key === "background_theme") {
          memoryNight = row.value;
        }
        if (row.key === KEY_DAY) {
          memoryDay = row.value;
        }
      }
    }
  } catch {}
  return { nightTheme: memoryNight, dayTheme: memoryDay, theme: memoryNight };
}

async function saveThemes(night?: string, day?: string): Promise<void> {
  const upserts: Array<{ key: string; value: string; updated_at: string }> = [];
  const now = new Date().toISOString();

  if (night && typeof night === "string") {
    memoryNight = night;
    upserts.push({ key: KEY_NIGHT, value: night, updated_at: now });
    upserts.push({ key: "background_theme", value: night, updated_at: now });
  }

  if (day && typeof day === "string") {
    memoryDay = day;
    upserts.push({ key: KEY_DAY, value: day, updated_at: now });
  }

  if (upserts.length > 0) {
    try {
      await supabaseDbUpsert("site_settings", upserts);
    } catch {}
  }
}

export async function GET() {
  const data = await getThemes();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nightTheme, dayTheme, theme } = body;
  const nTheme = nightTheme || (typeof theme === "string" && !theme.startsWith("day-") ? theme : undefined);
  const dTheme = dayTheme || (typeof theme === "string" && theme.startsWith("day-") ? theme : undefined);
  await saveThemes(nTheme, dTheme);
  return NextResponse.json({ nightTheme: memoryNight, dayTheme: memoryDay, ok: true });
}
