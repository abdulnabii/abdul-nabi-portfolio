import { getAdminSession } from "@/lib/auth";
import { getCertifications, saveCertifications } from "@/lib/settings-store";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const certifications = await getCertifications();
  return NextResponse.json({ certifications });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const updated = await saveCertifications(body.certifications ?? body);
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, certifications: updated });
  } catch (err) {
    console.error("Save certifications error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
