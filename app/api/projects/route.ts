import { getAdminSession } from "@/lib/auth";
import {
  createProject,
  getAllProjects,
  getFeaturedProjects,
} from "@/lib/project-store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "1";
    const session = await getAdminSession();

    if (all) {
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const projects = await getAllProjects();
      return NextResponse.json({ projects });
    }

    const projects = await getFeaturedProjects();
    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json(
      { error: "Failed to load projects." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (
      !body.title?.trim() ||
      !body.description?.trim() ||
      !body.problem?.trim() ||
      !body.role?.trim() ||
      !body.outcome?.trim()
    ) {
      return NextResponse.json(
        { error: "Title, description, problem, role, and outcome are required." },
        { status: 400 }
      );
    }

    const project = await createProject(body);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("[api/projects POST]", error);
    if (error instanceof Error && error.message === "PROJECT_EXISTS") {
      return NextResponse.json(
        { error: "A project with this ID or title already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create project." },
      { status: 500 }
    );
  }
}
