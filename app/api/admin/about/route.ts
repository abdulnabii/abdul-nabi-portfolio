import { getAdminSession } from "@/lib/auth";
import { getAboutData, saveAboutData } from "@/lib/settings-store";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getAboutData();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await saveAboutData(body);

    revalidatePath("/", "layout");
    revalidatePath("/about", "layout");
    revalidatePath("/admin/about", "layout");

    return NextResponse.json({ success: true, about: updated });
  } catch (err) {
    console.error("Save about error:", err);
    return NextResponse.json({ error: "Failed to save about content" }, { status: 500 });
  }
}
