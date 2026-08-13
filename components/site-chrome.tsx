"use client";

import { AnalyticsTracker } from "@/components/analytics-tracker";
import { Chatbot } from "@/components/chatbot";
import { CustomCursor } from "@/components/effects/custom-cursor";
import {
  BackgroundThemeProvider,
  BackgroundThemeRenderer,
} from "@/components/effects/background-theme-provider";
import { ThemeModeProvider } from "@/components/effects/theme-mode-provider";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { usePathname } from "next/navigation";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isResume = pathname === "/resume";

  if (isAdmin || isResume) {
    return <>{children}</>;
  }

  return (
    <ThemeModeProvider>
      <BackgroundThemeProvider>
        <div className="relative min-h-screen transition-colors duration-500">
          <AnalyticsTracker />
          <BackgroundThemeRenderer />
          <CustomCursor />
          <Navbar />
          <main className="relative z-10">{children}</main>
          <Footer />
          <Chatbot />
        </div>
      </BackgroundThemeProvider>
    </ThemeModeProvider>
  );
}
