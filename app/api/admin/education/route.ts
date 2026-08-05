import { getAdminSession } from "@/lib/auth";
import { getEducationData, saveEducationData } from "@/lib/settings-store";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getEducationData();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await saveEducationData(body);

    revalidatePath("/", "layout");
    revalidatePath("/education", "layout");
    revalidatePath("/admin/experience", "layout");

    return NextResponse.json({ success: true, education: updated });
  } catch (err) {
    console.error("Save education error:", err);
    return NextResponse.json({ error: "Failed to save education entries" }, { status: 500 });
  }
}
