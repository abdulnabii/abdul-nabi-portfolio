import { getAdminSession } from "@/lib/auth";
import {
  createBlog,
  getAllBlogs,
  getPublishedBlogs,
} from "@/lib/blog-store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "1";
    const session = await getAdminSession();

    if (all) {
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const posts = await getAllBlogs();
      return NextResponse.json({ posts });
    }

    const posts = await getPublishedBlogs();
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json(
      { error: "Failed to load blogs." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    if (!body.title?.trim() || !body.excerpt?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { error: "Title, excerpt, and content are required." },
        { status: 400 }
      );
    }

    const tags = Array.isArray(body.tags)
      ? body.tags
      : typeof body.tags === "string"
        ? body.tags.split(",").map((t) => t.trim())
        : [];

    const post = await createBlog({
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      date: body.date,
      tags,
      coverImage: body.coverImage,
      published: body.published,
      slug: body.slug,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("[api/blogs POST]", error);
    return NextResponse.json(
      { error: "Failed to create blog." },
      { status: 500 }
    );
  }
}
