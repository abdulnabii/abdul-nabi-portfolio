import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getSocialCredentials,
  saveSocialCredentials,
} from "@/lib/social-credentials-store";

export const dynamic = "force-dynamic";

async function validateToken(token: string, currentUrn?: string) {
  try {
    // Try /v2/me first
    const res1 = await fetch("https://api.linkedin.com/v2/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res1.ok) {
      const data = await res1.json();
      const urn = `urn:li:person:${data.id}`;
      const name = [data.localizedFirstName, data.localizedLastName].filter(Boolean).join(" ");

      return { valid: true, urn, name };
    }

    // Try /v2/userinfo (OpenID)
    const res2 = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res2.ok) {
      const data2 = await res2.json();
      const urn = `urn:li:person:${data2.sub}`;
      const name = data2.name || data2.email || "LinkedIn User";

      return { valid: true, urn, name };
    }

    const status = res1.status;
    return {
      valid: false,
      error: `Token expired or invalid (HTTP ${status}). Please generate a new token from LinkedIn Developer Tools.`,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: err.message || "Network error reaching LinkedIn API.",
    };
  }
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  let token = searchParams.get("token");

  const creds = await getSocialCredentials();

  if (!token) {
    token = creds.linkedInAccessToken || null;
  }

  if (!token) {
    return NextResponse.json({
      valid: false,
      error: "No LinkedIn access token provided or stored.",
    });
  }

  const result = await validateToken(token);

  if (result.valid && result.urn) {
    // Auto-save verified token and URN
    await saveSocialCredentials({
      ...creds,
      linkedInAccessToken: token,
      linkedInPersonUrn: result.urn,
    });
  }

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const token = body.token;

    if (!token) {
      return NextResponse.json({
        valid: false,
        error: "Please paste your LinkedIn access token in the box first.",
      });
    }

    const result = await validateToken(token);

    if (result.valid && result.urn) {
      const creds = await getSocialCredentials();
      await saveSocialCredentials({
        ...creds,
        linkedInAccessToken: token,
        linkedInPersonUrn: result.urn,
      });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({
      valid: false,
      error: err.message || "Invalid request.",
    });
  }
}
