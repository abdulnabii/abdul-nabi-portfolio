import { NextRequest, NextResponse } from "next/server";
import { supabaseDbQuery, supabaseDbUpsert } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const KEY_NIGHT = "background_theme_night";
const KEY_DAY = "background_theme_day";
const KEY_CURSOR = "cursor_style";
const KEY_DEFAULT_MODE = "default_theme_mode";

const THEME_PRIMARY_FILE = path.join(process.cwd(), "data", "bg-theme.json");
const THEME_TMP_FILE = path.join(os.tmpdir(), "an_bg_theme.json");

export interface BgThemeSettings {
  nightTheme: string;
  dayTheme: string;
  cursorStyle: string;
  defaultMode: string;
  theme: string;
}

const DEFAULT_THEME_SETTINGS: BgThemeSettings = {
  nightTheme: "quantum-plasma",
  dayTheme: "day-sunrise-dawn",
  cursorStyle: "halo-ring",
  defaultMode: "dark",
  theme: "quantum-plasma",
};

let memoryTheme: BgThemeSettings = { ...DEFAULT_THEME_SETTINGS };

function loadPersistedTheme(): Partial<BgThemeSettings> {
  // 1. Try tmp file (runtime serverless writes)
  try {
    if (fs.existsSync(THEME_TMP_FILE)) {
      const raw = fs.readFileSync(THEME_TMP_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch {}

  // 2. Try primary repo file
  try {
    if (fs.existsSync(THEME_PRIMARY_FILE)) {
      const raw = fs.readFileSync(THEME_PRIMARY_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch {}

  return {};
}

function persistTheme(data: BgThemeSettings) {
  memoryTheme = { ...data };
  const jsonStr = JSON.stringify(data, null, 2);

  // 1. Write to tmp file (guaranteed on serverless)
  try {
    fs.writeFileSync(THEME_TMP_FILE, jsonStr, "utf-8");
  } catch {}

  // 2. Write to primary repo file if writable
  try {
    const dir = path.dirname(THEME_PRIMARY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(THEME_PRIMARY_FILE, jsonStr, "utf-8");
  } catch {}
}

async function getSettings(): Promise<BgThemeSettings> {
  const persisted = loadPersistedTheme();
  const current: BgThemeSettings = {
    ...DEFAULT_THEME_SETTINGS,
    ...persisted,
    ...memoryTheme,
  };

  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>(
      "site_settings",
      `select=*&key=in.(${KEY_NIGHT},${KEY_DAY},${KEY_CURSOR},${KEY_DEFAULT_MODE},background_theme)`
    );
    if (rows && rows.length > 0) {
      for (const row of rows) {
        if (row.key === KEY_NIGHT || row.key === "background_theme") {
          current.nightTheme = row.value;
          current.theme = row.value;
        }
        if (row.key === KEY_DAY) {
          current.dayTheme = row.value;
        }
        if (row.key === KEY_CURSOR) {
          current.cursorStyle = row.value;
        }
        if (row.key === KEY_DEFAULT_MODE) {
          current.defaultMode = row.value;
        }
      }
      persistTheme(current);
    }
  } catch {
    // Supabase quota restriction or offline — graceful fallback to local persisted data
  }

  return current;
}

async function saveSettings(
  night?: string,
  day?: string,
  cursorStyle?: string,
  defaultMode?: string
): Promise<BgThemeSettings> {
  const current = await getSettings();
  if (night && typeof night === "string") {
    current.nightTheme = night;
    current.theme = night;
  }
  if (day && typeof day === "string") {
    current.dayTheme = day;
  }
  if (cursorStyle && typeof cursorStyle === "string") {
    current.cursorStyle = cursorStyle;
  }
  if (defaultMode && typeof defaultMode === "string") {
    current.defaultMode = defaultMode;
  }

  // 1. Persist immediately to in-memory cache, tmp file, and local repo file
  persistTheme(current);

  // 2. Dual-write to Supabase if accessible
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

  return current;
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
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { nightTheme, dayTheme, cursorStyle, defaultMode, theme } = body;
  const nTheme = nightTheme || (typeof theme === "string" && !theme.startsWith("day-") ? theme : undefined);
  const dTheme = dayTheme || (typeof theme === "string" && theme.startsWith("day-") ? theme : undefined);

  const updatedData = await saveSettings(nTheme, dTheme, cursorStyle, defaultMode);

  try {
    revalidatePath("/", "layout");
    revalidatePath("/mini-projects", "layout");
  } catch {}

  return NextResponse.json(
    { ...updatedData, ok: true },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}
