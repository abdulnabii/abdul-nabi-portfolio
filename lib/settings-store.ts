import { siteContent, SkillCategory, ExperienceItem, EducationItem } from "@/data/content";
import { supabaseDbQuery, supabaseDbUpsert } from "./supabase";

export interface SiteSettings {
  fullName: string;
  location: string;
  availabilityText: string;
  heroTagline: string;
  heroDescription: string;
  responseTime: string;
  githubUrl: string;
  linkedinUrl: string;
  whatsapp: string;
  email: string;
  phone: string;
  cvUrl?: string;
}

export interface AboutData {
  title: string;
  paragraphs: string[];
  stats: { label: string; value: string }[];
}

const DEFAULT_SETTINGS: SiteSettings = {
  fullName: "Abdul Nabi",
  location: "Larkana, Sindh, Pakistan",
  availabilityText: "Open to full-time engineering / security roles and focused freelance projects",
  heroTagline: "I build secure web applications and design clean, robust product interfaces.",
  heroDescription: "Full-Stack Developer with AppSec Focus. 1+ years experience building production Next.js, Supabase, and TypeScript systems.",
  responseTime: "Typical response time: 1–2 business days",
  githubUrl: "https://github.com/abdulnabii",
  linkedinUrl: "https://linkedin.com/in/abdul-nabi-95391a3b0",
  whatsapp: "+92 309 3751434",
  email: "abdulnabi.khaskhely@gmail.com",
  phone: "0333 7597315",
  cvUrl: "/ab_resume.pdf",
};

let memorySettings: SiteSettings = { ...DEFAULT_SETTINGS };
let memoryAbout: AboutData = { ...siteContent.about };
let memorySkills: SkillCategory[] = [...siteContent.skills];
let memoryExperience: ExperienceItem[] = [...siteContent.experience];
let memoryEducation: EducationItem[] = [...siteContent.education];

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*");
  if (rows && rows.length > 0) {
    const fetched: Partial<SiteSettings> = {};
    rows.forEach((r) => {
      if (r.key in DEFAULT_SETTINGS) {
        (fetched as any)[r.key] = r.value;
      }
    });
    return { ...DEFAULT_SETTINGS, ...memorySettings, ...fetched };
  }
  return memorySettings;
}

export async function saveSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  memorySettings = { ...memorySettings, ...updates };

  const records = Object.entries(updates).map(([key, value]) => ({
    key,
    value: String(value ?? ""),
    updated_at: new Date().toISOString(),
  }));

  if (records.length > 0) {
    await supabaseDbUpsert("site_settings", records);
  }

  return memorySettings;
}

// About Data Store
export async function getAboutData(): Promise<AboutData> {
  const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.about_data");
  if (rows && rows.length > 0 && rows[0].value) {
    try {
      const parsed = JSON.parse(rows[0].value) as AboutData;
      return { ...memoryAbout, ...parsed };
    } catch {}
  }
  return memoryAbout;
}

export async function saveAboutData(about: AboutData): Promise<AboutData> {
  memoryAbout = { ...about };
  await supabaseDbUpsert("site_settings", [{
    key: "about_data",
    value: JSON.stringify(about),
    updated_at: new Date().toISOString(),
  }]);
  return memoryAbout;
}

// Skills Data Store
export async function getSkillsData(): Promise<SkillCategory[]> {
  const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.skills_data");
  if (rows && rows.length > 0 && rows[0].value) {
    try {
      const parsed = JSON.parse(rows[0].value) as SkillCategory[];
      return parsed;
    } catch {}
  }
  return memorySkills;
}

export async function saveSkillsData(skills: SkillCategory[]): Promise<SkillCategory[]> {
  memorySkills = [...skills];
  await supabaseDbUpsert("site_settings", [{
    key: "skills_data",
    value: JSON.stringify(skills),
    updated_at: new Date().toISOString(),
  }]);
  return memorySkills;
}

// Experience Data Store
export async function getExperienceData(): Promise<ExperienceItem[]> {
  const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.experience_data");
  if (rows && rows.length > 0 && rows[0].value) {
    try {
      const parsed = JSON.parse(rows[0].value) as ExperienceItem[];
      return parsed;
    } catch {}
  }
  return memoryExperience;
}

export async function saveExperienceData(experience: ExperienceItem[]): Promise<ExperienceItem[]> {
  memoryExperience = [...experience];
  await supabaseDbUpsert("site_settings", [{
    key: "experience_data",
    value: JSON.stringify(experience),
    updated_at: new Date().toISOString(),
  }]);
  return memoryExperience;
}

// Education Data Store
export async function getEducationData(): Promise<EducationItem[]> {
  const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.education_data");
  if (rows && rows.length > 0 && rows[0].value) {
    try {
      const parsed = JSON.parse(rows[0].value) as EducationItem[];
      return parsed;
    } catch {}
  }
  return memoryEducation;
}

export async function saveEducationData(education: EducationItem[]): Promise<EducationItem[]> {
  memoryEducation = [...education];
  await supabaseDbUpsert("site_settings", [{
    key: "education_data",
    value: JSON.stringify(education),
    updated_at: new Date().toISOString(),
  }]);
  return memoryEducation;
}
