"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSettings } from "@/lib/settings-store";
import { AlertCircle, CheckCircle2, RefreshCw, Save, Sliders } from "lucide-react";
import { FormEvent, useState } from "react";
import { CvManager } from "./cv-manager";

interface SettingsFormProps {
  initialSettings: SiteSettings;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [revalidating, setRevalidating] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [revalidateMsg, setRevalidateMsg] = useState<string | null>(null);

  function handleChange(field: keyof SiteSettings, value: string) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaveState("saving");
    setError(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevalidate() {
    setRevalidating(true);
    setRevalidateMsg(null);
    try {
      const secret = "default_revalidate_secret";
      const res = await fetch(`/api/admin/revalidate?secret=${secret}`, {
        method: "POST",
      });

      const data = await res.json();
      if (res.ok) {
        setRevalidateMsg("Public site cache cleared and revalidated successfully!");
        setTimeout(() => setRevalidateMsg(null), 4000);
      } else {
        throw new Error(data.error || "Revalidation failed");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Revalidation failed");
    } finally {
      setRevalidating(false);
    }
  }

  return (
    <div className="space-y-8">
      {saveState === "saved" && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>Site settings saved successfully!</span>
        </div>
      )}

      {revalidateMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-sm text-indigo-300">
          <RefreshCw className="h-4.5 w-4.5 shrink-0" />
          <span>{revalidateMsg}</span>
        </div>
      )}

      {saveState === "error" && error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">General Site Settings</h3>
            <p className="text-sm text-slate-400">
              Customize public branding strings, availability tags, and contact details.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleRevalidate}
            disabled={revalidating}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${revalidating ? "animate-spin" : ""}`} />
            Revalidate public site
          </Button>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
            Hero & Identity
          </h4>

          <Input
            label="Availability Badge Text"
            value={settings.availabilityText}
            onChange={(e) => handleChange("availabilityText", e.target.value)}
            placeholder="e.g. Open to full-time engineering roles..."
          />

          <Input
            label="Hero Tagline (H1 Subtitle)"
            value={settings.heroTagline}
            onChange={(e) => handleChange("heroTagline", e.target.value)}
            placeholder="e.g. I build secure web applications..."
          />

          <Textarea
            label="Hero Description Paragraph"
            value={settings.heroDescription}
            rows={3}
            onChange={(e) => handleChange("heroDescription", e.target.value)}
            placeholder="Full-stack developer summary..."
          />

          <Input
            label="Contact Response Time Message"
            value={settings.responseTime}
            onChange={(e) => handleChange("responseTime", e.target.value)}
            placeholder="Usually responds within 24 hours."
          />
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
            Contact & Social Connections
          </h4>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email Address"
              value={settings.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            <Input
              label="Phone Number"
              value={settings.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <Input
              label="WhatsApp Number"
              value={settings.whatsapp}
              onChange={(e) => handleChange("whatsapp", e.target.value)}
            />
            <Input
              label="GitHub Profile URL"
              value={settings.githubUrl}
              onChange={(e) => handleChange("githubUrl", e.target.value)}
            />
            <Input
              label="LinkedIn Profile URL"
              value={settings.linkedinUrl}
              onChange={(e) => handleChange("linkedinUrl", e.target.value)}
              className="sm:col-span-2"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving Settings..." : "Save Settings"}
          </Button>
        </div>
      </form>

      {/* Embedded CV Upload Manager */}
      <CvManager currentCvUrl={settings.cvUrl || "/ab_resume.pdf"} />
    </div>
  );
}
