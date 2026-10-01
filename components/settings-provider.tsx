"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
          try {
            localStorage.setItem("an_live_settings", JSON.stringify(data.settings));
          } catch {}
        }
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
        if (data2.visibility) {
          const mergedVis = { ...DEFAULT_VISIBILITY, ...data2.visibility };
          setSectionVisibility(mergedVis);
          try {
            localStorage.setItem("an_live_sections", JSON.stringify(mergedVis));
          } catch {}
        }
      }
    } catch {}
  };

  useEffect(() => {
    // 1. Instantly check localStorage for live overrides saved by admin
    try {
      const localSettings = localStorage.getItem("an_live_settings");
      if (localSettings) {
        const parsed = JSON.parse(localSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
      const localSections = localStorage.getItem("an_live_sections");
      if (localSections) {
        const parsed = JSON.parse(localSections);
        setSectionVisibility((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}

    // 2. Fetch fresh updates from server
    refreshAll();

    // 3. Listen to live update events from admin in current window
    const handleSettingsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSettings((prev) => ({ ...prev, ...customEvent.detail }));
      }
    };
    const handleSectionsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSectionVisibility((prev) => ({ ...prev, ...customEvent.detail }));
      }
    };
    // 4. Listen to cross-tab updates via storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "an_live_settings" && e.newValue) {
        try {
          setSettings((prev) => ({ ...prev, ...JSON.parse(e.newValue!) }));
        } catch {}
      }
      if (e.key === "an_live_sections" && e.newValue) {
        try {
          setSectionVisibility((prev) => ({ ...prev, ...JSON.parse(e.newValue!) }));
        } catch {}
      }
    };

    window.addEventListener("an-settings-updated", handleSettingsUpdated);
    window.addEventListener("an-sections-updated", handleSectionsUpdated);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("an-settings-updated", handleSettingsUpdated);
      window.removeEventListener("an-sections-updated", handleSectionsUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

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
