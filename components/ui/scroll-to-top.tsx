"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 350);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top of page"
      className={cn(
        "fixed bottom-24 right-7 sm:bottom-26 sm:right-8 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#080d24]/90 text-slate-300 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-indigo-400/50 hover:bg-[#0e163d] hover:text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.35)] active:scale-95 print:hidden",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100 scale-100"
          : "pointer-events-none translate-y-3 opacity-0 scale-90"
      )}
    >
      <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
    </button>
  );
}
