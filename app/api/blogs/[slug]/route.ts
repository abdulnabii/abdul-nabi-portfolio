import { getAdminSession } from "@/lib/auth";
import {
  deleteBlog,
  getBlogBySlug,
  updateBlog,
} from "@/lib/blog-store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { slug: string };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getAdminSession();
    const post = await getBlogBySlug(context.params.slug, {
      includeDrafts: Boolean(session),
    });

    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch {
    return NextResponse.json(
      { error: "Failed to load post." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      title?: string;
      excerpt?: string;
      content?: string;
      date?: string;
      tags?: string[] | string;
      coverImage?: string;
      published?: boolean;
      slug?: string;
    };

    const tags =
      body.tags === undefined
        ? undefined
        : Array.isArray(body.tags)
          ? body.tags
          : body.tags.split(",").map((t) => t.trim());

    const post = await updateBlog(context.params.slug, {
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      date: body.date,
      tags,
      coverImage: body.coverImage,
      published: body.published,
      newSlug: body.slug,
    });

    return NextResponse.json({ post });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      if (error.message === "SLUG_EXISTS") {
        return NextResponse.json(
          { error: "Another post already uses that slug." },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to update blog." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteBlog(context.params.slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete blog." },
      { status: 500 }
    );
  }
}
