import { getAdminSession } from "@/lib/auth";
import { getAchievements, saveAchievements } from "@/lib/settings-store";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const achievements = await getAchievements();
  return NextResponse.json({ achievements });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const updated = await saveAchievements(body.achievements ?? body);
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, achievements: updated });
  } catch (err) {
    console.error("Save achievements error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
