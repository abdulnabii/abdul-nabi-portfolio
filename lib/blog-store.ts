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
  updatedAt: string;
  helpfulCount?: number;
  notHelpfulCount?: number;
  ratingSum?: number;
  ratingCount?: number;
}

const BLOGS_FILE = path.join(process.cwd(), "data", "blogs.json");
const memoryBlogs: BlogPost[] = [];

function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function getDefaultBlogCoverImage(title: string = "", tags: string[] = []): string {
  const text = `${title} ${tags.join(" ")}`.toLowerCase();
  const pool = [
    "https://images.unsplash.com/photo-1639322537504-642750d53c29?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=1200&auto=format&fit=crop",
  ];

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return pool[Math.abs(hash) % pool.length];
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

  try {
    // 1. Static seed blogs from bundled JSON
    (seedBlogs as BlogPost[]).forEach((p) => map.set(p.slug, p));

    // 2. Read from disk if writeable/readable
    try {
      await ensureBlogsFile();
      const raw = await fs.readFile(BLOGS_FILE, "utf8");
      const posts = JSON.parse(raw) as BlogPost[];
      posts.forEach((p) => map.set(p.slug, p));
    } catch {
      // Read-only filesystem fallback
    }

    // 3a. Overlay Supabase blogs table if connected
    try {
      const dbPosts = await supabaseDbQuery<BlogPost>("blogs", "select=*&order=date.desc");
      if (dbPosts && dbPosts.length > 0) {
        dbPosts.forEach((p) => map.set(p.slug, p));
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
        backupPosts.forEach((p) => map.set(p.slug, p));
      }
    } catch {}

    // 4. Overlay in-memory cache LAST
    memoryBlogs.forEach((p) => map.set(p.slug, p));
  } catch (err) {
    console.error("[getAllBlogs] Exception:", err);
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPublishedBlogs(): Promise<BlogPost[]> {
  try {
    const posts = await getAllBlogs();
    return posts.filter((p) => p.published !== false);
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

    const post = posts.find(
      (p) =>
        p.slug === slug ||
        p.slug === decoded ||
        slugify(p.slug) === targetSlug
    );

    if (!post) return undefined;
    if (!options?.includeDrafts && post.published === false) return undefined;
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

  const post: BlogPost = {
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content.trim(),
    date: input.date || new Date().toISOString().slice(0, 10),
    readTime: estimateReadTime(input.content),
    tags,
    coverImage:
      input.coverImage?.trim() ||
      getDefaultBlogCoverImage(input.title, tags),
    published: input.published ?? true,
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
  const updated: BlogPost = {
    ...current,
    slug: nextSlug,
    title: input.title?.trim() ?? current.title,
    excerpt: input.excerpt?.trim() ?? current.excerpt,
    content,
    date: input.date ?? current.date,
    tags:
      input.tags !== undefined
        ? input.tags.map((t) => t.trim()).filter(Boolean)
        : current.tags,
    coverImage:
      input.coverImage !== undefined
        ? input.coverImage.trim() || undefined
        : current.coverImage,
    published:
      input.published !== undefined ? input.published : current.published,
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

export async function deleteBlog(slug: string): Promise<void> {
  const decoded = decodeURIComponent(slug);
  const targetSlug = slugify(slug);

  // 1. Delete from Supabase DB
  try {
    await supabaseDbDelete("blogs", `slug=eq.${encodeURIComponent(slug)}`);
    if (decoded !== slug) {
      await supabaseDbDelete("blogs", `slug=eq.${encodeURIComponent(decoded)}`);
    }
  } catch {}

  // 2. Filter from memory & local array
  const posts = await getAllBlogs();
  const next = posts.filter(
    (p) =>
      p.slug !== slug &&
      p.slug !== decoded &&
      slugify(p.slug) !== targetSlug
  );

  memoryBlogs.length = 0;
  memoryBlogs.push(...next);

  // 3. Persist to disk if writable
  try {
    await ensureBlogsFile();
    await fs.writeFile(BLOGS_FILE, JSON.stringify(next, null, 2), "utf8");
  } catch {}
}
