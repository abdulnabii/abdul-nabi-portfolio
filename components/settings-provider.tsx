"use client";

import React, { createContext, useContext, useState } from "react";
import type { SiteSettings, AboutData, SectionVisibility } from "@/lib/settings-store";
import type { SkillCategory, ExperienceItem, EducationItem } from "@/data/content";

interface SettingsContextType {
  settings: SiteSettings;
  about: AboutData;
  skills: SkillCategory[];
  experience: ExperienceItem[];
  education: EducationItem[];
  sectionVisibility: SectionVisibility;
  refreshAll: () => Promise<void>;
}

const DEFAULT_VISIBILITY: SectionVisibility = {
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

const SettingsContext = createContext<SettingsContextType | null>(null);

interface SettingsProviderProps {
  children: React.ReactNode;
  initialSettings: SiteSettings;
  initialAbout: AboutData;
  initialSkills: SkillCategory[];
  initialExperience: ExperienceItem[];
  initialEducation: EducationItem[];
  initialSectionVisibility: SectionVisibility;
}

export function SettingsProvider({
  children,
  initialSettings,
  initialAbout,
  initialSkills,
  initialExperience,
  initialEducation,
  initialSectionVisibility,
}: SettingsProviderProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [about, setAbout] = useState<AboutData>(initialAbout);
  const [skills, setSkills] = useState<SkillCategory[]>(initialSkills);
  const [experience, setExperience] = useState<ExperienceItem[]>(initialExperience);
  const [education, setEducation] = useState<EducationItem[]>(initialEducation);
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>(
    initialSectionVisibility ?? DEFAULT_VISIBILITY
  );

  const refreshAll = async () => {
    try {
      const res = await fetch(`/api/admin/settings?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (data.about) setAbout(data.about);
        if (data.skills) setSkills(data.skills);
        if (data.experience) setExperience(data.experience);
        if (data.education) setEducation(data.education);
      }
    } catch {}
    try {
      const res2 = await fetch(`/api/admin/sections?t=${Date.now()}`, { cache: "no-store" });
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2.visibility) setSectionVisibility({ ...DEFAULT_VISIBILITY, ...data2.visibility });
      }
    } catch {}
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        about,
        skills,
        experience,
        education,
        sectionVisibility,
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
