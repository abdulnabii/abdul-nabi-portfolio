import { getAdminSession } from "@/lib/auth";
import {
  getTrashedBlogs,
  restoreFromTrash,
  permanentlyDeleteFromTrash,
  emptyTrash,
} from "@/lib/blog-store";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trash = await getTrashedBlogs();
    return NextResponse.json({ trash });
  } catch {
    return NextResponse.json({ error: "Failed to load trash" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      action: "restore" | "permanent-delete" | "empty-trash";
      slug?: string;
      publishNow?: boolean;
    };

    if (body.action === "restore" && body.slug) {
      const restored = await restoreFromTrash(body.slug, body.publishNow ?? false);
      revalidatePath("/", "layout");
      revalidatePath("/blog", "layout");
      if (body.slug) revalidatePath(`/blog/${body.slug}`, "layout");
      return NextResponse.json({ success: true, post: restored, action: "restored" });
    }

    if (body.action === "permanent-delete" && body.slug) {
      await permanentlyDeleteFromTrash(body.slug);
      return NextResponse.json({ success: true, action: "deleted_forever" });
    }

    if (body.action === "empty-trash") {
      await emptyTrash();
      return NextResponse.json({ success: true, action: "trash_emptied" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Trash action failed" }, { status: 500 });
  }
}
