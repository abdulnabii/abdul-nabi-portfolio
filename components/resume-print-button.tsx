"use client";

import React, { useEffect } from "react";
import { Download } from "lucide-react";

export function ResumePrintButton() {
  useEffect(() => {
    /**
     * Before print: strip every opacity-0 / translate-y-8 class that the
     * Reveal animation component adds while waiting for IntersectionObserver.
     * IntersectionObserver never fires in a print context, so without this
     * every Reveal-wrapped element would be invisible (opacity: 0) in the PDF.
     *
     * After print: restore the original classes so the page looks normal again.
     */
    const beforePrint = () => {
      // Force every invisible Reveal wrapper to its visible end-state
      document.querySelectorAll(".opacity-0").forEach((el) => {
        el.classList.remove("opacity-0");
        el.classList.add("opacity-100");
        el.setAttribute("data-print-restored", "opacity");
      });
      document.querySelectorAll(".translate-y-8").forEach((el) => {
        el.classList.remove("translate-y-8");
        el.classList.add("translate-y-0");
        el.setAttribute("data-print-restored-transform", "1");
      });
    };

    const afterPrint = () => {
      // Restore original state so animations work normally again
      document.querySelectorAll("[data-print-restored='opacity']").forEach((el) => {
        el.classList.remove("opacity-100");
        el.classList.add("opacity-0");
        el.removeAttribute("data-print-restored");
      });
      document.querySelectorAll("[data-print-restored-transform='1']").forEach((el) => {
        el.classList.remove("translate-y-0");
        el.classList.add("translate-y-8");
        el.removeAttribute("data-print-restored-transform");
      });
    };

    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, []);

  const handlePrint = () => {
    // Run the same beforePrint logic when triggered via button click
    // (some browsers open print dialog without firing beforeprint on click)
    document.querySelectorAll(".opacity-0").forEach((el) => {
      el.classList.remove("opacity-0");
      el.classList.add("opacity-100");
      el.setAttribute("data-print-restored", "opacity");
    });
    document.querySelectorAll(".translate-y-8").forEach((el) => {
      el.classList.remove("translate-y-8");
      el.classList.add("translate-y-0");
      el.setAttribute("data-print-restored-transform", "1");
    });

    // Small delay so the DOM update paints before Chrome captures the print layout
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition cursor-pointer"
    >
      <Download className="h-4 w-4" />
      Print / Save as PDF
    </button>
  );
}
