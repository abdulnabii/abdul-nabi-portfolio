import { getAdminSession } from "@/lib/auth";
import { getExperienceData, saveExperienceData } from "@/lib/settings-store";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getExperienceData();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await saveExperienceData(body);

    revalidatePath("/", "layout");
    revalidatePath("/experience", "layout");
    revalidatePath("/admin/experience", "layout");

    return NextResponse.json({ success: true, experience: updated });
  } catch (err) {
    console.error("Save experience error:", err);
    return NextResponse.json({ error: "Failed to save experience entries" }, { status: 500 });
  }
}
