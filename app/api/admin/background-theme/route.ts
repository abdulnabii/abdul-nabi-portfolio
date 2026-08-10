import { NextRequest, NextResponse } from "next/server";
import { supabaseDbQuery, supabaseDbUpsert } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const KEY_NIGHT = "background_theme_night";
const KEY_DAY = "background_theme_day";
const KEY_CURSOR = "cursor_style";
const KEY_DEFAULT_MODE = "default_theme_mode";

async function getSettings() {
  let night = "quantum-plasma";
  let day = "day-sunrise-dawn";
  let cursor = "halo-ring";
  let defaultMode = "dark";

  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>(
      "site_settings",
      `select=*&key=in.(${KEY_NIGHT},${KEY_DAY},${KEY_CURSOR},${KEY_DEFAULT_MODE},background_theme)`
    );
    if (rows && rows.length > 0) {
      for (const row of rows) {
        if (row.key === KEY_NIGHT || row.key === "background_theme") {
          night = row.value;
        }
        if (row.key === KEY_DAY) {
          day = row.value;
        }
        if (row.key === KEY_CURSOR) {
          cursor = row.value;
        }
        if (row.key === KEY_DEFAULT_MODE) {
          defaultMode = row.value;
        }
      }
    }
  } catch {}

  return {
    nightTheme: night,
    dayTheme: day,
    cursorStyle: cursor,
    defaultMode,
    theme: night,
  };
}

async function saveSettings(
  night?: string,
  day?: string,
  cursorStyle?: string,
  defaultMode?: string
): Promise<void> {
  const upserts: Array<{ key: string; value: string; updated_at: string }> = [];
  const now = new Date().toISOString();

  if (night && typeof night === "string") {
    upserts.push({ key: KEY_NIGHT, value: night, updated_at: now });
    upserts.push({ key: "background_theme", value: night, updated_at: now });
  }

  if (day && typeof day === "string") {
    upserts.push({ key: KEY_DAY, value: day, updated_at: now });
  }

  if (cursorStyle && typeof cursorStyle === "string") {
    upserts.push({ key: KEY_CURSOR, value: cursorStyle, updated_at: now });
  }

  if (defaultMode && typeof defaultMode === "string") {
    upserts.push({ key: KEY_DEFAULT_MODE, value: defaultMode, updated_at: now });
  }

  if (upserts.length > 0) {
    try {
      await supabaseDbUpsert("site_settings", upserts);
    } catch {}
  }
}

export async function GET() {
  const data = await getSettings();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nightTheme, dayTheme, cursorStyle, defaultMode, theme } = body;
  const nTheme = nightTheme || (typeof theme === "string" && !theme.startsWith("day-") ? theme : undefined);
  const dTheme = dayTheme || (typeof theme === "string" && theme.startsWith("day-") ? theme : undefined);
  await saveSettings(nTheme, dTheme, cursorStyle, defaultMode);

  try {
    revalidatePath("/", "layout");
    revalidatePath("/mini-projects", "layout");
  } catch {}

  const updatedData = await getSettings();

  return NextResponse.json(
    { ...updatedData, ok: true },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}
