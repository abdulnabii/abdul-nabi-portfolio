import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getSocialPosts,
  createSocialPost,
  deleteSocialPost,
  saveSocialPosts,
} from "@/lib/social-bot-store";
import { getMiniProjects } from "@/lib/mini-projects-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await getSocialPosts();
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { miniProjectId, customProj, imageUrl, scheduledAt, status } = body;

    let targetProject = customProj;
    if (miniProjectId) {
      const allMini = await getMiniProjects();
      const found = allMini.find((p) => p.id === miniProjectId);
      if (found) targetProject = found;
    }

    if (!targetProject) {
      return NextResponse.json({ error: "No target project found" }, { status: 400 });
    }

    const created = await createSocialPost(targetProject, imageUrl, {
      scheduledAt,
      status: status || (scheduledAt ? "Scheduled" : "Draft"),
    });
    return NextResponse.json({ post: created, ok: true });
  } catch (err) {
    console.error("POST /api/admin/social-bot error:", err);
    return NextResponse.json({ error: "Failed to generate social posts" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing post id" }, { status: 400 });

  const ok = await deleteSocialPost(id);
  return NextResponse.json({ ok });
}
