import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  scheduleSocialPost,
  cancelSocialPostSchedule,
  getSocialPosts,
} from "@/lib/social-bot-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { postId, scheduledAt, action } = body;

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    if (action === "cancel") {
      const updated = await cancelSocialPostSchedule(postId);
      return NextResponse.json({ ok: true, post: updated, message: "Schedule cancelled — reverted to draft." });
    }

    if (!scheduledAt) {
      return NextResponse.json({ error: "Missing scheduledAt date string" }, { status: 400 });
    }

    const schedDate = new Date(scheduledAt);
    if (isNaN(schedDate.getTime()) || schedDate.getTime() <= Date.now()) {
      return NextResponse.json({ error: "Scheduled date must be in the future" }, { status: 400 });
    }

    const updated = await scheduleSocialPost(postId, schedDate.toISOString());
    return NextResponse.json({
      ok: true,
      post: updated,
      message: `Post scheduled for ${schedDate.toLocaleString()}`,
    });
  } catch (err: any) {
    console.error("POST /api/admin/social-bot/schedule error:", err);
    return NextResponse.json({ error: err.message || "Failed to schedule social post" }, { status: 500 });
  }
}
