import { getAdminSession } from "@/lib/auth";
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
    const type = (formData.get("type") as string) || "projects";
    const slug = (formData.get("slug") as string) || "cover_" + Date.now();

    if (!file) {
      return NextResponse.json({ error: "No image file uploaded" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type) && !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      return NextResponse.json(
        { error: "Invalid image format. Only JPG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    const maxBytes = 2 * 1024 * 1024; // 2MB max
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: "Image file exceeds 2MB limit to preserve site performance." },
        { status: 400 }
      );
    }

    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `${slug}.${extension}`;
    const storagePath = `${type}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicUrl = await supabaseStorageUpload(
      "covers",
      storagePath,
      buffer,
      file.type || "image/jpeg"
    );

    const finalUrl = publicUrl || `/projects/${slug}.${extension}`;

    return NextResponse.json({
      success: true,
      url: finalUrl,
      fileName,
      fileSize: file.size,
      message: "Cover image uploaded successfully!",
    });
  } catch (err) {
    console.error("Cover image upload error:", err);
    return NextResponse.json({ error: "Failed to upload cover image" }, { status: 500 });
  }
}
