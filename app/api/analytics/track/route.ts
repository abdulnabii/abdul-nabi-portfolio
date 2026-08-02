import { recordAnalyticsEvent } from "@/lib/analytics-store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_type, page_slug, cta_label, session_id } = body;

    if (!event_type || (event_type !== "page_view" && event_type !== "cta_click")) {
      return NextResponse.json({ error: "Invalid event_type" }, { status: 400 });
    }

    await recordAnalyticsEvent({
      event_type,
      page_slug: page_slug || "",
      cta_label: cta_label || "",
      session_id: session_id || "",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Analytics track error:", err);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
