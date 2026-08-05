"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { SiteSettings, AboutData } from "@/lib/settings-store";
import type { SkillCategory, ExperienceItem, EducationItem } from "@/data/content";

interface SettingsContextType {
  settings: SiteSettings;
  about: AboutData;
  skills: SkillCategory[];
  experience: ExperienceItem[];
  education: EducationItem[];
  refreshAll: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

interface SettingsProviderProps {
  children: React.ReactNode;
  initialSettings: SiteSettings;
  initialAbout: AboutData;
  initialSkills: SkillCategory[];
  initialExperience: ExperienceItem[];
  initialEducation: EducationItem[];
}

export function SettingsProvider({
  children,
  initialSettings,
  initialAbout,
  initialSkills,
  initialExperience,
  initialEducation,
}: SettingsProviderProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [about, setAbout] = useState<AboutData>(initialAbout);
  const [skills, setSkills] = useState<SkillCategory[]>(initialSkills);
  const [experience, setExperience] = useState<ExperienceItem[]>(initialExperience);
  const [education, setEducation] = useState<EducationItem[]>(initialEducation);

  // Sync state if initial props update from server revalidation
  useEffect(() => {
    if (initialSettings) setSettings(initialSettings);
  }, [initialSettings]);

  useEffect(() => {
    if (initialAbout) setAbout(initialAbout);
  }, [initialAbout]);

  const refreshAll = async () => {
    try {
      const res = await fetch(`/api/admin/settings?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {}
  };

  useEffect(() => {
    refreshAll();
    const handleFocus = () => refreshAll();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        about,
        skills,
        experience,
        education,
        refreshAll,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSiteSettings must be used within a SettingsProvider");
  }
  return ctx;
}
