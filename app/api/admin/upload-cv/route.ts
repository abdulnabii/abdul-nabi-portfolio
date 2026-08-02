import { getAdminSession } from "@/lib/auth";
import { saveSiteSettings } from "@/lib/settings-store";
import { supabaseStorageUpload } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No PDF file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF files are allowed." },
        { status: 400 }
      );
    }

    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: "File exceeds 5MB size limit." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicUrl = await supabaseStorageUpload(
      "cv",
      "ab_resume.pdf",
      buffer,
      "application/pdf"
    );

    const finalCvUrl = publicUrl || "/ab_resume.pdf";
    await saveSiteSettings({ cvUrl: finalCvUrl });

    return NextResponse.json({
      success: true,
      cvUrl: finalCvUrl,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      message: "CV / Resume PDF uploaded and saved successfully!",
    });
  } catch (err) {
    console.error("CV Upload error:", err);
    return NextResponse.json({ error: "Failed to upload CV file" }, { status: 500 });
  }
}
