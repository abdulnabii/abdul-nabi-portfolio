/**
 * AI Blog Generator — fetches trending AI/ML news from RSS feeds
 * and generates full SEO-optimized blog posts using OpenAI GPT-4o
 * with a high-quality technical fallback generator if no API key is set.
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

// Fallback trending topics if RSS feeds fail
const FALLBACK_TOPICS: NewsItem[] = [
  {
    title: "The Rise of Multimodal AI: How Vision-Language Models Are Changing Software Engineering",
    summary: "Multimodal AI models process text, images, and code simultaneously, enabling next-generation developer tooling and autonomous agents.",
    source: "Trending Tech",
    url: "",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "AI in Healthcare 2026: Machine Learning Revolutionizes Patient Risk Prediction",
    summary: "ML models achieve doctor-level accuracy in early diagnostic predictions, diabetes risk tracking, and personalized care plans.",
    source: "Healthcare AI Journal",
    url: "",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Python AI Ecosystem in 2026: PyTorch vs JAX vs Scikit-Learn for Production",
    summary: "A practical evaluation of the modern machine learning stack, performance benchmarks, and deployment strategies.",
    source: "ML Mastery",
    url: "",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "LLM Security & AppSec: Defensive Strategies Against Prompt Injection and Data Leakage",
    summary: "As generative AI integrates into core business workflows, securing model endpoints and fine-tuned weights is vital.",
    source: "Security Insights",
    url: "",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Fine-Tuning vs RAG: Architecting Real-Time Enterprise AI Knowledge Systems",
    summary: "When to fine-tune open weights vs deploying Retrieval-Augmented Generation for fast, accurate context lookup.",
    source: "AI Architecture Review",
    url: "",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Building High-Throughput ML Pipelines with FastAPI, Supabase, and Scikit-Learn",
    summary: "A practical guide to packaging, containerizing, and serving predictive ML endpoints with sub-50ms latency.",
    source: "Engineering Digest",
    url: "",
    publishedAt: new Date().toISOString(),
  },
];

function parseRssXml(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  try {
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
        const rawTitle = titleMatch[1]
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#8217;/g, "'")
          .replace(/&#8216;/g, "'")
          .replace(/&#8220;/g, '"')
          .replace(/&#8221;/g, '"')
          .trim();

        if (rawTitle.length > 10) {
          items.push({
            title: rawTitle,
            summary: (summaryMatch?.[1] || "")
              .replace(/<[^>]+>/g, "")
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&#8217;/g, "'")
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

  const aiKeywords = ["AI", "machine learning", "LLM", "neural", "GPT", "model", "ML", "deep learning", "artificial", "ChatGPT", "language model", "transformer", "automation", "NLP", "scikit", "PyTorch"];
  const relevant = allNews.filter((item) =>
    aiKeywords.some(
      (kw) =>
        item.title.toLowerCase().includes(kw.toLowerCase()) ||
        item.summary.toLowerCase().includes(kw.toLowerCase())
    )
  );

  const seen = new Set<string>();
  const deduped = (relevant.length > 0 ? relevant : allNews).filter((item) => {
    const key = item.title.toLowerCase().replace(/[^a-z]/g, "").slice(0, 30);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped.slice(0, 6);
}

/**
 * Fallback generator when OpenAI API key is not configured or rate limited.
 * Generates structured, high-quality technical articles written in Abdul Nabi's voice.
 */
function generateTechnicalFallbackPost(topic: NewsItem): GeneratedBlogPost {
  const year = new Date().getFullYear();
  const cleanTitle = topic.title.replace(/[\n\r]/g, " ").trim();
  const slug = slugify(cleanTitle);

  const content = `
## Introduction

The rapid evolution of artificial intelligence and machine learning is reshaping software architecture across industries. Topic under focus: **${cleanTitle}**. As developers and researchers push the boundaries of what intelligence systems can achieve, understanding practical implementation patterns becomes essential.

In this deep-dive, we explore the core principles behind these advancements, practical implementation workflows in Python, and real-world considerations for deploying robust ML models.

---

## Technical Overview & Key Architecture Patterns

Modern machine learning systems rely on well-structured data engineering pipelines, dynamic feature extraction, and reproducible inference loops.

### Core Implementation Workflow

When building production-ready AI services:

1. **Data Preprocessing & Normalization**: Cleaning raw input distributions to prevent training drift.
2. **Model Evaluation & Cross-Validation**: Validating predictive accuracy against clinical or enterprise benchmarks.
3. **Inference Latency Optimization**: Packaging weights into lightweight runtime containers.

Here is an example Python snippet demonstrating feature scaling and scikit-learn pipeline assembly:

\`\`\`python
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

# Sample pipeline for predictive scoring
def create_ml_pipeline():
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    return pipeline

if __name__ == "__main__":
    X_dummy = np.random.rand(100, 5)
    y_dummy = np.random.randint(0, 2, 100)
    
    model = create_ml_pipeline()
    model.fit(X_dummy, y_dummy)
    print("Pipeline initialized & fitted successfully.")
\`\`\`

---

## Real-World Case Study: AI in Healthcare

In my own work on the **Blood Sugar Tracker** (an AI-powered health risk prediction application built with Next.js, Python, and Supabase RLS), integrating predictive machine learning models improved early anomaly detection significantly while enforcing strict user data privacy.

Combining predictive modeling with modern Web APIs allows developers to deliver immediate, personalized feedback to users without compromising security or responsiveness.

---

## Key Takeaways & Recommendations

- **Prioritize Data Quality**: Clean inputs yield reliable model predictions.
- **Enforce Security First**: Protect model endpoints against unauthorized access using Row Level Security and scoped API keys.
- **Monitor Performance**: Track latency and memory footprint in production.

---

*Written by Abdul Nabi — Full-Stack Developer & AppSec Enthusiast. Explore more projects and interactive live demos on [aiwithab.site](https://aiwithab.site).*
`.trim();

  return {
    title: `${cleanTitle} (${year} Guide)`,
    slug: slug.slice(0, 60),
    excerpt: `An in-depth technical analysis of ${cleanTitle}, covering implementation workflows, architecture patterns, and real-world deployment strategies.`,
    content,
    tags: ["Artificial Intelligence", "Machine Learning", "Python", "AppSec", "Tech Trends"],
  };
}

export async function generateAiBlogPost(topic: NewsItem): Promise<GeneratedBlogPost | null> {
  const openAiKey = process.env.OPENAI_API_KEY;

  // Check if OPENAI_API_KEY is missing or default placeholder
  const isKeyMissing = !openAiKey || openAiKey === "sk-your-openai-api-key" || openAiKey.trim() === "";

  if (isKeyMissing) {
    console.log("[ai-blog-generator] OPENAI_API_KEY not configured — using fallback generator.");
    return generateTechnicalFallbackPost(topic);
  }

  const year = new Date().getFullYear();
  const prompt = `You are Abdul Nabi, a full-stack developer and ML engineer from Karachi, Pakistan who writes authoritative, technical blog posts on AI, machine learning, and web development. Your portfolio is at https://aiwithab.site.

Write a comprehensive, SEO-optimized technical blog post about the following topic:

TOPIC: ${topic.title}
CONTEXT: ${topic.summary || "A trending topic in the AI/ML space in " + year}
SOURCE: ${topic.source}

REQUIREMENTS:
1. The post should be 1500-2000 words, engaging, and technically accurate
2. Use first-person voice naturally (you are Abdul Nabi sharing insights)
3. Structure:
   - Compelling intro that hooks the reader
   - Clear H2 and H3 subheadings (use ## and ### in markdown)
   - Practical code examples in Python or JavaScript where relevant (use code blocks)
   - Real-world applications and use cases
   - Current trends as of ${year}
   - A concluding section with actionable takeaways
4. SEO: naturally weave in related keywords throughout
5. End with a short paragraph mentioning that Abdul Nabi built an AI-powered healthcare application (Blood Sugar Tracker) and invite readers to explore his portfolio at https://aiwithab.site
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
      signal: AbortSignal.timeout(45000),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[ai-blog-generator] OpenAI returned status ${res.status}: ${errText}. Falling back to technical post generator.`);
      return generateTechnicalFallbackPost(topic);
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return generateTechnicalFallbackPost(topic);

    const parsed = JSON.parse(raw) as GeneratedBlogPost;
    if (!parsed.title || !parsed.content || !parsed.excerpt) return generateTechnicalFallbackPost(topic);

    return {
      title: parsed.title,
      slug: slugify(parsed.slug || parsed.title),
      excerpt: parsed.excerpt,
      content: parsed.content,
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 6) : ["AI", "Machine Learning"],
    };
  } catch (err) {
    console.warn("[ai-blog-generator] OpenAI call exception, using fallback generator:", err);
    return generateTechnicalFallbackPost(topic);
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
  let candidates = newsItems.filter((item) => {
    const potentialSlug = slugify(item.title);
    return !existingSlugs.has(potentialSlug);
  });

  // If top RSS items were already published in previous runs, add fresh unique AI topics
  if (candidates.length < maxPosts) {
    console.log("[ai-blog-generator] Top RSS items already published. Generating fresh unique AI topics...");
    const extraTopics: NewsItem[] = [
      {
        title: "Building Agentic AI Workflows with Next.js 14, Python and LangChain",
        summary: "An practical guide to architecting autonomous agent pipelines, tool-calling loops, and resilient state handling.",
        source: "AI Engineering Digest",
        url: "",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Optimizing LLM Inference Latency: Speculative Decoding and Continuous Batching",
        summary: "How modern inference engines achieve sub-20ms token latency through speculative sampling and dynamic memory allocation.",
        source: "ML Systems Review",
        url: "",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Securing AI Endpoints: Threat Modeling Prompt Injection & Weight Leakage",
        summary: "AppSec strategies for auditing LLM integration endpoints, sanitizing untrusted inputs, and isolating tool permissions.",
        source: "AppSec Journal",
        url: "",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Real-Time Predictive Modeling in Healthcare: Lessons from Diabetes Analytics",
        summary: "Architecting HIPAA-inspired patient prediction systems with scikit-learn, Supabase RLS, and reactive dashboards.",
        source: "Healthcare AI Insights",
        url: "",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Comparing PyTorch 2.5 vs JAX vs Polars for High-Throughput Feature Pipelines",
        summary: "A practical benchmarking guide comparing execution speed, GPU memory utilization, and developer ergonomics.",
        source: "ML Mastery",
        url: "",
        publishedAt: new Date().toISOString(),
      },
    ];

    for (const item of extraTopics) {
      if (candidates.length >= maxPosts * 2) break;
      const potentialSlug = slugify(item.title);
      if (!existingSlugs.has(potentialSlug)) {
        candidates.push(item);
      }
    }
  }

  let generated = 0;
  for (const topic of candidates) {
    if (generated >= maxPosts) break;

    console.log(`[ai-blog-generator] Generating post for: ${topic.title}`);
    const post = await generateAiBlogPost(topic);

    if (!post) {
      result.errors.push(`Failed to generate: ${topic.title.slice(0, 40)}...`);
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

      if (generated < maxPosts) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    } catch (err) {
      console.error("[ai-blog-generator] Failed to create blog:", err);
      result.errors.push(`Database error on slug: ${post.slug}`);
    }
  }

  return result;
}
