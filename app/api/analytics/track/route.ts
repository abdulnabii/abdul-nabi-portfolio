import { recordAnalyticsEvent } from "@/lib/analytics-store";
import { NextRequest, NextResponse } from "next/server";

const VISITOR_COOKIE_NAME = "an_session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { event_type, page_slug, cta_label, utm_source, utm_medium, utm_campaign, referrer } = body;

    if (!event_type || (event_type !== "page_view" && event_type !== "cta_click")) {
      return NextResponse.json({ error: "Invalid event_type" }, { status: 400 });
    }

    // Retrieve or issue an HttpOnly secure session cookie
    let sessionId = req.cookies.get(VISITOR_COOKIE_NAME)?.value || body.session_id;
    let isNewSession = false;

    if (!sessionId || typeof sessionId !== "string" || sessionId.length < 8) {
      sessionId = "sess_" + crypto.randomUUID().replace(/-/g, "");
      isNewSession = true;
    }

    await recordAnalyticsEvent({
      event_type,
      page_slug: page_slug || "",
      cta_label: cta_label || "",
      session_id: sessionId,
      utm_source,
      utm_medium,
      utm_campaign,
      referrer,
    });

    const response = NextResponse.json({ success: true });

    if (isNewSession) {
      response.cookies.set(VISITOR_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;
  } catch (err) {
    console.error("Analytics track error:", err);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
