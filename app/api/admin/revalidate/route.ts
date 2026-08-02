import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-revalidate-secret") || req.nextUrl.searchParams.get("secret");
    const expectedSecret = process.env.REVALIDATION_SECRET || "default_revalidate_secret";

    if (secret !== expectedSecret) {
      return NextResponse.json({ error: "Invalid revalidation secret token" }, { status: 401 });
    }

    revalidatePath("/", "layout");
    revalidatePath("/blog", "layout");
    revalidatePath("/projects", "layout");

    return NextResponse.json({
      revalidated: true,
      now: new Date().toISOString(),
      message: "Public site pages revalidated successfully!",
    });
  } catch (err) {
    console.error("Revalidation error:", err);
    return NextResponse.json({ error: "Failed to revalidate public site" }, { status: 500 });
  }
}
