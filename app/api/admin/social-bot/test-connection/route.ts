import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getSocialCredentials,
  fetchLinkedInPersonUrn,
  saveSocialCredentials,
} from "@/lib/social-credentials-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/social-bot/test-connection
 * Validates the LinkedIn access token against LinkedIn's /v2/me endpoint.
 * Returns: { valid: boolean, urn?: string, name?: string, error?: string }
 */
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const creds = await getSocialCredentials();

  if (!creds.linkedInAccessToken) {
    return NextResponse.json({
      valid: false,
      error: "No LinkedIn access token stored. Please add your token in Link Social Accounts.",
    });
  }

  try {
    // Try /v2/me first
    const res1 = await fetch("https://api.linkedin.com/v2/me", {
      headers: { Authorization: `Bearer ${creds.linkedInAccessToken}` },
    });

    if (res1.ok) {
      const data = await res1.json();
      const urn = `urn:li:person:${data.id}`;
      const name = [data.localizedFirstName, data.localizedLastName].filter(Boolean).join(" ");

      // Persist URN if it changed
      if (urn !== creds.linkedInPersonUrn) {
        await saveSocialCredentials({ ...creds, linkedInPersonUrn: urn });
      }

      return NextResponse.json({ valid: true, urn, name });
    }

    // Try /v2/userinfo (OpenID)
    const res2 = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${creds.linkedInAccessToken}` },
    });

    if (res2.ok) {
      const data2 = await res2.json();
      const urn = `urn:li:person:${data2.sub}`;
      const name = data2.name || data2.email || "Unknown";

      if (urn !== creds.linkedInPersonUrn) {
        await saveSocialCredentials({ ...creds, linkedInPersonUrn: urn });
      }

      return NextResponse.json({ valid: true, urn, name });
    }

    const status = res1.status;
    if (status === 401 || status === 403) {
      return NextResponse.json({
        valid: false,
        error: `Token expired or invalid (HTTP ${status}). Please regenerate a new OAuth token from the LinkedIn Developer Portal.`,
      });
    }

    return NextResponse.json({
      valid: false,
      error: `LinkedIn API returned HTTP ${status}. Try regenerating your token.`,
    });
  } catch (err: any) {
    return NextResponse.json({
      valid: false,
      error: err.message || "Network error reaching LinkedIn API.",
    });
  }
}
