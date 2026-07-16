import { getAdminSession } from "@/lib/auth";
import {
  deleteProject,
  getProjectById,
  updateProject,
} from "@/lib/project-store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const project = await getProjectById(context.params.id);
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch {
    return NextResponse.json(
      { error: "Failed to load project." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const project = await updateProject(context.params.id, body);
    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      if (error.message === "PROJECT_EXISTS") {
        return NextResponse.json(
          { error: "Another project already uses that ID." },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to update project." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteProject(context.params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete project." },
      { status: 500 }
    );
  }
}
