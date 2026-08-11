import { getMiniProjects, MiniProject } from "./mini-projects-store";
import { createSocialPost, SocialPost } from "./social-bot-store";
import {
  getSocialCredentials,
  publishDirectToLinkedIn,
  publishDirectToReddit,
  saveSocialCredentials,
  SocialCredentials,
} from "./social-credentials-store";

export interface AutoPosterLog {
  timestamp: string;
  projectId: string;
  projectTitle: string;
  linkedInStatus: string;
  redditStatus: string;
  bannerUrl: string;
}

export async function executeAutoPosterCycle(): Promise<{
  ok: boolean;
  log: AutoPosterLog;
  post?: SocialPost;
}> {
  const creds = await getSocialCredentials();
  const miniProjects = await getMiniProjects();

  if (miniProjects.length === 0) {
    throw new Error("No mini projects available to post");
  }

  const currentIndex = creds.nextAutoPostIndex || 0;
  const project = miniProjects[currentIndex % miniProjects.length];

  // Determine appropriate project dashboard picture banner (never profile.jpg)
  let bannerUrl = `https://www.aiwithab.site/api/project-banner?day=${project.dayNumber}`;
  if (
    project.dayNumber === 4 ||
    project.title.toLowerCase().includes("diabetes") ||
    project.title.toLowerCase().includes("glucose") ||
    project.title.toLowerCase().includes("blood sugar")
  ) {
    bannerUrl = "https://www.aiwithab.site/blood_sugar_banner.jpg";
  }

  // 1. Generate Social Campaign
  const post = await createSocialPost(project, bannerUrl);

  let linkedInStatus = "Skipped (Not Linked)";
  let redditStatus = "Skipped (Not Linked)";

  // 2. Direct Upload to LinkedIn if credentials exist
  if (creds.linkedInAccessToken && creds.linkedInPersonUrn) {
    const res = await publishDirectToLinkedIn(post.linkedInContent, post.vercelUrl, bannerUrl, creds);
    linkedInStatus = res.success ? `Published (ID: ${res.id || "OK"})` : `Failed (${res.message})`;
  }

  // 3. Direct Upload to Reddit if credentials exist
  if (creds.redditClientId && creds.redditUsername && creds.redditPassword) {
    const lines = post.redditContent.split("\n");
    let title = post.title;
    if (lines[0] && lines[0].startsWith("Title: ")) {
      title = lines[0].replace("Title: ", "").trim();
    }
    const redditBody = lines.slice(2).join("\n");

    const res = await publishDirectToReddit(title, redditBody, post.redditSubreddit || "r/webdev", creds);
    redditStatus = res.success ? `Published (${res.url || "OK"})` : `Failed (${res.message})`;
  }

  // 4. Update Auto-Poster Credentials State
  const updatedCreds: SocialCredentials = {
    ...creds,
    lastAutoPostAt: new Date().toISOString(),
    nextAutoPostIndex: (currentIndex + 1) % miniProjects.length,
  };
  await saveSocialCredentials(updatedCreds);

  const log: AutoPosterLog = {
    timestamp: new Date().toISOString(),
    projectId: project.id,
    projectTitle: `Day ${String(project.dayNumber).padStart(2, "0")} — ${project.title}`,
    linkedInStatus,
    redditStatus,
    bannerUrl,
  };

  return { ok: true, log, post };
}
