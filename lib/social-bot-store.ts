import { MiniProject } from "./mini-projects-store";
import { supabaseDbQuery, supabaseDbUpsert } from "./supabase";

export interface SocialPost {
  id: string;
  miniProjectId?: string;
  title: string;
  category: string;
  linkedInContent: string;
  redditContent: string;
  redditSubreddit: string;
  twitterContent: string;
  vercelUrl: string;
  githubUrl?: string;
  status: "Draft" | "Posted" | "Scheduled";
  createdAt: string;
}

export function generateLinkedInPost(proj: Partial<MiniProject>): string {
  const dayStr = proj.dayNumber ? `Day ${String(proj.dayNumber).padStart(2, "0")}` : "New AI Project";
  const title = proj.title || "AI Micro Tool";
  const category = proj.category || "Full-Stack AI";
  const vercelUrl = proj.vercelUrl || "https://www.aiwithab.site/mini-projects";
  const portfolioUrl = "https://www.aiwithab.site/mini-projects";

  return `🚀 ${dayStr} of my 30 Days 30 AI Projects Challenge: ${title}!

I just launched ${title} — a production-grade ${category} web application designed for high performance, accuracy, and seamless user experience.

💡 What it does:
${proj.description || "Building full-stack AI web applications with Next.js 14 and cutting-edge machine learning models."}

🛠️ Tech Stack & Architecture:
• ${proj.tags ? proj.tags.join(" • ") : "Next.js 14 • TypeScript • Gemini 1.5 • TailwindCSS"}
• Monorepo Architecture with clean Vercel serverless deployments
• Responsive Dark/Light UI with glassmorphism ergonomics

🔗 Test the live application here:
👉 Live App: ${vercelUrl}
🌐 Full Portfolio & Micro Tools Explorer: ${portfolioUrl}

I'd love your feedback! What feature should I add next?

#BuildInPublic #NextJS #TypeScript #ArtificialIntelligence #SoftwareEngineering #30Days30AIProjects #FullStackDeveloper`;
}

export function generateRedditPost(proj: Partial<MiniProject>): { title: string; body: string; subreddit: string } {
  const dayStr = proj.dayNumber ? `Day ${String(proj.dayNumber).padStart(2, "0")}` : "Day XX";
  const title = proj.title || "AI Micro Tool";
  const category = proj.category || "Full-Stack AI";
  const vercelUrl = proj.vercelUrl || "https://www.aiwithab.site/mini-projects";
  const githubUrl = proj.githubUrl || "https://github.com/abdulnabii/mini-projects";

  const subreddit = category.toLowerCase().includes("health")
    ? "r/SideProject"
    : category.toLowerCase().includes("developer")
    ? "r/webdev"
    : "r/reactjs";

  const redditTitle = `[Show HN / Project] I'm building 30 AI projects in 30 days — ${dayStr}: ${title}`;

  const body = `Hey r/${subreddit.replace("r/", "")}!

I'm currently undertaking a challenge to build and deploy 30 production-grade AI micro-tools in 30 days.

Today I finished **${title}** (${category}).

### 📌 Overview
${proj.description || "An AI-powered web application built to solve real-world workflows."}

### 🛠️ Tech Stack
* **Framework**: Next.js 14 (App Router) + TypeScript
* **Styling**: Tailwind CSS & Framer Motion
* **AI Engine**: Google Gemini 1.5 API
* **Deployment**: Vercel Serverless

### 🔗 Live Links & Monorepo
* **Live Demo**: [${vercelUrl}](${vercelUrl})
* **GitHub Monorepo**: [${githubUrl}](${githubUrl})
* **Full Portfolio Explorer**: [https://www.aiwithab.site/mini-projects](https://www.aiwithab.site/mini-projects)

Would love to hear your thoughts, feedback, or any edge cases you spot!`;

  return { title: redditTitle, body, subreddit };
}

export function generateTwitterPost(proj: Partial<MiniProject>): string {
  const dayStr = proj.dayNumber ? `Day ${String(proj.dayNumber).padStart(2, "0")}` : "Day XX";
  const title = proj.title || "AI Micro Tool";
  const vercelUrl = proj.vercelUrl || "https://www.aiwithab.site/mini-projects";

  return `🚀 ${dayStr} of 30 AI Projects in 30 Days: ${title}!

Built with Next.js 14, TypeScript & Gemini API.

✨ Feature Highlights:
${proj.description?.slice(0, 140) || "AI-powered micro tool."}

Try it live: ${vercelUrl}
Explorer: https://www.aiwithab.site/mini-projects

#BuildInPublic #NextJS #AI`;
}

let memorySocialPosts: SocialPost[] = [];

export async function getSocialPosts(): Promise<SocialPost[]> {
  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>(
      "site_settings",
      "select=*&key=eq.social_posts_data"
    );
    if (rows && rows.length > 0 && rows[0].value) {
      const parsed = JSON.parse(rows[0].value) as SocialPost[];
      if (Array.isArray(parsed)) {
        memorySocialPosts = parsed;
        return memorySocialPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }
  } catch (err) {
    console.error("[getSocialPosts] Exception:", err);
  }
  return memorySocialPosts;
}

export async function saveSocialPosts(posts: SocialPost[]): Promise<SocialPost[]> {
  try {
    memorySocialPosts = [...posts];
    await supabaseDbUpsert("site_settings", [
      {
        key: "social_posts_data",
        value: JSON.stringify(posts),
        updated_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error("[saveSocialPosts] Exception:", err);
  }
  return memorySocialPosts;
}

export async function createSocialPost(proj: Partial<MiniProject>): Promise<SocialPost> {
  const current = await getSocialPosts();
  const redditData = generateRedditPost(proj);

  const newPost: SocialPost = {
    id: `post-${Date.now()}`,
    miniProjectId: proj.id,
    title: proj.title || "Social Post Campaign",
    category: proj.category || "AI Project",
    linkedInContent: generateLinkedInPost(proj),
    redditContent: `Title: ${redditData.title}\n\n${redditData.body}`,
    redditSubreddit: redditData.subreddit,
    twitterContent: generateTwitterPost(proj),
    vercelUrl: proj.vercelUrl || "https://www.aiwithab.site/mini-projects",
    githubUrl: proj.githubUrl,
    status: "Draft",
    createdAt: new Date().toISOString(),
  };

  const updated = [newPost, ...current];
  await saveSocialPosts(updated);
  return newPost;
}

export async function deleteSocialPost(id: string): Promise<boolean> {
  const current = await getSocialPosts();
  const filtered = current.filter((p) => p.id !== id);
  if (filtered.length === current.length) return false;

  await saveSocialPosts(filtered);
  return true;
}
