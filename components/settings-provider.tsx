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

  // Sync client-side localStorage overrides if saved locally
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const localSet = localStorage.getItem("an_site_settings");
        if (localSet) setSettings(JSON.parse(localSet));

        const localAbout = localStorage.getItem("an_about_data");
        if (localAbout) setAbout(JSON.parse(localAbout));

        const localSkills = localStorage.getItem("an_skills_data");
        if (localSkills) setSkills(JSON.parse(localSkills));

        const localExp = localStorage.getItem("an_experience_data");
        if (localExp) setExperience(JSON.parse(localExp));

        const localEdu = localStorage.getItem("an_education_data");
        if (localEdu) setEducation(JSON.parse(localEdu));
      } catch {}
    }
  }, []);

  const refreshAll = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
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
