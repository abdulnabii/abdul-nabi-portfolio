import { getAnalyticsSummary } from "@/lib/analytics-store";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const summary = await getAnalyticsSummary();
    return NextResponse.json(summary);
  } catch (err) {
    console.error("Analytics summary error:", err);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
