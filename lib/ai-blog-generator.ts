/**
 * AI Blog Generator & Trending Tech News Analyzer
 * 
 * 1. Takes user input/topic or auto-discovers trending IT news
 * 2. Analyzes real-time tech news from Hacker News (Algolia), Google News Tech RSS, ArXiv & Dev feeds
 * 3. Generates publication-grade technical articles (via OpenAI GPT-4o or enhanced Technical Synthesis engine)
 * 4. Generates bespoke AI cover images via Pollinations Flux AI
 * 5. Publishes directly to Supabase DB and revalidates Next.js pages & RSS/sitemaps
 */

import { createBlog, getAllBlogs, moveToTrash, slugify, BlogPost } from "./blog-store";
import { generateAiBlogCoverImage, getUniqueTopicCoverImage } from "./image-search";
import { supabaseDbUpsert } from "./supabase";
import { revalidatePath } from "next/cache";

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
  coverImage: string;
  visualPrompt?: string;
}

export interface AutoBlogRequest {
  topic?: string;
  category?: string;
  imageStyle?: "curated_hd" | "ai_studio" | "ai_prism" | "ai_cyber" | string;
  published?: boolean;
}

export interface AutoBlogResponse {
  success: boolean;
  post?: {
    title: string;
    slug: string;
    excerpt: string;
    tags: string[];
    coverImage: string;
    readTime: string;
    date: string;
  };
  analyzedNews?: NewsItem[];
  error?: string;
  durationSeconds?: number;
}

// RSS & Tech News Feeds
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

// Fallback high-impact topics if external feeds are unavailable
const FALLBACK_TOPICS: NewsItem[] = [
  {
    title: "The Rise of Agentic AI: How Autonomous Agent Loops Are Transforming Software Architecture",
    summary: "From reasoning tokens to tool-calling pipelines, autonomous agent swarms are moving from research playgrounds to mission-critical backend microservices.",
    source: "Tech Architecture Digest",
    url: "https://aiwithab.site",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Next.js 15 & React 19 in Production: Server Actions, Partial Prerendering and Caching Deep Dive",
    summary: "A practical developer evaluation of React 19 Compiler, asynchronous request headers, and optimizing Core Web Vitals at enterprise scale.",
    source: "Full-Stack Weekly",
    url: "https://aiwithab.site",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Securing Generative AI Systems: Threat Modeling Prompt Injection & Model Weight Protection",
    summary: "AppSec defensive strategies for auditing LLM integration endpoints, sanitizing untrusted context, and enforcing Supabase Row Level Security.",
    source: "Cybersecurity Review",
    url: "https://aiwithab.site",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "DeepSeek V3 and Open Weights Revolution: Breaking the Proprietary LLM Monopoly",
    summary: "How multi-head latent attention (MLA) and DeepSeekMoE architectures achieve frontier-tier benchmark results at a fraction of training costs.",
    source: "AI Engineering Frontier",
    url: "https://aiwithab.site",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "AI in Healthcare 2026: Machine Learning Revolutionizes Patient Risk Prediction",
    summary: "Clinical predictive modeling with scikit-learn, HIPAA-inspired data privacy, and sub-50ms inference for real-time diabetes and chronic care monitoring.",
    source: "Healthcare AI Journal",
    url: "https://aiwithab.site",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Vector Databases at Scale: Comparing pgvector, Qdrant, and Milvus for Real-Time RAG",
    summary: "Benchmarking indexing algorithms (HNSW vs IVFFlat), memory footprints, and multi-tenant isolation patterns for enterprise search.",
    source: "Database Engineering Review",
    url: "https://aiwithab.site",
    publishedAt: new Date().toISOString(),
  },
];

function cleanHtml(raw: string): string {
  if (!raw) return "";
  let text = raw;
  // Decode XML/HTML entities first so tags become real tags
  text = text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, "&");

  // Strip all HTML tags including attributes
  text = text.replace(/<[^>]+>/g, "");

  // Second pass in case of nested/double escaped tags
  text = text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, "");

  // Strip Google News RSS redirect links or tracking artifacts
  text = text.replace(/https?:\/\/news\.google\.com\/[^\s]+/g, "");

  // Normalize whitespace
  return text.replace(/\s+/g, " ").trim();
}

function parseRssXml(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  try {
    const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
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
        const rawTitle = cleanHtml(titleMatch[1]);
        if (rawTitle.length > 10) {
          items.push({
            title: rawTitle,
            summary: cleanHtml(summaryMatch?.[1] || "").slice(0, 320),
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

/**
 * Searches and analyzes trending IT and tech news based on a prompt or general trends.
 */
export async function searchAndAnalyzeTrendingNews(topicQuery?: string): Promise<{
  primaryTopic: NewsItem;
  relatedNews: NewsItem[];
  synthesizedContext: string;
}> {
  const cleanQuery = (topicQuery || "").trim();
  const allItems: NewsItem[] = [];

  if (cleanQuery) {
    // 1. Search Hacker News Algolia for the targeted topic
    try {
      const hnUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(cleanQuery)}&tags=story&hitsPerPage=6`;
      const res = await fetch(hnUrl, { signal: AbortSignal.timeout(6000), cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.hits)) {
          for (const hit of data.hits) {
            if (hit.title && hit.title.length > 10) {
              allItems.push({
                title: cleanHtml(hit.title),
                summary: cleanHtml(hit.story_text || hit._highlightResult?.title?.value || `Hacker News discussion with ${hit.num_comments || 0} comments and ${hit.points || 0} points.`),
                source: "Hacker News",
                url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
                publishedAt: hit.created_at || new Date().toISOString(),
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn("[searchAndAnalyzeTrendingNews] HN Algolia search error:", e);
    }

    // 2. Search Google News Tech RSS for the targeted topic
    try {
      const gnUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(cleanQuery + " tech OR software OR programming")}&hl=en-US&gl=US&ceid=US:en`;
      const res = await fetch(gnUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (aiwithab.site bot)" },
        signal: AbortSignal.timeout(6000),
        cache: "no-store",
      });
      if (res.ok) {
        const xml = await res.text();
        const gnItems = parseRssXml(xml, "Google News Tech");
        allItems.push(...gnItems);
      }
    } catch (e) {
      console.warn("[searchAndAnalyzeTrendingNews] Google News RSS error:", e);
    }
  }

  // If no query or fewer than 2 results found, fetch general trending stories
  if (allItems.length < 2) {
    // Fetch Hacker News front page top stories
    try {
      const hnFrontUrl = "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=8";
      const res = await fetch(hnFrontUrl, { signal: AbortSignal.timeout(6000), cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.hits)) {
          for (const hit of data.hits) {
            if (hit.title && hit.title.length > 10) {
              allItems.push({
                title: cleanHtml(hit.title),
                summary: `Trending Hacker News story (${hit.points || 0} points, ${hit.num_comments || 0} comments).`,
                source: "Hacker News",
                url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
                publishedAt: hit.created_at || new Date().toISOString(),
              });
            }
          }
        }
      }
    } catch {}

    // Also fetch from primary curated RSS feeds
    await Promise.allSettled(
      RSS_FEEDS.slice(0, 3).map(async ({ url, source }) => {
        try {
          const res = await fetch(url, {
            headers: { "User-Agent": "aiwithab.site blog bot" },
            signal: AbortSignal.timeout(6000),
            cache: "no-store",
          });
          if (res.ok) {
            const xml = await res.text();
            allItems.push(...parseRssXml(xml, source));
          }
        } catch {}
      })
    );
  }

  // Deduplicate stories by title similarity
  const seen = new Set<string>();
  const dedupedNews = allItems.filter((item) => {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 35);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Determine Primary Topic
  let primaryTopic: NewsItem;
  if (cleanQuery) {
    // Find closest matching story or synthesize from input
    const match = dedupedNews.find(
      (n) =>
        n.title.toLowerCase().includes(cleanQuery.toLowerCase()) ||
        n.summary.toLowerCase().includes(cleanQuery.toLowerCase())
    );
    if (match) {
      primaryTopic = match;
    } else {
      primaryTopic = {
        title: cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1),
        summary: `Recent breakthrough, technical architecture, and community discussion surrounding ${cleanQuery}.`,
        source: "Trending Tech & Developer Ecosystem",
        url: "https://aiwithab.site",
        publishedAt: new Date().toISOString(),
      };
    }
  } else {
    primaryTopic = dedupedNews[0] || FALLBACK_TOPICS[Math.floor(Math.random() * FALLBACK_TOPICS.length)];
  }

  const relatedNews = dedupedNews.filter((n) => n.title !== primaryTopic.title).slice(0, 4);

  const synthesizedContext = [
    `Primary Subject: "${primaryTopic.title}" (Source: ${primaryTopic.source})`,
    `Context: ${primaryTopic.summary}`,
    relatedNews.length > 0
      ? `Related Trending Industry Discussions:\n${relatedNews.map((n, i) => `${i + 1}. "${n.title}" (${n.source})`).join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return { primaryTopic, relatedNews, synthesizedContext };
}

export async function fetchTrendingAiNews(): Promise<NewsItem[]> {
  const { primaryTopic, relatedNews } = await searchAndAnalyzeTrendingNews();
  return [primaryTopic, ...relatedNews];
}

/**
 * Builds a visual prompt for the image generation model.
 */
function createCoverVisualPrompt(title: string, tags: string[] = []): string {
  const cleanTitle = title.replace(/[^a-zA-Z0-9 ]/g, " ").slice(0, 60).trim();
  const tagList = tags.slice(0, 3).join(", ");
  return `${cleanTitle}, ${tagList}`;
}

/**
 * High-Depth Technical Article Synthesizer (Fallback & Primary Engine)
 * Generates an authoritative, publication-ready technical post in Abdul Nabi's voice.
 */
function generateTechnicalFallbackPost(
  topic: NewsItem,
  relatedNews: NewsItem[] = [],
  customCategory?: string,
  imageStyle: string = "curated_hd"
): GeneratedBlogPost {
  const year = new Date().getFullYear();
  const cleanTitle = topic.title
    .replace(/\$\^2\$/g, "²")
    .replace(/\$\^3\$/g, "³")
    .replace(/\$([^^$]+)\$/g, "$1")
    .replace(/[\n\r]/g, " ")
    .trim();

  // Smart tag extraction based on topic keywords
  const titleLower = cleanTitle.toLowerCase();
  const tagsSet = new Set<string>();

  if (titleLower.includes("next") || titleLower.includes("react") || titleLower.includes("web") || titleLower.includes("full-stack")) {
    tagsSet.add("Next.js");
    tagsSet.add("React 19");
    tagsSet.add("Full-Stack");
    tagsSet.add("Web Performance");
  } else if (titleLower.includes("security") || titleLower.includes("appsec") || titleLower.includes("vulnerab") || titleLower.includes("auth")) {
    tagsSet.add("Application Security");
    tagsSet.add("AppSec");
    tagsSet.add("DevSecOps");
    tagsSet.add("Supabase RLS");
  } else if (titleLower.includes("health") || titleLower.includes("clinical") || titleLower.includes("medical") || titleLower.includes("diabetes")) {
    tagsSet.add("Healthcare AI");
    tagsSet.add("Machine Learning");
    tagsSet.add("Predictive Analytics");
    tagsSet.add("Clinical Tech");
  } else if (titleLower.includes("agent") || titleLower.includes("autonomous") || titleLower.includes("swarm") || titleLower.includes("reasoning")) {
    tagsSet.add("AI Agents");
    tagsSet.add("Autonomous Systems");
    tagsSet.add("LLM Tooling");
    tagsSet.add("Prompt Engineering");
  } else {
    tagsSet.add("Artificial Intelligence");
    tagsSet.add("Machine Learning");
    tagsSet.add("Software Architecture");
    tagsSet.add("Python");
  }

  if (customCategory) tagsSet.add(customCategory);
  tagsSet.add("Tech Trends");
  const tags = Array.from(tagsSet).slice(0, 5);

  const contextNotes = relatedNews
    .filter((n) => n.title && n.title.trim().toLowerCase() !== cleanTitle.toLowerCase())
    .slice(0, 3)
    .map((n) => `- **${cleanHtml(n.title)}** — Core signal tracked across ${n.source || "developer forums"}.`)
    .join("\n");

  const relatedContextSection = contextNotes
    ? `\n\n### Industry Signals & Related Trends\n\n${contextNotes}\n`
    : "";

  const content = `## Introduction: Why This Matters Now

When you look past the social media noise around **${cleanTitle}**, there are tangible engineering implications that software teams need to evaluate in ${year}. Framework shifts, runtime updates, and AI integration aren't just cosmetic changes—they dictate how we structure data boundaries, minimize compute overhead, and maintain resilient production services.

In this deep dive, I'll walk through the core architectural patterns behind ${cleanTitle}, share concrete code examples you can drop into production, and break down the operational trade-offs we've navigated in real deployments.
${relatedContextSection}
---

## Core Architecture & Execution Flow

To understand why this pattern matters, here is how the data and compute flow breaks down across production layers:

| Layer | Responsibility | Key Engineering Trade-off |
| :--- | :--- | :--- |
| **Ingestion & Validation** | Edge sanitization, schema assertion, rate guards | Fast fail-early before downstream services |
| **Execution & Compute** | Async task pipelines, vector/model inference | Scalable worker pools without blocking main thread |
| **Persistence & Policy** | Database-level RLS, encrypted audit logs | Defense-in-depth independent of application code |

### 1. Architectural Decoupling & Low-Latency Processing

Whether you are orchestrating machine learning inference loops or high-throughput API endpoints, modern systems prioritize decoupled asynchronous execution. Blocking synchronous operations creates catastrophic cascading failures under spike loads.

### 2. Concrete Implementation Example

Here is a production-grade implementation pattern demonstrating safe input validation, abort controller timeout guards, and structured responses:

\`\`\`typescript
import { NextRequest, NextResponse } from "next/server";

interface IngestionPayload {
  eventId: string;
  source: string;
  timestamp: number;
  parameters: Record<string, unknown>;
}

// Resilient handler with timeout guard and structured response
export async function handleTechnicalEvent(req: NextRequest): Promise<NextResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const payload = (await req.json()) as IngestionPayload;

    if (!payload.eventId || !payload.parameters) {
      return NextResponse.json({ error: "Invalid payload schema" }, { status: 400 });
    }

    // Process payload asynchronously with strict schema validation
    const processedResult = {
      status: "acknowledged",
      processedAt: new Date().toISOString(),
      latencyMs: Date.now() - payload.timestamp,
    };

    return NextResponse.json(processedResult, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal processing error";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    clearTimeout(timeoutId);
  }
}
\`\`\`

---

## Real-World Case Study: Lessons from Production

In my own work developing the **Blood Sugar Tracker** (an AI clinical risk prediction system built with Next.js, Python Scikit-Learn/XGBoost, and Supabase RLS), we faced similar trade-offs when balancing model precision against client latency:

| Dimension | Initial Baseline | Optimized Architecture | Net Gain |
| :--- | :--- | :--- | :--- |
| **Inference Latency** | 380ms | 42ms | **9x Faster** |
| **Auth Verification** | App-tier JWT Check | Database Native RLS | **Zero Leakage** |
| **Cold-Start Penalty** | High (Fat Container) | Edge Micro-Service | **Negligible** |

### Critical Security Gotchas & AppSec Guardrails

1. **Never trust client-supplied model inputs**: Always sanitize boundaries before passing data to predictive models or SQL/vector queries.
2. **Defend against data exfiltration**: Enforce Row Level Security (RLS) directly at the database engine level so application bugs never expose foreign tenant data.
3. **Audit third-party dependencies**: Lock SHA hashes and verify npm/pip integrity to prevent supply-chain tampering.

---

## Actionable Takeaways & Abdul Nabi's Verdict

1. **Benchmark Before Refactoring**: Do not adopt trending frameworks without measuring baseline p95 latencies in your existing stack.
2. **Design for Idempotency**: Ensure retry loops and transient failures do not corrupt data or produce duplicate state updates.
3. **Keep Security Native**: Bake authentication and policy enforcement directly into your data layer rather than trusting middleware alone.
4. **Iterate with Real Telemetry**: Observe genuine usage metrics rather than synthetic benchmarks when deploying to production.

---

*Written by Abdul Nabi — Full-Stack Developer & AI/ML Engineer. Explore my projects, open-source tools, and interactive demos at [aiwithab.site](https://aiwithab.site).*
`.trim();

  let excerpt = topic.summary && topic.summary.length > 40
    ? topic.summary.slice(0, 155).replace(/<[^>]+>/g, "").trim()
    : `Technical analysis, architecture patterns, and production implementation insights for ${cleanTitle}.`;
  if (!excerpt.endsWith(".")) excerpt += ".";

  const visualPrompt = createCoverVisualPrompt(cleanTitle, tags);
  const coverImage = generateAiBlogCoverImage(cleanTitle, tags, visualPrompt, imageStyle);

  return {
    title: `${cleanTitle} (${year} Technical Guide)`,
    slug: slugify(cleanTitle).slice(0, 60),
    excerpt,
    content,
    tags,
    coverImage,
    visualPrompt,
  };
}

/**
 * Generates an AI blog post using OpenAI GPT-4o if available,
 * or the enhanced Technical Synthesis engine if key is absent.
 */
export async function generateAiBlogPost(
  topic: NewsItem,
  relatedNews: NewsItem[] = [],
  customInstructions?: string,
  imageStyle: string = "curated_hd"
): Promise<GeneratedBlogPost | null> {
  const openAiKey = process.env.OPENAI_API_KEY;
  const isKeyMissing = !openAiKey || openAiKey === "sk-your-openai-api-key" || openAiKey.trim() === "";

  if (isKeyMissing) {
    console.log("[ai-blog-generator] OPENAI_API_KEY not configured — using technical synthesis engine.");
    return generateTechnicalFallbackPost(topic, relatedNews, customInstructions, imageStyle);
  }

  const year = new Date().getFullYear();
  const prompt = `You are Abdul Nabi, a full-stack developer and AI/ML engineer from Karachi, Pakistan who writes authoritative, practical technical blog posts on AI, machine learning, and modern software architecture. Your official portfolio is https://aiwithab.site.

Write a comprehensive, SEO-optimized technical blog post analyzing this trending tech news topic:

PRIMARY TOPIC: ${topic.title}
CONTEXT: ${topic.summary || "Trending IT / Tech development in " + year}
SOURCE: ${topic.source}
RELATED TRENDS: ${relatedNews.map((n) => n.title).join("; ") || "None"}
${customInstructions ? `CUSTOM INSTRUCTIONS / FOCUS: ${customInstructions}` : ""}

REQUIREMENTS:
1. Length: 1500–2200 words, highly practical, technically deep, and engaging.
2. Voice: First-person engineering voice ("I built", "In our architecture", "When deploying to production").
3. Structure:
   - Catchy, SEO-optimized title
   - Compelling intro explaining what happened this week and why it matters
   - Architecture diagram (ASCII or clear diagram block)
   - Real, working code snippet (TypeScript or Python) solving a real problem
   - Benchmark / comparison markdown table
   - AppSec & security considerations (mentioning Supabase RLS, defense-in-depth)
   - 4 bulleted actionable takeaways
4. Visual Prompt: Write a 1-sentence prompt for a 3D AI cover image (no text, dark futuristic aesthetic).

Respond ONLY with valid JSON in this exact structure:
{
  "title": "Full SEO-optimized blog title",
  "slug": "url-friendly-slug-max-60-chars",
  "excerpt": "Compelling meta description 120-160 characters for SEO",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "content": "Full markdown article body here...",
  "visualPrompt": "cinematic 3D render of..."
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
        messages: [{ role: "user", content: prompt }],
        temperature: 0.75,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(45000),
    });

    if (!res.ok) {
      console.warn(`[ai-blog-generator] OpenAI error (${res.status}), using technical synthesis fallback.`);
      return generateTechnicalFallbackPost(topic, relatedNews, customInstructions);
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return generateTechnicalFallbackPost(topic, relatedNews, customInstructions);

    const parsed = JSON.parse(raw) as GeneratedBlogPost;
    if (!parsed.title || !parsed.content || !parsed.excerpt) {
      return generateTechnicalFallbackPost(topic, relatedNews, customInstructions, imageStyle);
    }

    const tags = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 6) : ["AI", "Machine Learning", "Tech Trends"];
    const coverImage = generateAiBlogCoverImage(parsed.title, tags, parsed.visualPrompt, imageStyle);

    return {
      title: parsed.title,
      slug: slugify(parsed.slug || parsed.title),
      excerpt: parsed.excerpt,
      content: parsed.content,
      tags,
      coverImage,
      visualPrompt: parsed.visualPrompt,
    };
  } catch (err) {
    console.warn("[ai-blog-generator] OpenAI call exception, using technical synthesis fallback:", err);
    return generateTechnicalFallbackPost(topic, relatedNews, customInstructions, imageStyle);
  }
}

/**
 * Complete 4-Step Interactive & Programmatic Generation Pipeline:
 * 1. Takes input topic
 * 2. Analyzes trending IT/tech news
 * 3. Generates high-resolution cover image
 * 4. Publishes post to Supabase & revalidates cache
 */
export async function generateAndPublishSingleBlog(
  req: AutoBlogRequest = {}
): Promise<AutoBlogResponse> {
  const startTime = Date.now();
  console.log(`[ai-blog-generator] Starting generation pipeline for topic: "${req.topic || "Auto-discover"}"`);

  try {
    // 1. Analyze trending tech news
    const { primaryTopic, relatedNews } = await searchAndAnalyzeTrendingNews(req.topic);
    console.log(`[ai-blog-generator] Selected primary topic: "${primaryTopic.title}" (${primaryTopic.source})`);

    // 2. Generate the blog post & visual prompt
    const generatedPost = await generateAiBlogPost(primaryTopic, relatedNews, req.category, req.imageStyle || "curated_hd");
    if (!generatedPost) {
      return { success: false, error: "Failed to generate blog content" };
    }

    // 3. Ensure slug uniqueness
    const existingPosts = await getAllBlogs();
    const existingSlugs = new Set(existingPosts.map((p) => p.slug));
    let finalSlug = generatedPost.slug;
    if (existingSlugs.has(finalSlug)) {
      finalSlug = `${finalSlug}-${Date.now().toString(36).slice(-4)}`;
    }

    // 4. Save to database
    const createdPost = await createBlog({
      title: generatedPost.title,
      slug: finalSlug,
      excerpt: generatedPost.excerpt,
      content: generatedPost.content,
      tags: generatedPost.tags,
      coverImage: generatedPost.coverImage,
      published: req.published ?? true,
      date: new Date().toISOString().split("T")[0],
    });

    // 5. Revalidate cache
    try {
      revalidatePath("/", "layout");
      revalidatePath("/blog", "layout");
      revalidatePath(`/blog/${finalSlug}`, "layout");
      revalidatePath("/feed.xml");
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("[ai-blog-generator] Revalidation warning:", e);
    }

    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    // 6. Record run to Supabase cron log
    try {
      const logEntry = {
        key: "auto_blog_cron_log",
        value: JSON.stringify({
          lastRun: new Date().toISOString(),
          created: [finalSlug],
          skipped: [],
          errors: [],
          durationSeconds,
          lastTopic: primaryTopic.title,
          lastCoverImage: generatedPost.coverImage,
        }),
        updated_at: new Date().toISOString(),
      };
      await supabaseDbUpsert("site_settings", [logEntry]);
    } catch {}

    return {
      success: true,
      post: {
        title: createdPost.title,
        slug: createdPost.slug,
        excerpt: createdPost.excerpt,
        tags: createdPost.tags,
        coverImage: createdPost.coverImage || generatedPost.coverImage,
        readTime: createdPost.readTime,
        date: createdPost.date,
      },
      analyzedNews: [primaryTopic, ...relatedNews],
      durationSeconds,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ai-blog-generator] Pipeline error:", err);
    return { success: false, error: message };
  }
}

/**
 * Daily background cron runner (up to maxPosts)
 */
export async function runAutoBlog(
  maxPosts = 3,
  topicQuery?: string
): Promise<{ created: string[]; skipped: string[]; errors: string[] }> {
  const result = { created: [] as string[], skipped: [] as string[], errors: [] as string[] };

  const existingPosts = await getAllBlogs();
  const existingSlugs = new Set(existingPosts.map((p) => p.slug));

  const { primaryTopic, relatedNews } = await searchAndAnalyzeTrendingNews(topicQuery);
  const candidates = [primaryTopic, ...relatedNews];

  let generated = 0;
  for (const topic of candidates) {
    if (generated >= maxPosts) break;

    const potentialSlug = slugify(topic.title);
    if (existingSlugs.has(potentialSlug)) {
      result.skipped.push(potentialSlug);
      continue;
    }

    try {
      const post = await generateAiBlogPost(topic, relatedNews);
      if (!post) {
        result.errors.push(`Failed to generate: ${topic.title.slice(0, 40)}`);
        continue;
      }

      await createBlog({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        tags: post.tags,
        coverImage: post.coverImage,
        published: true,
        date: new Date().toISOString().split("T")[0],
      });

      existingSlugs.add(post.slug);
      result.created.push(post.slug);
      generated++;

      if (generated < maxPosts) {
        await new Promise((r) => setTimeout(r, 1200));
      }
    } catch (err) {
      console.error("[runAutoBlog] Error creating post:", err);
      result.errors.push(`Error creating post for ${topic.title.slice(0, 30)}`);
    }
  }

  // Retention: Keep newest 40 active posts, move excess to Bin
  try {
    const allActive = await getAllBlogs();
    if (allActive.length > 40) {
      const excess = allActive.slice(40);
      for (const oldPost of excess) {
        await moveToTrash(oldPost.slug, "auto_bot_cleanup");
      }
    }
  } catch {}

  return result;
}
