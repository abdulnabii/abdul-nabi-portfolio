import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { categorizeCookie, CookieCategory } from "@/lib/cookies";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface ServerCookieInfo {
  name: string;
  value: string;
  category: CookieCategory;
  description: string;
  provider: string;
  size: number;
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: only admin can inspect server cookies" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    const summary: Record<CookieCategory, number> = {
      essential: 0,
      functional: 0,
      analytics: 0,
      other: 0,
    };

    // Sensitive authentication / security cookies that must NEVER be exposed publicly
    const SENSITIVE_COOKIE_NAMES = new Set(["an_admin_session", "admin_session", "session", "token", "auth_token"]);

    // Filter out sensitive admin and authentication tokens completely
    const publicCookies = allCookies.filter(
      (c) => !SENSITIVE_COOKIE_NAMES.has(c.name.toLowerCase()) && !c.name.toLowerCase().includes("admin")
    );

    const cookieList: ServerCookieInfo[] = publicCookies.map((c) => {
      const { category, description, provider } = categorizeCookie(c.name);
      summary[category] = (summary[category] || 0) + 1;

      // Calculate approximate size in bytes
      const rawString = `${c.name}=${c.value}`;
      const size = new Blob([rawString]).size;

      return {
        name: c.name,
        value: c.value,
        category,
        description,
        provider,
        size,
      };
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      total: cookieList.length,
      summary,
      cookies: cookieList,
    });
  } catch (error) {
    console.error("[/api/cookies] Failed to fetch cookies:", error);
    return NextResponse.json(
      { success: false, error: "Failed to inspect server cookies" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: only admin can modify cookies" },
        { status: 401 }
      );
    }

    const { name } = await request.json().catch(() => ({ name: "" }));
    const cookieStore = await cookies();

    if (name) {
      if (name === "an_admin_session") {
        return NextResponse.json(
          { success: false, error: "Cannot delete essential security session cookie via public endpoint" },
          { status: 403 }
        );
      }
      cookieStore.delete(name);
      return NextResponse.json({ success: true, message: `Cookie '${name}' cleared` });
    }

    // Delete non-essential cookies
    const allCookies = cookieStore.getAll();
    let deletedCount = 0;
    for (const c of allCookies) {
      const { category } = categorizeCookie(c.name);
      if (category !== "essential") {
        cookieStore.delete(c.name);
        deletedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${deletedCount} non-essential cookies`,
      deletedCount,
    });
  } catch (error) {
    console.error("[/api/cookies] Delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete cookies" },
      { status: 500 }
    );
  }
}
