"use client";

import React from "react";
import { Download } from "lucide-react";

export function ResumePrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition cursor-pointer"
    >
      <Download className="h-4 w-4" />
      Print / Save as PDF
    </button>
  );
}
