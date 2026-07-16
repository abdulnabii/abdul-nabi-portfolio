import { getProjectById, updateProject } from "@/lib/project-store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const project = await getProjectById(context.params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const currentCount = project.appreciations ?? 0;
    const updated = await updateProject(context.params.id, {
      appreciations: currentCount + 1,
    });

    return NextResponse.json({
      success: true,
      id: updated.id,
      appreciations: updated.appreciations,
    });
  } catch (error) {
    console.error("[api/projects/[id]/appreciate]", error);
    return NextResponse.json(
      { error: "Failed to submit appreciation." },
      { status: 500 }
    );
  }
}
