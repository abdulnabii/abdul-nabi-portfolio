import { supabaseDbQuery, supabaseDbUpsert } from "./supabase";

export interface SiteSettings {
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

const DEFAULT_SETTINGS: SiteSettings = {
  availabilityText: "Open to full-time engineering / security roles and focused freelance projects",
  heroTagline: "I build secure web applications and design clean, robust product interfaces.",
  heroDescription: "Full-Stack Developer with AppSec Focus based in Karachi, Pakistan. 1+ years experience building production Next.js, Supabase, and TypeScript systems.",
  responseTime: "Usually responds within 24 hours.",
  githubUrl: "https://github.com/abdulnabii",
  linkedinUrl: "https://linkedin.com/in/abdul-nabi-95391a3b0",
  whatsapp: "+92 309 3751434",
  email: "abdulnabi.khaskhely@gmail.com",
  phone: "0333 7597315",
  cvUrl: "/ab_resume.pdf",
};

let memorySettings: SiteSettings = { ...DEFAULT_SETTINGS };

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
