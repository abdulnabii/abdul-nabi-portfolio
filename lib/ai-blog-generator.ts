/**
 * AI Blog Generator — fetches trending AI/ML news from RSS feeds
 * and generates full SEO-optimized blog posts using OpenAI GPT-4o.
 */

import { createBlog, getAllBlogs, slugify } from "./blog-store";

export interface NewsItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
}

export interface GeneratedBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  coverImage?: string;
}

// RSS sources — all free, no API key needed
const RSS_FEEDS = [
  {
    url: "https://hnrss.org/newest.atom?q=AI+machine+learning&count=10",
    source: "Hacker News",
  },
  {
    url: "https://feeds.feedburner.com/oreilly/radar/atom",
    source: "O'Reilly Radar",
  },
  {
    url: "https://rss.arxiv.org/rss/cs.AI",
    source: "ArXiv AI",
  },
  {
    url: "https://rss.arxiv.org/rss/cs.LG",
    source: "ArXiv ML",
  },
  {
    url: "https://www.technologyreview.com/feed/",
    source: "MIT Technology Review",
  },
  {
    url: "https://machinelearningmastery.com/feed/",
    source: "ML Mastery",
  },
];

const AI_TOPICS = [
  "Large Language Models",
  "Generative AI",
  "Machine Learning in Healthcare",
  "AI Security and AppSec",
  "Python ML frameworks PyTorch scikit-learn HuggingFace",
  "GPT Claude Gemini AI models",
  "Deep Learning Neural Networks",
  "Reinforcement Learning",
  "Computer Vision",
  "Natural Language Processing",
  "AI Ethics and Responsible AI",
  "MLOps and AI deployment",
];

// Fallback trending topics if RSS fails
const FALLBACK_TOPICS = [
  {
    title: "The Rise of Multimodal AI: How Vision-Language Models Are Changing Everything",
    summary: "Multimodal AI models can now process text, images, audio, and video simultaneously, opening new possibilities.",
    source: "Trending",
    url: "",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "AI in Healthcare 2025: Machine Learning Revolutionizes Patient Diagnosis",
    summary: "ML models achieve doctor-level accuracy in radiology, oncology, and diabetes risk prediction.",
    source: "Trending",
    url: "",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Python AI Frameworks in 2025: PyTorch vs JAX vs Scikit-Learn",
    summary: "A deep dive into the current ML framework ecosystem and which tools to choose for your next project.",
    source: "Trending",
    url: "",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "LLM Security: Prompt Injection, Jailbreaking, and Defense Strategies",
    summary: "As AI systems proliferate, so do attacks targeting them. Learn how to secure your AI applications.",
    source: "Trending",
    url: "",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Fine-Tuning vs RAG: Choosing the Right Strategy for AI Applications",
    summary: "When should you fine-tune a language model versus using retrieval-augmented generation?",
    source: "Trending",
    url: "",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Building Scalable ML Pipelines with FastAPI and Docker",
    summary: "A practical guide to containerizing and deploying machine learning models for production.",
    source: "Trending",
    url: "",
    publishedAt: new Date().toISOString(),
  },
];

function parseRssXml(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  try {
    // Parse <item> or <entry> blocks
    const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 4) {
      const block = match[1];
      const titleMatch = block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const summaryMatch =
        block.match(/<(?:summary|description)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:summary|description)>/i) ||
        block.match(/<content[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content>/i);
      const linkMatch =
        block.match(/<link[^>]*>([^<]+)<\/link>/i) ||
        block.match(/<link[^>]+href="([^"]+)"/i);
      const dateMatch =
        block.match(/<(?:pubDate|published|updated)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated)>/i);

      if (titleMatch?.[1]) {
        const title = titleMatch[1]
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .trim();

        if (title.length > 10) {
          items.push({
            title,
            summary: (summaryMatch?.[1] || "")
              .replace(/<[^>]+>/g, "")
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .trim()
              .slice(0, 300),
            source,
            url: linkMatch?.[1]?.trim() || "",
            publishedAt: dateMatch?.[1]?.trim() || new Date().toISOString(),
          });
        }
      }
    }
  } catch {}
  return items;
}

export async function fetchTrendingAiNews(): Promise<NewsItem[]> {
  const allNews: NewsItem[] = [];

  await Promise.allSettled(
    RSS_FEEDS.map(async ({ url, source }) => {
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "aiwithab.site blog bot" },
          signal: AbortSignal.timeout(8000),
          cache: "no-store",
        });
        if (!res.ok) return;
        const xml = await res.text();
        const items = parseRssXml(xml, source);
        allNews.push(...items);
      } catch {}
    })
  );

  // Filter for AI/ML relevance
  const aiKeywords = ["AI", "machine learning", "LLM", "neural", "GPT", "model", "ML", "deep learning", "artificial", "ChatGPT", "language model", "transformer", "automation", "NLP", "scikit", "PyTorch"];
  const relevant = allNews.filter((item) =>
    aiKeywords.some(
      (kw) =>
        item.title.toLowerCase().includes(kw.toLowerCase()) ||
        item.summary.toLowerCase().includes(kw.toLowerCase())
    )
  );

  // De-dup by title similarity
  const seen = new Set<string>();
  const deduped = (relevant.length > 0 ? relevant : allNews).filter((item) => {
    const key = item.title.toLowerCase().replace(/[^a-z]/g, "").slice(0, 30);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped.slice(0, 6);
}

export async function generateAiBlogPost(topic: NewsItem): Promise<GeneratedBlogPost | null> {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) {
    console.error("[ai-blog-generator] No OPENAI_API_KEY set");
    return null;
  }

  const year = new Date().getFullYear();
  const prompt = `You are Abdul Nabi, a full-stack developer and ML engineer from Karachi, Pakistan who writes authoritative, technical blog posts on AI, machine learning, and web development. Your portfolio is at https://aiwithab.site.

Write a comprehensive, SEO-optimized technical blog post about the following topic:

TOPIC: ${topic.title}
CONTEXT: ${topic.summary || "A trending topic in the AI/ML space in " + year}
SOURCE: ${topic.source}

REQUIREMENTS:
1. The post should be 1800-2500 words, engaging, and technically accurate
2. Use first-person voice naturally (you are Abdul Nabi sharing insights)
3. Structure:
   - Compelling intro that hooks the reader
   - Clear H2 and H3 subheadings (use ## and ### in markdown)
   - Practical code examples in Python or JavaScript where relevant (use code blocks)
   - Real-world applications and use cases
   - Current trends as of ${year}
   - A concluding section with actionable takeaways
4. SEO: naturally weave in related keywords throughout
5. End with a short paragraph mentioning that Abdul Nabi built an AI-powered healthcare application (Blood Sugar Tracker with ElasticNet ML model) and invite readers to explore his portfolio at https://aiwithab.site
6. Do NOT include a disclaimer about AI assistance

Return a JSON object with this exact structure (no markdown wrapper, pure JSON):
{
  "title": "Full SEO-optimized blog title (include year ${year})",
  "slug": "url-friendly-slug-max-60-chars",
  "excerpt": "Compelling meta description 120-160 characters for SEO",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "content": "Full markdown article body here..."
}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.75,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[ai-blog-generator] OpenAI error:", err);
      return null;
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as GeneratedBlogPost;
    if (!parsed.title || !parsed.content || !parsed.excerpt) return null;

    return {
      title: parsed.title,
      slug: slugify(parsed.slug || parsed.title),
      excerpt: parsed.excerpt,
      content: parsed.content,
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 6) : ["AI", "Machine Learning"],
    };
  } catch (err) {
    console.error("[ai-blog-generator] Exception:", err);
    return null;
  }
}

export async function runAutoBlog(maxPosts = 3): Promise<{ created: string[]; skipped: string[]; errors: string[] }> {
  const result = { created: [] as string[], skipped: [] as string[], errors: [] as string[] };

  // Get existing slugs to avoid duplicates
  const existingPosts = await getAllBlogs();
  const existingSlugs = new Set(existingPosts.map((p) => p.slug));

  // Fetch news (with fallback)
  let newsItems = await fetchTrendingAiNews();
  if (newsItems.length < 3) {
    console.log("[ai-blog-generator] Using fallback topics due to insufficient RSS results");
    newsItems = [...newsItems, ...FALLBACK_TOPICS].slice(0, 6);
  }

  // Shuffle and pick unique topics not already posted about
  const candidates = newsItems.filter((item) => {
    const potentialSlug = slugify(item.title);
    return !existingSlugs.has(potentialSlug);
  });

  let generated = 0;
  for (const topic of candidates) {
    if (generated >= maxPosts) break;

    console.log(`[ai-blog-generator] Generating post for: ${topic.title}`);
    const post = await generateAiBlogPost(topic);

    if (!post) {
      result.errors.push(topic.title);
      continue;
    }

    if (existingSlugs.has(post.slug)) {
      result.skipped.push(post.slug);
      continue;
    }

    try {
      await createBlog({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        tags: post.tags,
        published: true, // Auto-publish mode
        date: new Date().toISOString().split("T")[0],
      });

      existingSlugs.add(post.slug);
      result.created.push(post.slug);
      generated++;

      // Wait 2s between posts to avoid rate limiting
      if (generated < maxPosts) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error("[ai-blog-generator] Failed to create blog:", err);
      result.errors.push(post.slug);
    }
  }

  return result;
}
