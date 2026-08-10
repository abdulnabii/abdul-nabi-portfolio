import { supabaseDbQuery, supabaseDbUpsert } from "./supabase";

export interface SocialCredentials {
  linkedInAccessToken?: string;
  linkedInPersonUrn?: string; // e.g. urn:li:person:12345
  redditClientId?: string;
  redditClientSecret?: string;
  redditUsername?: string;
  redditPassword?: string;
  autoApprove?: boolean;
}

let memoryCredentials: SocialCredentials = {};

export async function getSocialCredentials(): Promise<SocialCredentials> {
  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>(
      "site_settings",
      "select=*&key=eq.social_credentials_data"
    );
    if (rows && rows.length > 0 && rows[0].value) {
      const parsed = JSON.parse(rows[0].value) as SocialCredentials;
      if (parsed) {
        memoryCredentials = parsed;
        return memoryCredentials;
      }
    }
  } catch (err) {
    console.error("[getSocialCredentials] Exception:", err);
  }
  return memoryCredentials;
}

export async function saveSocialCredentials(creds: SocialCredentials): Promise<SocialCredentials> {
  try {
    memoryCredentials = { ...creds };
    await supabaseDbUpsert("site_settings", [
      {
        key: "social_credentials_data",
        value: JSON.stringify(creds),
        updated_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error("[saveSocialCredentials] Exception:", err);
  }
  return memoryCredentials;
}

/** Direct API Publishing to LinkedIn REST API */
export async function publishDirectToLinkedIn(
  content: string,
  articleUrl?: string,
  imageUrl?: string,
  creds?: SocialCredentials
): Promise<{ success: boolean; message: string; id?: string }> {
  const c = creds || (await getSocialCredentials());
  if (!c.linkedInAccessToken || !c.linkedInPersonUrn) {
    return {
      success: false,
      message: "LinkedIn Credentials Missing. Please link your LinkedIn Access Token and Person URN in Social Bot Settings.",
    };
  }

  try {
    const authorUrn = c.linkedInPersonUrn.startsWith("urn:li:person:")
      ? c.linkedInPersonUrn
      : `urn:li:person:${c.linkedInPersonUrn}`;

    const bodyPayload = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: articleUrl ? "ARTICLE" : "NONE",
          media: articleUrl
            ? [
                {
                  status: "READY",
                  originalUrl: articleUrl,
                  title: { text: "Abdul Nabi — Portfolio & AI Micro Tools" },
                },
              ]
            : undefined,
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.linkedInAccessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = await res.json();
    if (res.ok && data.id) {
      return { success: true, message: "Successfully published post directly to LinkedIn feed!", id: data.id };
    } else {
      return {
        success: false,
        message: data.message || data.error_description || "LinkedIn API returned an error.",
      };
    }
  } catch (err: any) {
    console.error("publishDirectToLinkedIn error:", err);
    return { success: false, message: err.message || "Failed to publish to LinkedIn." };
  }
}

/** Direct API Publishing to Reddit API */
export async function publishDirectToReddit(
  title: string,
  body: string,
  subreddit: string,
  creds?: SocialCredentials
): Promise<{ success: boolean; message: string; url?: string }> {
  const c = creds || (await getSocialCredentials());
  if (!c.redditClientId || !c.redditClientSecret || !c.redditUsername || !c.redditPassword) {
    return {
      success: false,
      message: "Reddit API Credentials Missing. Please link Client ID, Secret, Username & Password in Social Bot Settings.",
    };
  }

  try {
    // 1. Obtain Reddit OAuth Token
    const authHeader = `Basic ${Buffer.from(`${c.redditClientId}:${c.redditClientSecret}`).toString("base64")}`;
    const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "web:aiwithab-social-bot:v1.0.0 (by /u/" + c.redditUsername + ")",
      },
      body: new URLSearchParams({
        grant_type: "password",
        username: c.redditUsername,
        password: c.redditPassword,
      }).toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return {
        success: false,
        message: tokenData.error || "Failed to authenticate with Reddit API. Check client credentials.",
      };
    }

    const token = tokenData.access_token;
    const subClean = subreddit.replace(/^r\//, "").trim();

    // 2. Submit Post to Reddit
    const postRes = await fetch("https://oauth.reddit.com/api/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "web:aiwithab-social-bot:v1.0.0 (by /u/" + c.redditUsername + ")",
      },
      body: new URLSearchParams({
        sr: subClean,
        kind: "self",
        title: title,
        text: body,
        api_type: "json",
      }).toString(),
    });

    const postData = await postRes.json();
    const errors = postData?.json?.errors;
    if (errors && errors.length > 0) {
      return { success: false, message: `Reddit API Error: ${errors[0][1] || errors[0][0]}` };
    }

    const postUrl = postData?.json?.data?.url;
    return {
      success: true,
      message: `Successfully published post directly to r/${subClean}!`,
      url: postUrl,
    };
  } catch (err: any) {
    console.error("publishDirectToReddit error:", err);
    return { success: false, message: err.message || "Failed to publish to Reddit." };
  }
}
