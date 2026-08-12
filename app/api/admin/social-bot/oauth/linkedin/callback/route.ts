import { NextRequest, NextResponse } from "next/server";
import {
  getSocialCredentials,
  saveSocialCredentials,
  fetchLinkedInPersonUrn,
} from "@/lib/social-credentials-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/social-bot/oauth/linkedin/callback
 * Handles LinkedIn OAuth 2.0 authorization code callback.
 * Exchanges code for access token, fetches Person URN, saves to Supabase.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.aiwithab.site";
  const adminUrl = `${siteUrl}/admin/social-bot`;

  // ── Handle OAuth errors from LinkedIn ───────────────────────────────────────
  if (error) {
    const msg = encodeURIComponent(
      `LinkedIn OAuth Error: ${error} — ${errorDescription || "Authorization was denied."}`
    );
    return NextResponse.redirect(`${adminUrl}?oauth_error=${msg}`);
  }

  if (!code) {
    return NextResponse.redirect(
      `${adminUrl}?oauth_error=${encodeURIComponent("No authorization code received from LinkedIn.")}`
    );
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${adminUrl}?oauth_error=${encodeURIComponent("LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET not configured in Vercel environment variables.")}`
    );
  }

  const redirectUri = `${siteUrl}/api/admin/social-bot/oauth/linkedin/callback`;

  // ── Exchange authorization code for access token ─────────────────────────
  try {
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      const errMsg = tokenData.error_description || tokenData.error || `Token exchange failed (HTTP ${tokenRes.status})`;
      return NextResponse.redirect(
        `${adminUrl}?oauth_error=${encodeURIComponent(errMsg)}`
      );
    }

    const accessToken: string = tokenData.access_token;
    const expiresIn: number = tokenData.expires_in || 5183944; // ~60 days

    // ── Fetch Person URN ───────────────────────────────────────────────────────
    let personUrn: string | null = null;
    let linkedInName: string = "";

    // Try /v2/me
    const meRes = await fetch("https://api.linkedin.com/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (meRes.ok) {
      const meData = await meRes.json();
      personUrn = `urn:li:person:${meData.id}`;
      linkedInName = [meData.localizedFirstName, meData.localizedLastName]
        .filter(Boolean)
        .join(" ");
    }

    // Fallback: /v2/userinfo (OpenID Connect)
    if (!personUrn) {
      const uiRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (uiRes.ok) {
        const uiData = await uiRes.json();
        personUrn = `urn:li:person:${uiData.sub}`;
        linkedInName = uiData.name || uiData.email || "Abdul Nabi";
      }
    }

    if (!personUrn) {
      personUrn = await fetchLinkedInPersonUrn(accessToken);
    }

    // ── Save to Supabase ───────────────────────────────────────────────────────
    const existing = await getSocialCredentials();
    await saveSocialCredentials({
      ...existing,
      linkedInAccessToken: accessToken,
      linkedInPersonUrn: personUrn || undefined,
    });

    // ── Redirect back to admin with success ────────────────────────────────────
    const successMsg = encodeURIComponent(
      `✅ LinkedIn connected! Signed in as ${linkedInName || personUrn}. Token valid for ${Math.floor(expiresIn / 86400)} days.`
    );
    return NextResponse.redirect(`${adminUrl}?oauth_success=${successMsg}`);
  } catch (err: any) {
    console.error("[linkedin-oauth-callback]", err);
    return NextResponse.redirect(
      `${adminUrl}?oauth_error=${encodeURIComponent(err.message || "Unexpected error during OAuth flow.")}`
    );
  }
}
