"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useState, FormEvent } from "react";

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (repliedAt: string) => void;
  inboxItemId: string;
  recipientEmail: string;
  recipientName: string;
  originalSubject: string;
}

export function ReplyModal({
  isOpen,
  onClose,
  onSuccess,
  inboxItemId,
  recipientEmail,
  recipientName,
  originalSubject,
}: ReplyModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSubject(
        originalSubject.toLowerCase().startsWith("re:")
          ? originalSubject
          : `Re: ${originalSubject}`
      );
      setBody("");
      setError(null);
      setToastMessage(null);
    }
  }, [isOpen, originalSubject]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) {
      setError("Please write a message before sending.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/inbox/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inboxItemId,
          to: recipientEmail,
          subject,
          body,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send reply");
      }

      setToastMessage(data.message || "Reply sent!");
      setTimeout(() => {
        onSuccess(data.repliedAt || new Date().toISOString());
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Reply to contact message"
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0f1e]/95 p-6 shadow-2xl backdrop-blur-2xl animate-scale-in"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Reply to Message</h3>
            <p className="text-xs text-slate-400">
              Sending reply to <span className="text-indigo-300 font-medium">{recipientName}</span> ({recipientEmail})
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {toastMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Input
            label="To"
            value={recipientEmail}
            disabled
            className="opacity-70 bg-white/[0.02]"
          />

          <Input
            label="Subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Message Body <span className="text-red-400">*</span>
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                {body.length} chars
              </span>
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              required
              placeholder="Type your response here..."
              className="mt-1.5"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {loading ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
