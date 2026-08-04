import { getAdminSession } from "@/lib/auth";
import { getSkillsData, saveSkillsData } from "@/lib/settings-store";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const data = await getSkillsData();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await saveSkillsData(body);

    revalidatePath("/", "layout");
    revalidatePath("/stack", "layout");
    revalidatePath("/admin/stack", "layout");

    return NextResponse.json({ success: true, skills: updated });
  } catch (err) {
    console.error("Save skills error:", err);
    return NextResponse.json({ error: "Failed to save skills stack" }, { status: 500 });
  }
}
