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
  imageUrl?: string;
  status: "Draft" | "Posted" | "Scheduled";
  scheduledAt?: string; // ISO Date string for future scheduled publication
  postedAt?: string;    // ISO Date string when published
  createdAt: string;
}

function getCleanImageTextUrl(imageUrl?: string, dayNumber?: number): string {
  if (!imageUrl || imageUrl.startsWith("data:")) {
    return `https://www.aiwithab.site/api/project-banner?day=${dayNumber || 1}`;
  }
  if (imageUrl.startsWith("/")) {
    return `https://www.aiwithab.site${imageUrl}`;
  }
  return imageUrl;
}

export interface GeneratedLinkedInPost {
  post: string;
  firstComment: string;
  hashtags: string[];
  angle: string;
}

export function generateLinkedInPost(proj: Partial<MiniProject>, imageUrl?: string): string {
  const dayNum = proj.dayNumber || 1;
  const title = proj.title || "AI Developer Tool";
  const category = proj.category || "Full-Stack Web App";
  const desc = proj.description || "Building real-world web applications with Next.js and AI.";
  const tags = proj.tags || ["Next.js", "TypeScript", "TailwindCSS"];
  const vercelUrl = proj.vercelUrl || "https://www.aiwithab.site/mini-projects";

  // Filter 3-4 tight hashtags
  const selectedTags: string[] = [];
  const lowerCat = category.toLowerCase();
  const lowerTitle = title.toLowerCase();

  if (lowerCat.includes("health") || lowerTitle.includes("glucose") || lowerTitle.includes("symptom") || lowerTitle.includes("medic")) {
    selectedTags.push("#healthcareAI", "#python", "#machinelearning", "#webdev");
  } else if (lowerCat.includes("cloud") || lowerCat.includes("devops") || lowerTitle.includes("architecture") || lowerTitle.includes("load test")) {
    selectedTags.push("#cloudcomputing", "#devops", "#systemdesign", "#nextjs");
  } else if (lowerCat.includes("fintech") || lowerTitle.includes("stock") || lowerTitle.includes("expense") || lowerTitle.includes("finance")) {
    selectedTags.push("#fintech", "#typescript", "#react", "#buildinpublic");
  } else if (lowerCat.includes("data") || lowerTitle.includes("sql") || lowerTitle.includes("3d") || lowerTitle.includes("database")) {
    selectedTags.push("#databases", "#fullstack", "#typescript", "#datascience");
  } else {
    selectedTags.push("#nextjs", "#typescript", "#webdev", "#buildinpublic");
  }

  // Rotate between 5 high-performing narrative angles based on day/category
  const angleIndex = dayNum % 5;

  let hook = "";
  let meat = "";
  let takeaway = "";
  let closing = "";

  if (angleIndex === 0) {
    // Angle 1: Architecture & Technical Tradeoff
    hook = `Most developers underestimate the hidden cost of state synchronization in real-time web apps.\n\nWhile building ${title}, I had to make a tough call between client-side optimistic updates and strict server validation.`;
    meat = `Here is what actually worked in the build:\n\n• ${desc}\n• Stack: ${tags.slice(0, 3).join(" • ")}\n• Handled latency by pushing compute to edge serverless functions instead of heavy central servers.`;
    takeaway = `Building this taught me that keeping client state simple beats complex caching layers every single time.`;
    closing = `For other engineers building in ${tags[0] || "Next.js"}: what’s your go-to pattern for handling optimistic UI?`;
  } else if (angleIndex === 1) {
    // Angle 2: Problem-Solving & Edge Case Bug
    hook = `The hardest bug when building ${title} wasn't the AI integration—it was handling messy edge cases in the user input.\n\nWhen you build an app that relies on real user data, edge cases break your assumptions in minutes.`;
    meat = `What the tool does:\n${desc}\n\nKey technical decision:\nAdded strict runtime schema validation and fallback heuristics so the application never crashes even if the external API returns unexpected tokens.`;
    takeaway = `Reliability isn’t about using the biggest model; it’s about writing solid defensive code around the model.`;
    closing = `How do you usually handle prompt drift or unformatted outputs in your apps?`;
  } else if (angleIndex === 2) {
    // Angle 3: Practical Insight & User Experience
    hook = `Clean UI doesn’t matter if the user has to wait more than 300ms for feedback.\n\nFor ${title}, my primary focus was cutting interaction friction down to zero.`;
    meat = `Here’s how it works:\n• ${desc}\n• Core stack: ${tags.join(" • ")}\n• Built with lightweight client-side state so interactions feel instantaneous on mobile and desktop.`;
    takeaway = `Users judge tools on speed and clarity, not how complicated the backend looks under the hood.`;
    closing = `What’s the single most important UX detail you prioritize when shipping a new tool?`;
  } else if (angleIndex === 3) {
    // Angle 4: Contrarian Builder Reflection
    hook = `Stop over-engineering your full-stack projects before you even validate the core workflow.\n\nWith ${title}, I resisted the urge to set up a bloated microservice architecture.`;
    meat = `Instead, I focused on shipping one solid solution:\n• ${desc}\n• Implemented with ${tags.slice(0, 3).join(", ")}.\n• Kept the entire system in a single clean monorepo with automated edge deployments.`;
    takeaway = `Shipping small, focused utilities has taught me 10x more about full-stack engineering than reading endless docs.`;
    closing = `What’s a feature you recently stripped out of a project because it was unnecessary complexity?`;
  } else {
    // Angle 5: Domain & Safety / Reliability
    hook = `Building software for ${category} requires a completely different mindset than building standard CRUD apps.\n\nWith ${title}, correctness and user trust had to come before everything else.`;
    meat = `Project breakdown:\n${desc}\n\nTech implementation:\n• Powered by ${tags.join(" • ")}\n• Engineered with clear visual diagnostics and instant actionable feedback.`;
    takeaway = `Writing clear code and transparent error states is how you build products people actually rely on.`;
    closing = `What’s your biggest priority when designing user-facing dashboards?`;
  }

  const hashtagString = selectedTags.slice(0, 4).join(" ");

  return `${hook}

${meat}

${takeaway}

${closing}

${hashtagString}

(Live demo and repo link in the first comment 👇)`;
}

export function generateRedditPost(proj: Partial<MiniProject>, imageUrl?: string): { title: string; body: string; subreddit: string } {
  const dayStr = proj.dayNumber ? `Day ${String(proj.dayNumber).padStart(2, "0")}` : "Day XX";
  const title = proj.title || "AI Micro Tool";
  const category = proj.category || "Full-Stack";
  const vercelUrl = proj.vercelUrl || "https://www.aiwithab.site/mini-projects";
  const githubUrl = proj.githubUrl || "https://github.com/abdulnabii/mini-projects";
  const tags = proj.tags ? proj.tags.join(", ") : "Next.js, TypeScript, TailwindCSS";

  const subreddit = category.toLowerCase().includes("health")
    ? "r/SideProject"
    : category.toLowerCase().includes("devops") || category.toLowerCase().includes("cloud")
    ? "r/devops"
    : "r/webdev";

  const redditTitle = `I built a tool for ${title.toLowerCase()} — built with ${tags.split(",")[0]}`;

  const body = `Hey r/${subreddit.replace("r/", "")}!

I wanted to share a project I've been working on: **${title}** (${category}).

### 📌 The Problem & Solution
${proj.description || "An application built to solve real-world workflows with minimal friction."}

### 🛠️ Technical Stack
* **Frontend**: Next.js (App Router) + TypeScript
* **Styling**: Tailwind CSS
* **Tech / APIs**: ${tags}
* **Deployment**: Vercel

### 🔗 Live Links
* **Live Demo**: ${vercelUrl}
* **GitHub Repository**: ${githubUrl}

Would love any constructive feedback on the architecture, edge cases, or UX!`;

  return { title: redditTitle, body, subreddit };
}

export function generateTwitterPost(proj: Partial<MiniProject>): string {
  const title = proj.title || "AI Tool";
  const desc = proj.description?.slice(0, 150) || "Full-stack developer tool.";
  const tags = (proj.tags || ["NextJS", "TypeScript"]).map(t => `#${t.replace(/[^a-zA-Z0-9]/g, "")}`).slice(0, 3).join(" ");

  return `Shipped ${title}:

${desc}

Stack: ${(proj.tags || ["Next.js", "TypeScript"]).slice(0, 3).join(" • ")}

Try it: ${proj.vercelUrl || "https://www.aiwithab.site/mini-projects"}

${tags}`;
}

let memorySocialPosts: SocialPost[] = [];

function sanitizeSocialPost(p: SocialPost): SocialPost {
  const cleanLinkedIn = p.linkedInContent
    .split("\n")
    .filter((line) => !line.trim().startsWith("📸 Project Preview Image:") && !line.trim().startsWith("📸 Banner Image:"))
    .join("\n")
    .trim();

  const cleanReddit = p.redditContent
    .split("\n")
    .filter((line) => !line.trim().startsWith("![Project Preview Banner]"))
    .join("\n")
    .trim();

  return {
    ...p,
    linkedInContent: cleanLinkedIn,
    redditContent: cleanReddit,
  };
}

export async function getSocialPosts(): Promise<SocialPost[]> {
  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>(
      "site_settings",
      "select=*&key=eq.social_posts_data"
    );
    if (rows && rows.length > 0 && rows[0].value) {
      const parsed = JSON.parse(rows[0].value) as SocialPost[];
      if (Array.isArray(parsed)) {
        memorySocialPosts = parsed.map(sanitizeSocialPost);
        return memorySocialPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }
  } catch (err) {
    console.error("[getSocialPosts] Exception:", err);
  }
  return memorySocialPosts.map(sanitizeSocialPost);
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

export async function createSocialPost(
  proj: Partial<MiniProject>,
  imageUrl?: string,
  options?: { scheduledAt?: string; status?: "Draft" | "Posted" | "Scheduled" }
): Promise<SocialPost> {
  const current = await getSocialPosts();
  const img = imageUrl || "https://www.aiwithab.site/profile.jpg";
  const redditData = generateRedditPost(proj, img);

  const isScheduled = !!options?.scheduledAt && new Date(options.scheduledAt).getTime() > Date.now();

  const newPost: SocialPost = {
    id: `post-${Date.now()}`,
    miniProjectId: proj.id,
    title: proj.title || "Social Post Campaign",
    category: proj.category || "AI Project",
    linkedInContent: generateLinkedInPost(proj, img),
    redditContent: `Title: ${redditData.title}\n\n${redditData.body}`,
    redditSubreddit: redditData.subreddit,
    twitterContent: generateTwitterPost(proj),
    vercelUrl: proj.vercelUrl || "https://www.aiwithab.site/mini-projects",
    githubUrl: proj.githubUrl,
    imageUrl: img,
    status: isScheduled ? "Scheduled" : (options?.status || "Draft"),
    scheduledAt: isScheduled ? options?.scheduledAt : undefined,
    createdAt: new Date().toISOString(),
  };

  const updated = [newPost, ...current];
  await saveSocialPosts(updated);
  return newPost;
}

export async function scheduleSocialPost(id: string, scheduledAt: string): Promise<SocialPost> {
  const posts = await getSocialPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Social post not found");

  posts[index] = {
    ...posts[index],
    status: "Scheduled",
    scheduledAt,
  };

  await saveSocialPosts(posts);
  return posts[index];
}

export async function cancelSocialPostSchedule(id: string): Promise<SocialPost> {
  const posts = await getSocialPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Social post not found");

  posts[index] = {
    ...posts[index],
    status: "Draft",
    scheduledAt: undefined,
  };

  await saveSocialPosts(posts);
  return posts[index];
}

export async function getDueScheduledSocialPosts(): Promise<SocialPost[]> {
  const posts = await getSocialPosts();
  const now = Date.now();
  return posts.filter(
    (p) => p.status === "Scheduled" && p.scheduledAt && new Date(p.scheduledAt).getTime() <= now
  );
}

export async function deleteSocialPost(id: string): Promise<boolean> {
  const current = await getSocialPosts();
  const filtered = current.filter((p) => p.id !== id);
  if (filtered.length === current.length) return false;

  await saveSocialPosts(filtered);
  return true;
}
