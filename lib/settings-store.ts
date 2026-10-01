import { siteContent, SkillCategory, ExperienceItem, EducationItem } from "@/data/content";
import seedTestimonials from "@/data/testimonials.json";
import seedCertifications from "@/data/certifications.json";
import { supabaseDbQuery, supabaseDbUpsert } from "./supabase";
import fs from "fs";
import path from "path";
import os from "os";

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
  calendlyUrl?: string;
  announcementBarActive?: boolean | string;
  announcementBarText?: string;
}

export interface AboutData {
  title: string;
  paragraphs: string[];
  stats: { label: string; value: string }[];
}

export interface SectionVisibility {
  hero: boolean;
  about: boolean;
  skills: boolean;
  projects: boolean;
  miniProjects?: boolean;
  experience: boolean;
  education: boolean;
  certifications?: boolean;
  achievements: boolean;
  process?: boolean;
  testimonials?: boolean;
  games: boolean;
  blog: boolean;
  contact: boolean;
  themeToggle?: boolean;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: string;
  color: string;
  category: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  quote: string;
  project: string;
  platform: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  badge: string;
  color: string;
  credentialUrl?: string;
  skills: string[];
}

const DEFAULT_SETTINGS: SiteSettings = {
  fullName: "Abdul Nabi",
  location: "Karachi, Sindh, Pakistan",
  availabilityText: "Open to full-time engineering / security roles and focused freelance projects",
  heroTagline: "I build secure web applications and design clean, robust product interfaces.",
  heroDescription: "Full-Stack Developer with 2+ years of hands-on experience building production Next.js, Supabase, TypeScript, and ML systems — actively learning AppSec fundamentals.",
  responseTime: "1–2 business days",
  githubUrl: "https://github.com/abdulnabii",
  linkedinUrl: "https://linkedin.com/in/abdul-nabi-95391a3b0",
  whatsapp: "+92 309 3751434",
  email: "abdulnabi@abdulnabi.org",
  phone: "0333 7597315",
  cvUrl: "/ab_resume.pdf",
  calendlyUrl: "https://calendly.com",
  announcementBarActive: false,
  announcementBarText: "🚀 Available for high-impact software engineering roles & freelance projects",
};

const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  hero: true,
  about: true,
  skills: true,
  projects: true,
  miniProjects: true,
  experience: true,
  education: true,
  certifications: true,
  achievements: true,
  process: true,
  testimonials: true,
  games: true,
  blog: true,
  contact: true,
  themeToggle: true,
};

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

// Persistent File Paths
const SETTINGS_PRIMARY_FILE = path.join(process.cwd(), "data", "site-settings.json");
const SETTINGS_TMP_FILE = path.join(os.tmpdir(), "an_site_settings.json");

interface PersistedSiteData {
  settings?: Partial<SiteSettings>;
  about?: AboutData;
  skills?: SkillCategory[];
  experience?: ExperienceItem[];
  education?: EducationItem[];
  sectionVisibility?: Partial<SectionVisibility>;
  achievements?: AchievementItem[];
  testimonials?: TestimonialItem[];
  certifications?: CertificationItem[];
}

function loadPersistedData(): PersistedSiteData {
  // 1. Try tmp file (contains latest runtime updates in serverless instances)
  try {
    if (fs.existsSync(SETTINGS_TMP_FILE)) {
      const raw = fs.readFileSync(SETTINGS_TMP_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch {}

  // 2. Try primary repo file
  try {
    if (fs.existsSync(SETTINGS_PRIMARY_FILE)) {
      const raw = fs.readFileSync(SETTINGS_PRIMARY_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch {}

  return {};
}

function persistData(update: Partial<PersistedSiteData>) {
  const current = loadPersistedData();
  const merged: PersistedSiteData = {
    ...current,
    ...update,
  };

  const jsonStr = JSON.stringify(merged, null, 2);

  // 1. Always write to tmp file
  try {
    fs.writeFileSync(SETTINGS_TMP_FILE, jsonStr, "utf-8");
  } catch (err) {
    console.warn("[settings-store] Failed to write to tmp file:", err);
  }

  // 2. Also write to primary repo file if writable (local dev / build)
  try {
    const dir = path.dirname(SETTINGS_PRIMARY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_PRIMARY_FILE, jsonStr, "utf-8");
  } catch {
    // Read-only serverless lambdas catch gracefully
  }
}

// In-Memory state caches
let memorySettings: SiteSettings = { ...DEFAULT_SETTINGS };
let memoryAbout: AboutData = { ...siteContent.about };
let memorySkills: SkillCategory[] = [...siteContent.skills];
let memoryExperience: ExperienceItem[] = [...siteContent.experience];
let memoryEducation: EducationItem[] = [...siteContent.education];
let memorySectionVisibility: SectionVisibility = { ...DEFAULT_SECTION_VISIBILITY };
let memoryAchievements: AchievementItem[] = [...DEFAULT_ACHIEVEMENTS];
let memoryTestimonials: TestimonialItem[] = [...(seedTestimonials as TestimonialItem[])];
let memoryCertifications: CertificationItem[] = [...(seedCertifications as CertificationItem[])];

// ─── Site Settings ─────────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings> {
  const persisted = loadPersistedData();
  const baseSettings: SiteSettings = {
    ...DEFAULT_SETTINGS,
    ...(persisted.settings || {}),
    ...memorySettings,
  };

  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*");
    if (rows && rows.length > 0) {
      const fetched: Partial<SiteSettings> = {};
      rows.forEach((r) => {
        if (r.key in DEFAULT_SETTINGS) {
          (fetched as any)[r.key] = r.value;
        }
      });
      const finalSettings = { ...baseSettings, ...fetched };
      memorySettings = finalSettings;
      return finalSettings;
    }
  } catch (err) {
    // Supabase 402 quota restriction or error - safely use durable local settings
  }

  return baseSettings;
}

export async function saveSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const merged: SiteSettings = { ...current, ...updates };
  memorySettings = merged;

  persistData({ settings: merged });

  try {
    const records = Object.entries(updates).map(([key, value]) => ({
      key,
      value: String(value ?? ""),
      updated_at: new Date().toISOString(),
    }));

    if (records.length > 0) {
      await supabaseDbUpsert("site_settings", records);
    }
  } catch (err) {
    // Gracefully handle Supabase restriction
  }

  return merged;
}

// ─── About Data Store ─────────────────────────────────────────────────────────

export async function getAboutData(): Promise<AboutData> {
  const persisted = loadPersistedData();
  const base = persisted.about || memoryAbout;

  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.about_data");
    if (rows && rows.length > 0 && rows[0].value) {
      const parsed = JSON.parse(rows[0].value) as AboutData;
      memoryAbout = parsed;
      return parsed;
    }
  } catch (err) {
    // Fallback to local
  }

  return base;
}

export async function saveAboutData(about: AboutData): Promise<AboutData> {
  memoryAbout = { ...about };
  persistData({ about });

  try {
    await supabaseDbUpsert("site_settings", [{
      key: "about_data",
      value: JSON.stringify(about),
      updated_at: new Date().toISOString(),
    }]);
  } catch (err) {
    // Fallback
  }

  return memoryAbout;
}

// ─── Skills Data Store ────────────────────────────────────────────────────────

export async function getSkillsData(): Promise<SkillCategory[]> {
  const persisted = loadPersistedData();
  const base = persisted.skills || memorySkills;

  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.skills_data");
    if (rows && rows.length > 0 && rows[0].value) {
      const parsed = JSON.parse(rows[0].value) as SkillCategory[];
      memorySkills = parsed;
      return parsed;
    }
  } catch (err) {
    // Fallback
  }

  return base;
}

export async function saveSkillsData(skills: SkillCategory[]): Promise<SkillCategory[]> {
  memorySkills = [...skills];
  persistData({ skills });

  try {
    await supabaseDbUpsert("site_settings", [{
      key: "skills_data",
      value: JSON.stringify(skills),
      updated_at: new Date().toISOString(),
    }]);
  } catch (err) {
    // Fallback
  }

  return memorySkills;
}

// ─── Experience Data Store ────────────────────────────────────────────────────

export async function getExperienceData(): Promise<ExperienceItem[]> {
  const persisted = loadPersistedData();
  const base = persisted.experience || memoryExperience;

  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.experience_data");
    if (rows && rows.length > 0 && rows[0].value) {
      const parsed = JSON.parse(rows[0].value) as ExperienceItem[];
      memoryExperience = parsed;
      return parsed;
    }
  } catch (err) {
    // Fallback
  }

  return base;
}

export async function saveExperienceData(experience: ExperienceItem[]): Promise<ExperienceItem[]> {
  memoryExperience = [...experience];
  persistData({ experience });

  try {
    await supabaseDbUpsert("site_settings", [{
      key: "experience_data",
      value: JSON.stringify(experience),
      updated_at: new Date().toISOString(),
    }]);
  } catch (err) {
    // Fallback
  }

  return memoryExperience;
}

// ─── Education Data Store ─────────────────────────────────────────────────────

export async function getEducationData(): Promise<EducationItem[]> {
  const persisted = loadPersistedData();
  const base = persisted.education || memoryEducation;

  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.education_data");
    if (rows && rows.length > 0 && rows[0].value) {
      const parsed = JSON.parse(rows[0].value) as EducationItem[];
      memoryEducation = parsed;
      return parsed;
    }
  } catch (err) {
    // Fallback
  }

  return base;
}

export async function saveEducationData(education: EducationItem[]): Promise<EducationItem[]> {
  memoryEducation = [...education];
  persistData({ education });

  try {
    await supabaseDbUpsert("site_settings", [{
      key: "education_data",
      value: JSON.stringify(education),
      updated_at: new Date().toISOString(),
    }]);
  } catch (err) {
    // Fallback
  }

  return memoryEducation;
}

// ─── Section Visibility ───────────────────────────────────────────────────────

export async function getSectionVisibility(): Promise<SectionVisibility> {
  const persisted = loadPersistedData();
  const base: SectionVisibility = {
    ...DEFAULT_SECTION_VISIBILITY,
    ...(persisted.sectionVisibility || {}),
    ...memorySectionVisibility,
  };

  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.section_visibility");
    if (rows && rows.length > 0 && rows[0].value) {
      const parsed = JSON.parse(rows[0].value) as Partial<SectionVisibility>;
      const finalVis = { ...DEFAULT_SECTION_VISIBILITY, ...base, ...parsed };
      memorySectionVisibility = finalVis;
      return finalVis;
    }
  } catch (err) {
    // Fallback
  }

  return base;
}

export async function saveSectionVisibility(visibility: Partial<SectionVisibility>): Promise<SectionVisibility> {
  const current = await getSectionVisibility();
  const merged: SectionVisibility = { ...current, ...visibility };
  memorySectionVisibility = merged;
  persistData({ sectionVisibility: merged });

  try {
    await supabaseDbUpsert("site_settings", [{
      key: "section_visibility",
      value: JSON.stringify(merged),
      updated_at: new Date().toISOString(),
    }]);
  } catch (err) {
    // Fallback
  }

  return merged;
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export async function getAchievements(): Promise<AchievementItem[]> {
  const persisted = loadPersistedData();
  const base = persisted.achievements || memoryAchievements;

  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.achievements_data");
    if (rows && rows.length > 0 && rows[0].value) {
      return JSON.parse(rows[0].value) as AchievementItem[];
    }
  } catch (err) {
    // Fallback
  }

  return base;
}

export async function saveAchievements(achievements: AchievementItem[]): Promise<AchievementItem[]> {
  memoryAchievements = [...achievements];
  persistData({ achievements });

  try {
    await supabaseDbUpsert("site_settings", [{
      key: "achievements_data",
      value: JSON.stringify(achievements),
      updated_at: new Date().toISOString(),
    }]);
  } catch (err) {
    // Fallback
  }

  return memoryAchievements;
}

// ─── Testimonials ───────────────────────────────────────────────────────────

export async function getTestimonials(): Promise<TestimonialItem[]> {
  const persisted = loadPersistedData();
  const base = persisted.testimonials || memoryTestimonials;

  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.testimonials_data");
    if (rows && rows.length > 0 && rows[0].value) {
      return JSON.parse(rows[0].value) as TestimonialItem[];
    }
  } catch (err) {
    // Fallback
  }

  return base;
}

export async function saveTestimonials(testimonials: TestimonialItem[]): Promise<TestimonialItem[]> {
  memoryTestimonials = [...testimonials];
  persistData({ testimonials });

  try {
    await supabaseDbUpsert("site_settings", [{
      key: "testimonials_data",
      value: JSON.stringify(testimonials),
      updated_at: new Date().toISOString(),
    }]);
  } catch (err) {
    // Fallback
  }

  return memoryTestimonials;
}

// ─── Certifications ─────────────────────────────────────────────────────────

export async function getCertifications(): Promise<CertificationItem[]> {
  const persisted = loadPersistedData();
  const base = persisted.certifications || memoryCertifications;

  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>("site_settings", "select=*&key=eq.certifications_data");
    if (rows && rows.length > 0 && rows[0].value) {
      return JSON.parse(rows[0].value) as CertificationItem[];
    }
  } catch (err) {
    // Fallback
  }

  return base;
}

export async function saveCertifications(certifications: CertificationItem[]): Promise<CertificationItem[]> {
  memoryCertifications = [...certifications];
  persistData({ certifications });

  try {
    await supabaseDbUpsert("site_settings", [{
      key: "certifications_data",
      value: JSON.stringify(certifications),
      updated_at: new Date().toISOString(),
    }]);
  } catch (err) {
    // Fallback
  }

  return memoryCertifications;
}
