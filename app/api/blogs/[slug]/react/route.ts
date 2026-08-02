import { getBlogBySlug, updateBlog } from "@/lib/blog-store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { slug: string };
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const body = (await request.json()) as {
      action: "rate" | "helpful" | "not-helpful";
      rating?: number; // 1-5 for "rate"
    };

    const post = await getBlogBySlug(context.params.slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    let helpfulCount = post.helpfulCount ?? 0;
    let notHelpfulCount = post.notHelpfulCount ?? 0;
    let ratingSum = post.ratingSum ?? 0;
    let ratingCount = post.ratingCount ?? 0;

    if (body.action === "helpful") {
      helpfulCount += 1;
    } else if (body.action === "not-helpful") {
      notHelpfulCount += 1;
    } else if (body.action === "rate") {
      const rating = body.rating ?? 0;
      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: "Rating must be between 1 and 5." },
          { status: 400 }
        );
      }
      ratingSum += rating;
      ratingCount += 1;
    } else {
      return NextResponse.json(
        { error: "Invalid action." },
        { status: 400 }
      );
    }

    const updated = await updateBlog(context.params.slug, {
      helpfulCount,
      notHelpfulCount,
      ratingSum,
      ratingCount,
    });

    const { addInboxItem } = await import("@/lib/inbox-store");
    await addInboxItem("feedback", {
      blogTitle: post.title,
      blogSlug: post.slug,
      action: body.action,
      rating: body.action === "rate" ? body.rating : undefined,
    });

    return NextResponse.json({
      success: true,
      helpfulCount: updated.helpfulCount ?? 0,
      notHelpfulCount: updated.notHelpfulCount ?? 0,
      ratingAverage: updated.ratingCount ? ((updated.ratingSum ?? 0) / updated.ratingCount) : 0,
      ratingCount: updated.ratingCount ?? 0,
    });
  } catch (error) {
    console.error("[api/blogs/[slug]/react]", error);
    return NextResponse.json(
      { error: "Failed to submit reaction." },
      { status: 500 }
    );
  }
}
