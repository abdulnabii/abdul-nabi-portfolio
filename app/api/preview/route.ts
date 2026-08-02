import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const secret = searchParams.get("secret");
  const type = searchParams.get("type");
  const slug = searchParams.get("slug");

  const expectedToken = process.env.PREVIEW_SECRET_TOKEN || "default_preview_secret";

  if (secret !== expectedToken) {
    return new Response("Invalid preview token", { status: 401 });
  }

  if (!slug) {
    return new Response("Missing slug parameter", { status: 400 });
  }

  draftMode().enable();

  if (type === "project") {
    redirect(`/projects/${slug}`);
  } else {
    redirect(`/blog/${slug}`);
  }
}
