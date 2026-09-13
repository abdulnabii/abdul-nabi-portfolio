import { getPublishedBlogs } from "@/lib/blog-store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

export async function GET() {
  const baseUrl = "https://www.aiwithab.site";
  const blogs = await getPublishedBlogs().catch(() => []);

  const rssItems = blogs.map((post) => {
    const pubDate = post.date ? new Date(post.date).toUTCString() : new Date().toUTCString();
    const url = `${baseUrl}/blog/${post.slug}`;
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.excerpt || "")}</description>
      <author>abdulnabi.khaskhely@gmail.com (Abdul Nabi)</author>
    </item>`;
  }).join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Abdul Nabi — Full-Stack &amp; AI/ML Engineering Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Technical articles on Next.js 14, TypeScript, AI Engineering, and Application Security by Abdul Nabi.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
