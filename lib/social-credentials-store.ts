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
      message: "LinkedIn Access Token Missing. Please add your token in Link Social Accounts.",
    };
  }

  // ── Resolve Person URN if not cached ──────────────────────────────────────
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
      message: "Could not resolve LinkedIn Person URN. Paste your token and click 'Test Connection' in Link Social Accounts — the URN will be auto-fetched.",
    };
  }

  const authorUrn = personUrn.startsWith("urn:li:person:") ? personUrn : `urn:li:person:${personUrn}`;

  // ── Build post text: append article URL & image URL inline ───────────────
  let postText = content;
  if (imageUrl && !postText.includes(imageUrl)) {
    postText = `${postText}\n\n📸 Banner Image: ${imageUrl}`;
  }
  if (articleUrl && !postText.includes(articleUrl)) {
    postText = `${postText}\n\n🔗 Live App: ${articleUrl}`;
  }

  // ── Attempt 1: UGC Posts API (/v2/ugcPosts) — text-only NONE category ─────
  try {
    const ugcPayload = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: postText },
          shareMediaCategory: "NONE",
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

    const data1 = await res1.json().catch(() => ({}));
    console.log("[linkedin] ugcPosts response:", res1.status, JSON.stringify(data1));

    if (res1.ok && data1.id) {
      return {
        success: true,
        message: "✅ Successfully published to LinkedIn feed via ugcPosts!",
        id: data1.id,
      };
    }

    if (res1.status === 401 || res1.status === 403) {
      return {
        success: false,
        message: `LinkedIn Access Token expired or invalid (HTTP ${res1.status}). Please generate a new OAuth token from the LinkedIn Developer Portal → Tools → OAuth Token Generator.`,
      };
    }

    // ── Attempt 2: Modern REST Posts API (/v2/posts) — text-only ─────────────
    const restPayload = {
      author: authorUrn,
      commentary: postText,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
    };

    const res2 = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${c.linkedInAccessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202401",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(restPayload),
    });

    const restId = res2.headers.get("x-restli-id") || res2.headers.get("x-linkedin-id");
    const data2 = await res2.json().catch(() => ({}));
    console.log("[linkedin] rest/posts response:", res2.status, JSON.stringify(data2));

    if ((res2.ok || res2.status === 201) && (data2.id || restId)) {
      return {
        success: true,
        message: "✅ Successfully published to LinkedIn feed via REST posts!",
        id: data2.id || restId || "OK",
      };
    }

    if (res2.status === 401 || res2.status === 403) {
      return {
        success: false,
        message: `LinkedIn Access Token expired or invalid (HTTP ${res2.status}). Please regenerate a fresh token.`,
      };
    }

    // Return the most useful error message from either attempt
    const errMsg =
      data1?.message ||
      data1?.error_description ||
      data2?.message ||
      data2?.error_description ||
      `LinkedIn API returned ${res1.status} / ${res2.status}. Check that your app has the w_member_social scope.`;

    return { success: false, message: `LinkedIn API Error: ${errMsg}` };
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
