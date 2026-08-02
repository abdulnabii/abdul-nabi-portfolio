"use client";

import { useEffect, useRef } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemTitle: string;
  loading?: boolean;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemTitle,
  loading = false,
}: DeleteModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0f1e]/95 p-6 shadow-glass-lg backdrop-blur-2xl animate-scale-in"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 text-red-400">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm leading-relaxed text-slate-300">
            Delete <span className="font-semibold text-white">“{itemTitle}”</span>? This cannot be undone.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500 hover:text-white transition"
          >
            {loading ? "Deleting..." : "Delete permanently"}
          </Button>
        </div>
      </div>
    </div>
  );
}
