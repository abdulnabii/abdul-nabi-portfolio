import { getAdminSession } from "@/lib/auth";
import { getSiteSettings, saveSiteSettings } from "@/lib/settings-store";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await saveSiteSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    console.error("Save settings error:", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
