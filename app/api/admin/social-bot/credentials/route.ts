import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { fetchLinkedInPersonUrn, getSocialCredentials, saveSocialCredentials } from "@/lib/social-credentials-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const creds = await getSocialCredentials();
  return NextResponse.json({ creds });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    // Auto-resolve Person URN if missing
    if (body.linkedInAccessToken && !body.linkedInPersonUrn) {
      const fetchedUrn = await fetchLinkedInPersonUrn(body.linkedInAccessToken);
      if (fetchedUrn) {
        body.linkedInPersonUrn = fetchedUrn;
      }
    }

    const updated = await saveSocialCredentials(body);
    return NextResponse.json({ creds: updated, ok: true });
  } catch (err) {
    console.error("POST /api/admin/social-bot/credentials error:", err);
    return NextResponse.json({ error: "Failed to save credentials" }, { status: 500 });
  }
}
