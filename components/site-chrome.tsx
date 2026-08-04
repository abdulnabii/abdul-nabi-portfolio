"use client";

import { AnalyticsTracker } from "@/components/analytics-tracker";
import { Chatbot } from "@/components/chatbot";
import { CustomCursor } from "@/components/effects/custom-cursor";
import { AnimatedGlassBackground } from "@/components/effects/animated-glass-background";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { usePathname } from "next/navigation";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      <AnalyticsTracker />
      <AnimatedGlassBackground />
      <CustomCursor />
      <Navbar />
      <main className="relative z-10">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
}
