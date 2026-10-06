import { getAdminSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    const secret = req.headers.get("x-revalidate-secret") || req.nextUrl.searchParams.get("secret");
    const expectedSecret = process.env.REVALIDATION_SECRET;

    let isSecretValid = false;
    if (expectedSecret && secret) {
      const bufA = Buffer.from(secret);
      const bufB = Buffer.from(expectedSecret);
      if (bufA.length === bufB.length) {
        const { timingSafeEqual } = await import("crypto");
        isSecretValid = timingSafeEqual(bufA, bufB);
      }
    }

    const isAuthorized = Boolean(session) || isSecretValid;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized revalidation request" }, { status: 401 });
    }

    revalidatePath("/", "layout");
    revalidatePath("/blog", "layout");
    revalidatePath("/projects", "layout");
    revalidatePath("/about", "layout");
    revalidatePath("/contact", "layout");

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
