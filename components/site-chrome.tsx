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

import { CommandPaletteProvider } from "@/components/command-palette";
import { NowWidget } from "@/components/ui/now-widget";
import { PWAInstaller } from "@/components/ui/pwa-installer";
import { KeyboardShortcutsModal } from "@/components/ui/keyboard-shortcuts-modal";

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
        <CommandPaletteProvider>
          <div className="relative min-h-screen transition-colors duration-500">
            <AnalyticsTracker />
            <BackgroundThemeRenderer />
            <CustomCursor />
            <Navbar />
            <main className="relative z-10">{children}</main>
            <Footer />
            <Chatbot />
            <NowWidget />
            <PWAInstaller />
            <KeyboardShortcutsModal />
          </div>
        </CommandPaletteProvider>
      </BackgroundThemeProvider>
    </ThemeModeProvider>
  );
}
