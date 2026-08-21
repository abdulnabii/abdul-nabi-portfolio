import seedBlogs from "@/data/blogs.json";
import { promises as fs } from "fs";
import path from "path";
import { supabaseDbDelete, supabaseDbQuery, supabaseDbUpsert } from "./supabase";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  tags: string[];
  coverImage?: string;
  published: boolean;
  scheduledAt?: string; // ISO Date string for future scheduled publication
  updatedAt: string;
  helpfulCount?: number;
  notHelpfulCount?: number;
  ratingSum?: number;
  ratingCount?: number;
  views?: number;
}

const BLOGS_FILE = path.join(process.cwd(), "data", "blogs.json");
const memoryBlogs: BlogPost[] = [];

function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

import { getUniqueTopicCoverImage } from "./image-search";

function getDefaultBlogCoverImage(title: string = "", tags: string[] = []): string {
  return getUniqueTopicCoverImage(title, tags);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function ensureBlogsFile(): Promise<void> {
  try {
    await fs.access(BLOGS_FILE);
  } catch {
    try {
      await fs.mkdir(path.dirname(BLOGS_FILE), { recursive: true });
      await fs.writeFile(BLOGS_FILE, "[]", "utf8");
    } catch {
      // Ignored on read-only serverless filesystems (e.g., Vercel)
    }
  }
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  const map = new Map<string, BlogPost>();
  let deletedSet = new Set<string>();

  try {
    // 0. Fetch deleted_blog_slugs list from site_settings
    try {
      const rows = await supabaseDbQuery<{ key: string; value: string }>(
        "site_settings",
        "select=*&key=eq.deleted_blog_slugs"
      );
      if (rows && rows.length > 0 && rows[0].value) {
        const parsed = JSON.parse(rows[0].value) as string[];
        if (Array.isArray(parsed)) {
          deletedSet = new Set(parsed);
        }
      }
    } catch {}

    const isDeleted = (slug: string) =>
      deletedSet.has(slug) ||
      deletedSet.has(slugify(slug)) ||
      deletedSet.has(decodeURIComponent(slug));

    // 1. Static seed blogs from bundled JSON
    (seedBlogs as BlogPost[]).forEach((p) => {
      if (!isDeleted(p.slug)) map.set(p.slug, p);
    });

    // 2. Read from disk if writeable/readable
    try {
      await ensureBlogsFile();
      const raw = await fs.readFile(BLOGS_FILE, "utf8");
      const posts = JSON.parse(raw) as BlogPost[];
      posts.forEach((p) => {
        if (!isDeleted(p.slug)) map.set(p.slug, p);
      });
    } catch {
      // Read-only filesystem fallback
    }

    // 3a. Overlay Supabase blogs table if connected
    try {
      const dbPosts = await supabaseDbQuery<BlogPost>("blogs", "select=*&order=date.desc");
      if (dbPosts && dbPosts.length > 0) {
        dbPosts.forEach((p) => {
          if (!isDeleted(p.slug)) map.set(p.slug, p);
        });
      }
    } catch {}

    // 3b. Overlay site_settings blogs backup table
    try {
      const rows = await supabaseDbQuery<{ key: string; value: string }>(
        "site_settings",
        "select=*&key=eq.blogs_store_json"
      );
      if (rows && rows.length > 0 && rows[0].value) {
        const backupPosts = JSON.parse(rows[0].value) as BlogPost[];
        backupPosts.forEach((p) => {
          if (!isDeleted(p.slug)) map.set(p.slug, p);
        });
      }
    } catch {}

    // 4. Overlay in-memory cache LAST
    memoryBlogs.forEach((p) => {
      if (!isDeleted(p.slug)) map.set(p.slug, p);
    });
  } catch (err) {
    console.error("[getAllBlogs] Exception:", err);
  }

  const allList = Array.from(map.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Auto-promote any scheduled blogs whose scheduledAt time has passed
  const now = Date.now();
  let needsPersist = false;
  const updatedList = allList.map((post) => {
    if (post.scheduledAt && new Date(post.scheduledAt).getTime() <= now) {
      needsPersist = true;
      return {
        ...post,
        published: true,
        date: post.scheduledAt.slice(0, 10),
        scheduledAt: undefined,
        updatedAt: new Date().toISOString(),
      };
    }
    return post;
  });

  if (needsPersist) {
    // Background async persist without blocking read
    saveAllBlogs(updatedList).catch((err) =>
      console.warn("[getAllBlogs] Auto-promote persist notice:", err)
    );
  }

  return updatedList;
}

export async function getPublishedBlogs(): Promise<BlogPost[]> {
  try {
    const posts = await getAllBlogs();
    const now = Date.now();
    return posts.filter((p) => {
      if (p.published === false) return false;
      // If scheduled in the future, don't show on public blog list
      if (p.scheduledAt && new Date(p.scheduledAt).getTime() > now) {
        return false;
      }
      return true;
    });
  } catch {
    return [];
  }
}

export async function getBlogBySlug(
  slug: string,
  options?: { includeDrafts?: boolean }
): Promise<BlogPost | undefined> {
  try {
    const posts = await getAllBlogs();
    const decoded = decodeURIComponent(slug);
    const targetSlug = slugify(slug);
    const now = Date.now();

    const post = posts.find(
      (p) =>
        p.slug === slug ||
        p.slug === decoded ||
        slugify(p.slug) === targetSlug
    );

    if (!post) return undefined;
    if (!options?.includeDrafts) {
      if (post.published === false) return undefined;
      if (post.scheduledAt && new Date(post.scheduledAt).getTime() > now) {
        return undefined;
      }
    }
    return post;
  } catch {
    return undefined;
  }
}

export async function saveAllBlogs(posts: BlogPost[]): Promise<void> {
  try {
    // 1. Update memory store for immediate active session reactivity
    memoryBlogs.length = 0;
    memoryBlogs.push(...posts);

    // 2. Dual-write to durable site_settings table (guaranteed table in Supabase)
    try {
      const res = await supabaseDbUpsert(
        "site_settings",
        [
          {
            key: "blogs_store_json",
            value: JSON.stringify(posts),
            updated_at: new Date().toISOString(),
          },
        ],
        "key"
      );
      if (res) {
        console.log(`[blog-store] Successfully persisted ${posts.length} blogs to Supabase site_settings.`);
      }
    } catch (err) {
      console.error("[blog-store] Failed to persist to site_settings:", err);
    }

    // 3. Upsert to Supabase DB blogs table if available (sanitized columns)
    try {
      const dbPayload = posts.map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        date: p.date,
        readTime: p.readTime,
        tags: p.tags,
        coverImage: p.coverImage,
        published: p.published,
        scheduledAt: p.scheduledAt,
        updatedAt: p.updatedAt,
      }));
      await supabaseDbUpsert("blogs", dbPayload, "slug");
    } catch {}

    // 4. Write to local disk if filesystem is writeable
    try {
      await ensureBlogsFile();
      await fs.writeFile(BLOGS_FILE, JSON.stringify(posts, null, 2), "utf8");
    } catch {
      // Read-only filesystem fallback
    }
  } catch (err) {
    console.error("[saveAllBlogs] Exception:", err);
  }
}

export interface BlogInput {
  title: string;
  excerpt: string;
  content: string;
  date?: string;
  tags?: string[];
  coverImage?: string;
  published?: boolean;
  scheduledAt?: string;
  slug?: string;
  helpfulCount?: number;
  notHelpfulCount?: number;
  ratingSum?: number;
  ratingCount?: number;
}

export async function createBlog(input: BlogInput): Promise<BlogPost> {
  const posts = await getAllBlogs();
  let slug = slugify(input.slug || input.title);
  if (!slug) throw new Error("Invalid slug");

  const existing = new Set(posts.map((p) => p.slug));
  if (existing.has(slug)) {
    let i = 2;
    while (existing.has(`${slug}-${i}`)) i += 1;
    slug = `${slug}-${i}`;
  }

  const tags = (input.tags ?? []).map((t) => t.trim()).filter(Boolean);

  const isScheduled = !!input.scheduledAt && new Date(input.scheduledAt).getTime() > Date.now();

  const post: BlogPost = {
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content.trim(),
    date: isScheduled && input.scheduledAt ? input.scheduledAt.slice(0, 10) : input.date || new Date().toISOString().slice(0, 10),
    readTime: estimateReadTime(input.content),
    tags,
    coverImage:
      input.coverImage?.trim() ||
      getDefaultBlogCoverImage(input.title, tags),
    published: isScheduled ? false : (input.published ?? true),
    scheduledAt: isScheduled ? input.scheduledAt : undefined,
    updatedAt: new Date().toISOString(),
    helpfulCount: input.helpfulCount ?? 0,
    notHelpfulCount: input.notHelpfulCount ?? 0,
    ratingSum: input.ratingSum ?? 0,
    ratingCount: input.ratingCount ?? 0,
  };

  posts.unshift(post);
  await saveAllBlogs(posts);
  return post;
}

export async function updateBlog(
  slug: string,
  input: Partial<BlogInput> & { newSlug?: string }
): Promise<BlogPost> {
  const posts = await getAllBlogs();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) throw new Error("NOT_FOUND");

  const current = posts[index];
  let nextSlug = current.slug;

  if (input.newSlug || input.slug || input.title) {
    const candidate = slugify(
      input.newSlug || input.slug || input.title || current.slug
    );
    if (candidate && candidate !== current.slug) {
      if (posts.some((p) => p.slug === candidate)) {
        throw new Error("SLUG_EXISTS");
      }
      nextSlug = candidate;
    }
  }

  const content = input.content?.trim() ?? current.content;
  const isScheduled = input.scheduledAt !== undefined
    ? (!!input.scheduledAt && new Date(input.scheduledAt).getTime() > Date.now())
    : (!!current.scheduledAt && new Date(current.scheduledAt).getTime() > Date.now());

  const updated: BlogPost = {
    ...current,
    slug: nextSlug,
    title: input.title?.trim() ?? current.title,
    excerpt: input.excerpt?.trim() ?? current.excerpt,
    content,
    date: input.date ?? (isScheduled && input.scheduledAt ? input.scheduledAt.slice(0, 10) : current.date),
    tags:
      input.tags !== undefined
        ? input.tags.map((t) => t.trim()).filter(Boolean)
        : current.tags,
    coverImage:
      input.coverImage !== undefined
        ? input.coverImage.trim() || undefined
        : current.coverImage,
    published: isScheduled
      ? false
      : input.published !== undefined
        ? input.published
        : current.published,
    scheduledAt: input.scheduledAt !== undefined ? input.scheduledAt : current.scheduledAt,
    readTime: estimateReadTime(content),
    updatedAt: new Date().toISOString(),
    helpfulCount: input.helpfulCount !== undefined ? input.helpfulCount : current.helpfulCount ?? 0,
    notHelpfulCount: input.notHelpfulCount !== undefined ? input.notHelpfulCount : current.notHelpfulCount ?? 0,
    ratingSum: input.ratingSum !== undefined ? input.ratingSum : current.ratingSum ?? 0,
    ratingCount: input.ratingCount !== undefined ? input.ratingCount : current.ratingCount ?? 0,
  };

  posts[index] = updated;
  await saveAllBlogs(posts);
  return updated;
}

export async function scheduleBlog(slug: string, scheduledAt: string): Promise<BlogPost> {
  return updateBlog(slug, {
    scheduledAt,
    published: false,
  });
}

export async function cancelBlogSchedule(slug: string): Promise<BlogPost> {
  return updateBlog(slug, {
    scheduledAt: undefined,
    published: false, // Remains draft
  });
}

export async function publishBlogNow(slug: string): Promise<BlogPost> {
  return updateBlog(slug, {
    scheduledAt: undefined,
    published: true,
    date: new Date().toISOString().slice(0, 10),
  });
}

export async function publishScheduledBlogs(): Promise<{ publishedCount: number; publishedSlugs: string[] }> {
  const posts = await getAllBlogs();
  const now = Date.now();
  const publishedSlugs: string[] = [];

  let changed = false;
  const updated = posts.map((p) => {
    if (p.scheduledAt && new Date(p.scheduledAt).getTime() <= now) {
      changed = true;
      publishedSlugs.push(p.slug);
      return {
        ...p,
        published: true,
        scheduledAt: undefined,
        date: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString(),
      };
    }
    return p;
  });

  if (changed) {
    await saveAllBlogs(updated);
  }

  return { publishedCount: publishedSlugs.length, publishedSlugs };
}

export async function deleteBlog(slug: string): Promise<void> {
  const decoded = decodeURIComponent(slug);
  const targetSlug = slugify(slug);

  // 1. Save slug to deleted_blog_slugs in site_settings so seed/cached blogs are suppressed forever
  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>(
      "site_settings",
      "select=*&key=eq.deleted_blog_slugs"
    );
    let deletedList: string[] = [];
    if (rows && rows.length > 0 && rows[0].value) {
      deletedList = JSON.parse(rows[0].value) as string[];
    }
    if (!deletedList.includes(slug)) deletedList.push(slug);
    if (!deletedList.includes(targetSlug)) deletedList.push(targetSlug);
    if (decoded !== slug && !deletedList.includes(decoded)) deletedList.push(decoded);

    await supabaseDbUpsert("site_settings", [
      {
        key: "deleted_blog_slugs",
        value: JSON.stringify(deletedList),
        updated_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error("[deleteBlog] Error recording deleted_blog_slugs:", err);
  }

  // 2. Delete from Supabase DB blogs table
  try {
    await supabaseDbDelete("blogs", `slug=eq.${encodeURIComponent(slug)}`);
    if (decoded !== slug) {
      await supabaseDbDelete("blogs", `slug=eq.${encodeURIComponent(decoded)}`);
    }
  } catch {}

  // 3. Filter current blog list and SAVE via saveAllBlogs
  const posts = await getAllBlogs();
  const next = posts.filter(
    (p) =>
      p.slug !== slug &&
      p.slug !== decoded &&
      slugify(p.slug) !== targetSlug
  );

  await saveAllBlogs(next);
}
