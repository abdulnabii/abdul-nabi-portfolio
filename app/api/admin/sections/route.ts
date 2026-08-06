import { getAdminSession } from "@/lib/auth";
import { getSectionVisibility, saveSectionVisibility } from "@/lib/settings-store";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const visibility = await getSectionVisibility();
  return NextResponse.json({ visibility });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const updated = await saveSectionVisibility(body);
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, visibility: updated });
  } catch (err) {
    console.error("Save sections error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
