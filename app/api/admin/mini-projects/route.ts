import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getMiniProjects,
  createMiniProject,
  updateMiniProject,
  deleteMiniProject,
} from "@/lib/mini-projects-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const miniProjects = await getMiniProjects();
  return NextResponse.json({ miniProjects });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const created = await createMiniProject(body);
    return NextResponse.json({ miniProject: created, ok: true });
  } catch (err) {
    console.error("POST /api/admin/mini-projects error:", err);
    return NextResponse.json({ error: "Failed to create mini project" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Missing project id" }, { status: 400 });

    const updated = await updateMiniProject(id, updates);
    if (!updated) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    return NextResponse.json({ miniProject: updated, ok: true });
  } catch (err) {
    console.error("PUT /api/admin/mini-projects error:", err);
    return NextResponse.json({ error: "Failed to update mini project" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing project id" }, { status: 400 });

  const ok = await deleteMiniProject(id);
  return NextResponse.json({ ok });
}
