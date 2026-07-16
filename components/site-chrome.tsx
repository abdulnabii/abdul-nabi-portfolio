"use client";

import { Chatbot } from "@/components/chatbot";
import { CustomCursor } from "@/components/effects/custom-cursor";
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
      <div
        className="pointer-events-none fixed inset-0 bg-grid opacity-40"
        aria-hidden
      />
      <CustomCursor />
      <Navbar />
      <main className="relative z-10">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
}
