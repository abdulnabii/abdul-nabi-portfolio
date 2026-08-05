import { getProjectById, updateProject } from "@/lib/project-store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const projectId = context.params.id;
    const cookieName = `liked_${projectId}`;
    const existingCookie = request.cookies.get(cookieName)?.value;

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // If visitor already liked this project in the active session, return current count
    if (existingCookie) {
      return NextResponse.json({
        success: true,
        alreadyAppreciated: true,
        id: project.id,
        appreciations: project.appreciations ?? 0,
      });
    }

    const currentCount = project.appreciations ?? 0;
    const updated = await updateProject(projectId, {
      appreciations: currentCount + 1,
    });

    const { addInboxItem } = await import("@/lib/inbox-store");
    await addInboxItem("appreciation", {
      projectTitle: project.title,
      projectSlug: project.id,
      count: currentCount + 1,
    });

    const { recordAnalyticsEvent } = await import("@/lib/analytics-store");
    await recordAnalyticsEvent({
      event_type: "cta_click",
      cta_label: `Appreciated ${project.title}`,
      page_slug: `/projects/${project.id}`,
    });

    const response = NextResponse.json({
      success: true,
      id: updated.id,
      appreciations: updated.appreciations,
    });

    // Set 24h deduplication cookie
    response.cookies.set(cookieName, "1", {
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("[api/projects/[id]/appreciate]", error);
    return NextResponse.json(
      { error: "Failed to submit appreciation." },
      { status: 500 }
    );
  }
}
