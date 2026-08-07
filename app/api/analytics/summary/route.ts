import { getAnalyticsSummary } from "@/lib/analytics-store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";

    const summary = await getAnalyticsSummary(range);

    return NextResponse.json(summary, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (err) {
    console.error("Analytics summary error:", err);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
