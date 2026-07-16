import { promises as fs } from "fs";
import path from "path";

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

function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
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
    await fs.mkdir(path.dirname(BLOGS_FILE), { recursive: true });
    await fs.writeFile(BLOGS_FILE, "[]", "utf8");
  }
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  await ensureBlogsFile();
  const raw = await fs.readFile(BLOGS_FILE, "utf8");
  const posts = JSON.parse(raw) as BlogPost[];
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPublishedBlogs(): Promise<BlogPost[]> {
  const posts = await getAllBlogs();
  return posts.filter((p) => p.published !== false);
}

export async function getBlogBySlug(
  slug: string,
  options?: { includeDrafts?: boolean }
): Promise<BlogPost | undefined> {
  const posts = await getAllBlogs();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return undefined;
  if (!options?.includeDrafts && post.published === false) return undefined;
  return post;
}

export async function saveAllBlogs(posts: BlogPost[]): Promise<void> {
  await ensureBlogsFile();
  await fs.writeFile(BLOGS_FILE, JSON.stringify(posts, null, 2), "utf8");
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

  const post: BlogPost = {
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content.trim(),
    date: input.date || new Date().toISOString().slice(0, 10),
    readTime: estimateReadTime(input.content),
    tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
    coverImage: input.coverImage?.trim() || undefined,
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
  const posts = await getAllBlogs();
  const next = posts.filter((p) => p.slug !== slug);
  if (next.length === posts.length) throw new Error("NOT_FOUND");
  await saveAllBlogs(next);
}
