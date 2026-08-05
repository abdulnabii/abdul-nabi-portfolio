import { getAdminSession } from "@/lib/auth";
import {
  getSiteSettings,
  saveSiteSettings,
  getAboutData,
  getSkillsData,
  getExperienceData,
  getEducationData,
} from "@/lib/settings-store";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const settings = await getSiteSettings();
  const about = await getAboutData();
  const skills = await getSkillsData();
  const experience = await getExperienceData();
  const education = await getEducationData();

  return NextResponse.json({
    settings,
    about,
    skills,
    experience,
    education,
  });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await saveSiteSettings(body);

    revalidatePath("/", "layout");
    revalidatePath("/about", "layout");
    revalidatePath("/contact", "layout");
    revalidatePath("/admin/settings", "layout");

    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    console.error("Save settings error:", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
