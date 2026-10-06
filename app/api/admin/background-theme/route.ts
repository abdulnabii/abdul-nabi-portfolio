import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import {
  getBackgroundThemeSettings,
  saveBackgroundThemeSettings,
  BgThemeSettings,
} from "@/lib/theme-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getBackgroundThemeSettings();
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

  const updates: Partial<BgThemeSettings> = {};
  if (nTheme) updates.nightTheme = nTheme;
  if (dTheme) updates.dayTheme = dTheme;
  if (cursorStyle) updates.cursorStyle = cursorStyle;
  if (defaultMode === "dark" || defaultMode === "light") updates.defaultMode = defaultMode;

  const updatedData = await saveBackgroundThemeSettings(updates);

  try {
    revalidatePath("/", "layout");
    revalidatePath("/blog", "layout");
    revalidatePath("/projects", "layout");
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
