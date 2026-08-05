import { requireAdminSession } from "@/lib/auth";
import { archiveInboxItem, deleteInboxItem, markAsRead } from "@/lib/inbox-store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminSession();
    const body = (await request.json()) as { read?: boolean; archived?: boolean };
    const id = context.params.id;

    if (body.read !== undefined) {
      await markAsRead(id, body.read);
    }
    if (body.archived !== undefined) {
      await archiveInboxItem(id, body.archived);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(`[api/admin/inbox/[id]] PATCH error:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminSession();
    const id = context.params.id;
    await deleteInboxItem(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(`[api/admin/inbox/[id]] DELETE error:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
