import { NextRequest, NextResponse } from "next/server";
import { supabaseDbQuery, supabaseDbUpsert } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface SubscriberItem {
  email: string;
  source?: string;
  subscribedAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const source = (body.source || "website").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Fetch existing subscribers from Supabase
    let subscribers: SubscriberItem[] = [];
    try {
      const rows = await supabaseDbQuery<{ key: string; value: string }>(
        "site_settings",
        "key=eq.newsletter_subscribers&select=value"
      );
      if (rows && rows.length > 0 && rows[0].value) {
        subscribers = JSON.parse(rows[0].value);
      }
    } catch (fetchErr) {
      console.warn("Could not fetch existing subscribers, starting fresh list:", fetchErr);
    }

    // Check if already subscribed
    const existing = subscribers.find((s) => s.email === email);
    if (!existing) {
      subscribers.unshift({
        email,
        source,
        subscribedAt: new Date().toISOString(),
      });

      // Keep up to 5000 subscribers
      if (subscribers.length > 5000) {
        subscribers = subscribers.slice(0, 5000);
      }

      await supabaseDbUpsert("site_settings", [
        {
          key: "newsletter_subscribers",
          value: JSON.stringify(subscribers),
          updated_at: new Date().toISOString(),
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing! You're on the list for weekly AI & web insights.",
      alreadySubscribed: Boolean(existing),
    });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return NextResponse.json(
      { error: "Failed to process subscription. Please try again later." },
      { status: 500 }
    );
  }
}
