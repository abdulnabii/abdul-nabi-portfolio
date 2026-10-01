"use client";

import React from "react";
import { useSiteSettings } from "@/components/settings-provider";
import type { SectionVisibility } from "@/lib/settings-store";

interface SectionVisibilityGateProps {
  sectionKey: keyof SectionVisibility;
  children: React.ReactNode;
}

export function SectionVisibilityGate({
  sectionKey,
  children,
}: SectionVisibilityGateProps) {
  const { sectionVisibility } = useSiteSettings();

  if (sectionVisibility && sectionVisibility[sectionKey] === false) {
    return null;
  }

  return <>{children}</>;
}
