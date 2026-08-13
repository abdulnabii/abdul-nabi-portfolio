import { NextResponse } from "next/server";
import { getMiniProjects } from "@/lib/mini-projects-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const all = await getMiniProjects();
    const miniProjects = all.filter((p) => !p.hidden);
    return NextResponse.json({ miniProjects });
  } catch (err) {
    console.error("GET /api/mini-projects error:", err);
    return NextResponse.json({ error: "Failed to fetch mini projects" }, { status: 500 });
  }
}
