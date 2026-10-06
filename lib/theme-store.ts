import { supabaseDbQuery, supabaseDbUpsert } from "./supabase";
import fs from "fs";
import path from "path";
import os from "os";

export interface BgThemeSettings {
  nightTheme: string;
  dayTheme: string;
  cursorStyle: string;
  defaultMode: "dark" | "light";
  theme: string;
}

export const DEFAULT_BG_THEME: BgThemeSettings = {
  nightTheme: "quantum-plasma",
  dayTheme: "day-sunrise-dawn",
  cursorStyle: "halo-ring",
  defaultMode: "dark",
  theme: "quantum-plasma",
};

const THEME_PRIMARY_FILE = path.join(process.cwd(), "data", "bg-theme.json");
const THEME_TMP_FILE = path.join(os.tmpdir(), "an_bg_theme.json");

let memoryTheme: BgThemeSettings | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10000; // 10s memory cache

function loadLocalThemeFile(): Partial<BgThemeSettings> {
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

function persistLocalThemeFile(data: BgThemeSettings) {
  memoryTheme = { ...data };
  lastFetchTime = Date.now();
  const jsonStr = JSON.stringify(data, null, 2);

  // 1. Write to tmp file (writable on serverless)
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

export async function getBackgroundThemeSettings(): Promise<BgThemeSettings> {
  const now = Date.now();
  if (memoryTheme && now - lastFetchTime < CACHE_TTL_MS) {
    return memoryTheme;
  }

  const localData = loadLocalThemeFile();
  const current: BgThemeSettings = {
    ...DEFAULT_BG_THEME,
    ...localData,
    ...(memoryTheme || {}),
  };

  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>(
      "site_settings",
      "select=key,value&key=in.(background_theme_night,background_theme_day,cursor_style,default_theme_mode,background_theme)"
    );

    if (rows && rows.length > 0) {
      for (const row of rows) {
        if (row.key === "background_theme_night" || row.key === "background_theme") {
          current.nightTheme = row.value;
          current.theme = row.value;
        }
        if (row.key === "background_theme_day") {
          current.dayTheme = row.value;
        }
        if (row.key === "cursor_style") {
          current.cursorStyle = row.value;
        }
        if (row.key === "default_theme_mode") {
          current.defaultMode = row.value === "light" ? "light" : "dark";
        }
      }
      persistLocalThemeFile(current);
    }
  } catch (err) {
    // Graceful fallback to local persisted data
  }

  memoryTheme = current;
  lastFetchTime = Date.now();
  return current;
}

export async function saveBackgroundThemeSettings(
  updates: Partial<BgThemeSettings>
): Promise<BgThemeSettings> {
  const current = await getBackgroundThemeSettings();
  const merged: BgThemeSettings = {
    ...current,
    ...updates,
    nightTheme: updates.nightTheme || updates.theme || current.nightTheme,
    theme: updates.nightTheme || updates.theme || current.theme,
    defaultMode: updates.defaultMode || current.defaultMode,
  };

  // 1. Immediately persist locally & in-memory
  persistLocalThemeFile(merged);

  // 2. Persist to Supabase
  const now = new Date().toISOString();
  const records: Array<{ key: string; value: string; updated_at: string }> = [];

  if (updates.nightTheme || updates.theme) {
    const val = updates.nightTheme || updates.theme!;
    records.push({ key: "background_theme_night", value: val, updated_at: now });
    records.push({ key: "background_theme", value: val, updated_at: now });
  }
  if (updates.dayTheme) {
    records.push({ key: "background_theme_day", value: updates.dayTheme, updated_at: now });
  }
  if (updates.cursorStyle) {
    records.push({ key: "cursor_style", value: updates.cursorStyle, updated_at: now });
  }
  if (updates.defaultMode) {
    records.push({ key: "default_theme_mode", value: updates.defaultMode, updated_at: now });
  }

  if (records.length > 0) {
    try {
      await supabaseDbUpsert("site_settings", records);
    } catch (err) {
      console.warn("[theme-store] Supabase upsert notice:", err);
    }
  }

  return merged;
}
