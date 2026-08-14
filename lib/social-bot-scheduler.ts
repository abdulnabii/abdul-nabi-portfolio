import { getMiniProjects, MiniProject } from "./mini-projects-store";
import {
  createSocialPost,
  getDueScheduledSocialPosts,
  getSocialPosts,
  saveSocialPosts,
  SocialPost,
} from "./social-bot-store";
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
  type?: "scheduled" | "auto-rotation";
}

export async function executeAutoPosterCycle(): Promise<{
  ok: boolean;
  log: AutoPosterLog;
  post?: SocialPost;
  publishedScheduledCount?: number;
}> {
  const creds = await getSocialCredentials();

  // 1. FIRST: Check for any scheduled posts that are due right now!
  const dueScheduled = await getDueScheduledSocialPosts();
  if (dueScheduled.length > 0) {
    const postToPublish = dueScheduled[0]; // Process the earliest due scheduled post
    console.log(`[social-scheduler] Executing due scheduled post: "${postToPublish.title}" (ID: ${postToPublish.id})`);

    let linkedInStatus = "Skipped (Not Linked)";
    let redditStatus = "Skipped (Not Linked)";

    // Publish to LinkedIn
    if (creds.linkedInAccessToken && creds.linkedInPersonUrn) {
      const res = await publishDirectToLinkedIn(
        postToPublish.linkedInContent,
        postToPublish.vercelUrl,
        postToPublish.imageUrl,
        creds
      );
      linkedInStatus = res.success ? `Published (ID: ${res.id || "OK"})` : `Failed (${res.message})`;
    }

    // Publish to Reddit
    if (creds.redditClientId && creds.redditUsername && creds.redditPassword) {
      const lines = postToPublish.redditContent.split("\n");
      let title = postToPublish.title;
      if (lines[0] && lines[0].startsWith("Title: ")) {
        title = lines[0].replace("Title: ", "").trim();
      }
      const redditBody = lines.slice(2).join("\n");

      const res = await publishDirectToReddit(
        title,
        redditBody,
        postToPublish.redditSubreddit || "r/webdev",
        creds
      );
      redditStatus = res.success ? `Published (${res.url || "OK"})` : `Failed (${res.message})`;
    }

    // Mark post as Posted
    const allPosts = await getSocialPosts();
    const updatedPosts = allPosts.map((p) =>
      p.id === postToPublish.id
        ? {
            ...p,
            status: "Posted" as const,
            postedAt: new Date().toISOString(),
            scheduledAt: undefined,
          }
        : p
    );
    await saveSocialPosts(updatedPosts);

    const log: AutoPosterLog = {
      timestamp: new Date().toISOString(),
      projectId: postToPublish.miniProjectId || postToPublish.id,
      projectTitle: `[SCHEDULED] ${postToPublish.title}`,
      linkedInStatus,
      redditStatus,
      bannerUrl: postToPublish.imageUrl || "",
      type: "scheduled",
    };

    return { ok: true, log, post: postToPublish, publishedScheduledCount: 1 };
  }

  // 2. SECOND: If no scheduled post was due, execute the standard auto-rotation cycle
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

  // Generate Social Campaign
  const post = await createSocialPost(project, bannerUrl, { status: "Posted" });

  let linkedInStatus = "Skipped (Not Linked)";
  let redditStatus = "Skipped (Not Linked)";

  // Direct Upload to LinkedIn if credentials exist
  if (creds.linkedInAccessToken && creds.linkedInPersonUrn) {
    const res = await publishDirectToLinkedIn(post.linkedInContent, post.vercelUrl, bannerUrl, creds);
    linkedInStatus = res.success ? `Published (ID: ${res.id || "OK"})` : `Failed (${res.message})`;
  }

  // Direct Upload to Reddit if credentials exist
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

  // Update Auto-Poster Credentials State
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
    type: "auto-rotation",
  };

  return { ok: true, log, post, publishedScheduledCount: 0 };
}
