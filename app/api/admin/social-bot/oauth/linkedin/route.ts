import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/social-bot/oauth/linkedin
 * Redirects admin to LinkedIn OAuth 2.0 authorization page.
 * Required env vars:
 *   LINKEDIN_CLIENT_ID  — from LinkedIn Developer App
 *   LINKEDIN_CLIENT_SECRET — from LinkedIn Developer App
 */
export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "LINKEDIN_CLIENT_ID not configured in environment variables." },
      { status: 500 }
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.aiwithab.site"}/api/admin/social-bot/oauth/linkedin/callback`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state: "linkedin_oauth_" + Date.now(),
    scope: "openid profile email w_member_social",
  });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}
