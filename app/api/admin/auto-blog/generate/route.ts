import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { generateAndPublishSingleBlog } from "@/lib/ai-blog-generator";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // Allow up to 2 minutes for deep news analysis & AI synthesis

export async function POST(req: NextRequest) {
  // 1. Authenticate Admin
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please log in as admin." }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      topic?: string;
      category?: string;
      imageStyle?: string;
      published?: boolean;
    };

    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const imageStyle = typeof body.imageStyle === "string" ? body.imageStyle.trim() : "ai_flux";
    const published = typeof body.published === "boolean" ? body.published : true;

    console.log(`[auto-blog-generate-api] Request by ${session.email} for topic: "${topic || "(auto-trending)"}" (style: ${imageStyle})`);

    const result = await generateAndPublishSingleBlog({
      topic,
      category,
      imageStyle,
      published,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to generate blog post" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[auto-blog-generate-api] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
