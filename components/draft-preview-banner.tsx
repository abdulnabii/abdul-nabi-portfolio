import { draftMode } from "next/headers";
import { AlertTriangle, LogOut } from "lucide-react";
import Link from "next/link";

export function DraftPreviewBanner() {
  const { isEnabled } = draftMode();

  if (!isEnabled) return null;

  return (
    <div className="sticky top-0 z-[200] flex items-center justify-between border-b border-amber-500/30 bg-amber-500/20 px-4 py-2 text-xs font-medium text-amber-200 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
        <span>
          <strong className="font-bold">DRAFT PREVIEW MODE</strong> — You are viewing unpublished draft content.
        </span>
      </div>
      <Link
        href="/api/exit-preview"
        prefetch={false}
        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/30 px-3 py-1 text-xs font-semibold text-white transition hover:bg-amber-500/50"
      >
        <LogOut className="h-3.5 w-3.5" />
        Exit preview
      </Link>
    </div>
  );
}
