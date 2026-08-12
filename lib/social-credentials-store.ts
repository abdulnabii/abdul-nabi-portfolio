import { supabaseDbQuery, supabaseDbUpsert } from "./supabase";

export interface SocialCredentials {
  linkedInAccessToken?: string;
  linkedInPersonUrn?: string; // e.g. urn:li:person:12345
  redditClientId?: string;
  redditClientSecret?: string;
  redditUsername?: string;
  redditPassword?: string;
  autoApprove?: boolean;
  autoPosterActive?: boolean;
  autoPosterFrequencyHours?: number;
  lastAutoPostAt?: string;
  nextAutoPostIndex?: number;
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

/** Helper to fetch Person URN using Access Token if missing */
export async function fetchLinkedInPersonUrn(token: string): Promise<string | null> {
  try {
    // Try standard v2/me endpoint
    const res1 = await fetch("https://api.linkedin.com/v2/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res1.ok) {
      const data1 = await res1.json();
      if (data1.id) return `urn:li:person:${data1.id}`;
    }

    // Try OpenID userinfo endpoint
    const res2 = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.sub) return `urn:li:person:${data2.sub}`;
    }
  } catch (e) {
    console.error("fetchLinkedInPersonUrn error:", e);
  }
  return null;
}

/** Direct API Publishing to LinkedIn REST API */
export async function publishDirectToLinkedIn(
  content: string,
  articleUrl?: string,
  imageUrl?: string,
  creds?: SocialCredentials
): Promise<{ success: boolean; message: string; id?: string }> {
  const c = creds || (await getSocialCredentials());
  if (!c.linkedInAccessToken) {
    return {
      success: false,
      message: "LinkedIn Access Token Missing. Please link your LinkedIn Access Token in Social Bot Settings.",
    };
  }

  let personUrn = c.linkedInPersonUrn;
  if (!personUrn) {
    const fetched = await fetchLinkedInPersonUrn(c.linkedInAccessToken);
    if (fetched) {
      personUrn = fetched;
      await saveSocialCredentials({ ...c, linkedInPersonUrn: fetched });
    }
  }

  if (!personUrn) {
    return {
      success: false,
      message: "Could not resolve LinkedIn Person URN. Please enter your LinkedIn Person URN (e.g. urn:li:person:XXXX) in Social Settings.",
    };
  }

  const authorUrn = personUrn.startsWith("urn:li:person:") ? personUrn : `urn:li:person:${personUrn}`;

  // Attempt 1: Standard UGC Posts API (/v2/ugcPosts)
  try {
    const ugcPayload = {
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

    const res1 = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.linkedInAccessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(ugcPayload),
    });

    const data1 = await res1.json();
    if (res1.ok && data1.id) {
      return { success: true, message: "Successfully published post directly to LinkedIn feed!", id: data1.id };
    }

    if (res1.status === 401) {
      return {
        success: false,
        message: "LinkedIn Access Token expired or invalid. Please generate a new OAuth Token in LinkedIn Developer Tools.",
      };
    }

    // Attempt 2: Modern Rest Posts API (/v2/posts)
    const restPayload = {
      author: authorUrn,
      commentary: content,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: articleUrl
        ? {
            article: {
              source: articleUrl,
              title: "Abdul Nabi — Portfolio & AI Micro Tools",
            },
          }
        : undefined,
      lifecycleState: "PUBLISHED",
    };

    const res2 = await fetch("https://api.linkedin.com/v2/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.linkedInAccessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(restPayload),
    });

    const data2 = await res2.json();
    if (res2.ok && (data2.id || res2.headers.get("x-restli-id"))) {
      const postId = data2.id || res2.headers.get("x-restli-id") || "OK";
      return { success: true, message: "Successfully published post directly to LinkedIn feed!", id: postId };
    }

    const errMessage =
      data1.message || data1.error_description || data2.message || data2.error_description || "LinkedIn API error.";
    return { success: false, message: `LinkedIn API Error: ${errMessage}` };
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
