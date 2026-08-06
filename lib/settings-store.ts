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
  location: "Karachi, Sindh, Pakistan",
  availabilityText: "Open to full-time engineering / security roles and focused freelance projects",
  heroTagline: "I build secure web applications and design clean, robust product interfaces.",
  heroDescription: "Full-Stack Developer with 1+ years experience building production Next.js, Supabase, TypeScript, and ML systems — actively learning AppSec fundamentals.",
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
  try {
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
  } catch (err) {
    console.error("[getSiteSettings] Exception:", err);
  }
  return memorySettings;
}

export async function saveSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  try {
    memorySettings = { ...memorySettings, ...updates };

    const records = Object.entries(updates).map(([key, value]) => ({
      key,
      value: String(value ?? ""),
      updated_at: new Date().toISOString(),
    }));

    if (records.length > 0) {
      await supabaseDbUpsert("site_settings", records);
    }
  } catch (err) {
    console.error("[saveSiteSettings] Exception:", err);
  }
  return memorySettings;
}

// About Data Store
export async function getAboutData(): Promise<AboutData> {
  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.about_data");
    if (rows && rows.length > 0 && rows[0].value) {
      const parsed = JSON.parse(rows[0].value) as AboutData;
      return { ...memoryAbout, ...parsed };
    }
  } catch (err) {
    console.error("[getAboutData] Exception:", err);
  }
  return memoryAbout;
}

export async function saveAboutData(about: AboutData): Promise<AboutData> {
  try {
    memoryAbout = { ...about };
    await supabaseDbUpsert("site_settings", [{
      key: "about_data",
      value: JSON.stringify(about),
      updated_at: new Date().toISOString(),
    }]);
  } catch (err) {
    console.error("[saveAboutData] Exception:", err);
  }
  return memoryAbout;
}

// Skills Data Store
export async function getSkillsData(): Promise<SkillCategory[]> {
  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.skills_data");
    if (rows && rows.length > 0 && rows[0].value) {
      const parsed = JSON.parse(rows[0].value) as SkillCategory[];
      return parsed;
    }
  } catch (err) {
    console.error("[getSkillsData] Exception:", err);
  }
  return memorySkills;
}

export async function saveSkillsData(skills: SkillCategory[]): Promise<SkillCategory[]> {
  try {
    memorySkills = [...skills];
    await supabaseDbUpsert("site_settings", [{
      key: "skills_data",
      value: JSON.stringify(skills),
      updated_at: new Date().toISOString(),
    }]);
  } catch (err) {
    console.error("[saveSkillsData] Exception:", err);
  }
  return memorySkills;
}

// Experience Data Store
export async function getExperienceData(): Promise<ExperienceItem[]> {
  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.experience_data");
    if (rows && rows.length > 0 && rows[0].value) {
      const parsed = JSON.parse(rows[0].value) as ExperienceItem[];
      return parsed;
    }
  } catch (err) {
    console.error("[getExperienceData] Exception:", err);
  }
  return memoryExperience;
}

export async function saveExperienceData(experience: ExperienceItem[]): Promise<ExperienceItem[]> {
  try {
    memoryExperience = [...experience];
    await supabaseDbUpsert("site_settings", [{
      key: "experience_data",
      value: JSON.stringify(experience),
      updated_at: new Date().toISOString(),
    }]);
  } catch (err) {
    console.error("[saveExperienceData] Exception:", err);
  }
  return memoryExperience;
}

// Education Data Store
export async function getEducationData(): Promise<EducationItem[]> {
  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.education_data");
    if (rows && rows.length > 0 && rows[0].value) {
      const parsed = JSON.parse(rows[0].value) as EducationItem[];
      return parsed;
    }
  } catch (err) {
    console.error("[getEducationData] Exception:", err);
  }
  return memoryEducation;
}

export async function saveEducationData(education: EducationItem[]): Promise<EducationItem[]> {
  try {
    memoryEducation = [...education];
    await supabaseDbUpsert("site_settings", [{
      key: "education_data",
      value: JSON.stringify(education),
      updated_at: new Date().toISOString(),
    }]);
  } catch (err) {
    console.error("[saveEducationData] Exception:", err);
  }
  return memoryEducation;
}

// ─── Section Visibility ───────────────────────────────────────────────────────

export interface SectionVisibility {
  hero: boolean;
  about: boolean;
  skills: boolean;
  projects: boolean;
  experience: boolean;
  education: boolean;
  blog: boolean;
  games: boolean;
  achievements: boolean;
  contact: boolean;
}

const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  hero: true,
  about: true,
  skills: true,
  projects: true,
  experience: true,
  education: true,
  blog: true,
  games: true,
  achievements: true,
  contact: true,
};

let memorySectionVisibility: SectionVisibility = { ...DEFAULT_SECTION_VISIBILITY };

export async function getSectionVisibility(): Promise<SectionVisibility> {
  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.section_visibility");
    if (rows && rows.length > 0 && rows[0].value) {
      const parsed = JSON.parse(rows[0].value) as Partial<SectionVisibility>;
      return { ...DEFAULT_SECTION_VISIBILITY, ...parsed };
    }
  } catch (err) {
    console.error("[getSectionVisibility] Exception:", err);
  }
  return memorySectionVisibility;
}

export async function saveSectionVisibility(visibility: Partial<SectionVisibility>): Promise<SectionVisibility> {
  try {
    memorySectionVisibility = { ...memorySectionVisibility, ...visibility };
    await supabaseDbUpsert("site_settings", [{
      key: "section_visibility",
      value: JSON.stringify(memorySectionVisibility),
      updated_at: new Date().toISOString(),
    }]);
  } catch (err) {
    console.error("[saveSectionVisibility] Exception:", err);
  }
  return memorySectionVisibility;
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: string;
  color: string;
  category: string;
}

const DEFAULT_ACHIEVEMENTS: AchievementItem[] = [
  { id: "1", title: "FYP Completed", description: "Delivered Blood Sugar Tracker ML system as Final Year Project using Flask & scikit-learn", icon: "🎓", date: "2024", color: "indigo", category: "Academic" },
  { id: "2", title: "First Production Deployment", description: "Shipped first full-stack Next.js + Supabase app to Vercel with live users", icon: "🚀", date: "2024", color: "violet", category: "Dev" },
  { id: "3", title: "GitHub Streak", description: "Maintained consistent GitHub contribution streak across multiple repositories", icon: "🔥", date: "2024", color: "orange", category: "Dev" },
  { id: "4", title: "Full-Stack Stack Mastered", description: "Proficient in Next.js, TypeScript, Supabase, TailwindCSS, PostgreSQL end-to-end", icon: "⚡", date: "2024", color: "cyan", category: "Skills" },
  { id: "5", title: "AppSec Learning Journey", description: "Actively studying Application Security — OWASP Top 10, authentication, and threat modeling", icon: "🛡️", date: "2025", color: "emerald", category: "Learning" },
  { id: "6", title: "ML Model Shipped", description: "Built and deployed ElasticNet regression model predicting glucose levels with real accuracy", icon: "🧠", date: "2024", color: "purple", category: "ML" },
  { id: "7", title: "Portfolio Launched", description: "Built premium portfolio with admin CMS, real-time DB, AI chatbot, and mini games", icon: "🌟", date: "2025", color: "yellow", category: "Dev" },
  { id: "8", title: "Open Source Contributor", description: "Published projects on GitHub with clean READMEs and documentation", icon: "💻", date: "2024", color: "blue", category: "Dev" },
];

let memoryAchievements: AchievementItem[] = [...DEFAULT_ACHIEVEMENTS];

export async function getAchievements(): Promise<AchievementItem[]> {
  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.achievements_data");
    if (rows && rows.length > 0 && rows[0].value) {
      return JSON.parse(rows[0].value) as AchievementItem[];
    }
  } catch (err) {
    console.error("[getAchievements] Exception:", err);
  }
  return memoryAchievements;
}

export async function saveAchievements(achievements: AchievementItem[]): Promise<AchievementItem[]> {
  try {
    memoryAchievements = [...achievements];
    await supabaseDbUpsert("site_settings", [{
      key: "achievements_data",
      value: JSON.stringify(achievements),
      updated_at: new Date().toISOString(),
    }]);
  } catch (err) {
    console.error("[saveAchievements] Exception:", err);
  }
  return memoryAchievements;
}
