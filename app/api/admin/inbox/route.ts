import { requireAdminSession } from "@/lib/auth";
import { getAllInboxItems, getUnreadCount, markAllAsRead } from "@/lib/inbox-store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    const items = await getAllInboxItems();
    const unreadCount = await getUnreadCount();

    return NextResponse.json({ items, unreadCount });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/admin/inbox] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT() {
  try {
    await requireAdminSession();
    await markAllAsRead();
    const items = await getAllInboxItems();
    const unreadCount = await getUnreadCount();

    return NextResponse.json({ success: true, items, unreadCount });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/admin/inbox] PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
