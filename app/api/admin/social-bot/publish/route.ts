import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getSocialPosts, saveSocialPosts } from "@/lib/social-bot-store";
import {
  getSocialCredentials,
  publishDirectToLinkedIn,
  publishDirectToReddit,
} from "@/lib/social-credentials-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { postId, targetPlatform } = body; // targetPlatform: "linkedin" | "reddit"

    if (!postId || !targetPlatform) {
      return NextResponse.json({ error: "Missing postId or targetPlatform" }, { status: 400 });
    }

    const posts = await getSocialPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) {
      return NextResponse.json({ error: "Social post draft not found" }, { status: 404 });
    }

    const creds = await getSocialCredentials();

    if (targetPlatform === "linkedin") {
      const result = await publishDirectToLinkedIn(
        post.linkedInContent,
        post.vercelUrl,
        post.imageUrl,
        creds
      );

      if (result.success) {
        post.status = "Posted";
        await saveSocialPosts(posts);
        return NextResponse.json({ ok: true, message: result.message, id: result.id });
      } else {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
    }

    if (targetPlatform === "reddit") {
      const lines = post.redditContent.split("\n");
      let title = post.title;
      if (lines[0] && lines[0].startsWith("Title: ")) {
        title = lines[0].replace("Title: ", "").trim();
      }
      const redditBody = lines.slice(2).join("\n");

      const result = await publishDirectToReddit(
        title,
        redditBody,
        post.redditSubreddit || "r/webdev",
        creds
      );

      if (result.success) {
        post.status = "Posted";
        await saveSocialPosts(posts);
        return NextResponse.json({ ok: true, message: result.message, url: result.url });
      } else {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Invalid targetPlatform" }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/admin/social-bot/publish error:", err);
    return NextResponse.json({ error: err.message || "Failed to publish post" }, { status: 500 });
  }
}
