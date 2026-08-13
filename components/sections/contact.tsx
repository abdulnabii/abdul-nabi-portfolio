"use client";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Textarea } from "@/components/ui/textarea";
import { getActiveSocials, siteContent } from "@/data/content";
import { isMailto, isPublicUrl } from "@/lib/links";
import {
  CheckCircle2,
  Clock,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Send,
  Twitter,
  Phone,
  MessageSquare,
  Sparkles,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  Briefcase,
  Code2,
  ShieldAlert,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useSiteSettings } from "@/components/settings-provider";

interface FormState {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  inquiryType: string;
}

const initialState: FormState = {
  name: "",
  email: "",
  company: "",
  subject: "",
  message: "",
  inquiryType: "Full-Time Role",
};

const INQUIRY_TYPES = [
  { id: "Full-Time Role", label: "Full-Time Role", icon: Briefcase },
  { id: "Contract / Project", label: "Contract / Project", icon: Code2 },
  { id: "AppSec / Security Audit", label: "AppSec / Security Audit", icon: ShieldAlert },
  { id: "General Inquiry", label: "General Inquiry", icon: MessageSquare },
];

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  email: Mail,
  whatsapp: Mail,
};

export function Contact() {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [copiedEmail, setCopiedEmail] = useState(false);

  const email = settings.email || siteContent.email?.trim() || "abdulnabi.khaskhely@gmail.com";
  const location = settings.location || siteContent.location || "Karachi, Sindh, Pakistan";
  const phone = settings.phone || "0333 7597315";
  const whatsapp = settings.whatsapp || "+92 309 3751434";
  const responseTime = settings.responseTime || "< 2 business hours";
  const availabilityText = settings.availabilityText || "Open to Full-Time Engineering & Contract Roles";
  const mailto = email ? `mailto:${email}` : null;
  const socials = getActiveSocials();
  const showResume = isPublicUrl(siteContent.resumeUrl);

  function copyEmailToClipboard() {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  }

  function selectInquiryType(type: string) {
    setForm((prev) => ({
      ...prev,
      inquiryType: type,
      subject: prev.subject && !INQUIRY_TYPES.some((t) => prev.subject.includes(t.label))
        ? prev.subject
        : `[${type}] Engineering Inquiry`,
    }));
    if (fieldErrors.subject) {
      setFieldErrors((prev) => ({ ...prev, subject: undefined }));
    }
  }

  function clearFieldError(key: keyof FormState) {
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const newFieldErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      newFieldErrors.name = "Please enter your name (minimum 2 characters).";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newFieldErrors.email = "Please provide a valid work email address.";
    if (!form.subject.trim())
      newFieldErrors.subject = "Please enter a subject or select an inquiry topic.";
    if (!form.message.trim() || form.message.trim().length < 10)
      newFieldErrors.message = "Please write a message with context (at least 10 characters).";

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setStatus("loading");
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const formattedSubject = form.company
        ? `[${form.inquiryType}] [${form.company}] ${form.subject}`
        : `[${form.inquiryType}] ${form.subject}`;

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: formattedSubject,
          message: form.message,
        }),
      });

      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to send message");
      }

      setStatus("success");
      setForm(initialState);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong sending your message. Please try again or email directly."
      );
    }
  }

  return (
    <section
      id="contact"
      className="section-padding relative overflow-hidden"
      aria-labelledby="contact-heading"
    >
      <div className="container-narrow space-y-12">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Get in Touch & Hire
            </div>
            <h2
              id="contact-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight"
            >
              Let&apos;s Build Something Exceptional
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Available for full-time engineering roles, high-impact contract builds, and AppSec audits.
              Send a brief note below or reach out directly.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.35fr] items-start">
          {/* Left Column: Direct Channels & Status Card */}
          <Reveal delay={60}>
            <GlassCard
              interactive
              padding="lg"
              className="space-y-6 border-white/10 bg-slate-900/60 shadow-xl backdrop-blur-2xl"
            >
              {/* Availability Beacon Banner */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Live Availability Status
                  </span>
                </div>
                <p className="text-sm font-semibold text-white">
                  {availabilityText}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-300/80 pt-1">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Avg. response time: <strong className="text-emerald-200">{responseTime}</strong></span>
                </div>
              </div>

              {/* Direct Channels List */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Direct Communication Channels
                </h3>

                {/* Email Tile */}
                <div className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition hover:border-indigo-500/40 hover:bg-white/[0.06]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Email</p>
                      <a
                        href={mailto || "#"}
                        className="block truncate text-xs sm:text-sm font-semibold text-white hover:text-indigo-300 transition"
                      >
                        {email}
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={copyEmailToClipboard}
                    className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0 cursor-pointer"
                    title="Copy email address"
                  >
                    {copiedEmail ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* WhatsApp Tile */}
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition hover:border-emerald-500/40 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">WhatsApp Fast Chat</p>
                      <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-300 transition">
                        {whatsapp}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    Instant
                  </span>
                </a>

                {/* Location Tile */}
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-indigo-300">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Location & Timezone</p>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      {location} <span className="text-xs text-slate-400 font-normal">(PKT / UTC+5)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Resume / CV Link */}
              {showResume && (
                <div className="pt-2">
                  <a
                    href={siteContent.resumeUrl}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-600/20 px-4 py-2.5 text-xs font-bold text-indigo-200 transition hover:bg-indigo-600 hover:text-white hover:border-indigo-500 shadow-md cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    View & Download Official CV (PDF)
                  </a>
                </div>
              )}

              {/* Social Profiles */}
              {socials.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    Professional Networks
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {socials.map((social) => {
                      const Icon = socialIcons[social.icon] || Mail;
                      return (
                        <a
                          key={social.label}
                          href={social.href}
                          target={social.icon === "email" ? undefined : "_blank"}
                          rel={social.icon === "email" ? undefined : "noopener noreferrer"}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-indigo-500/50 hover:bg-white/10 hover:text-white"
                        >
                          <Icon className="h-3.5 w-3.5 text-indigo-400" />
                          {social.label}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </GlassCard>
          </Reveal>

          {/* Right Column: Interactive Professional Form */}
          <Reveal delay={120}>
            <GlassCard
              padding="lg"
              elevated
              className="border-white/15 bg-[#0a0f24]/90 shadow-2xl backdrop-blur-2xl"
            >
              {status === "success" ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white">
                      Message Dispatched Successfully!
                    </h3>
                    <p className="text-sm text-slate-300 max-w-md">
                      Thank you for reaching out. Your inquiry has been sent directly to Abdul Nabi&apos;s verified inbox.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-400 max-w-sm">
                    ⚡ You will receive a personal response within <strong className="text-white">1–2 business days</strong>.
                  </div>
                  <Button
                    className="mt-4"
                    variant="secondary"
                    onClick={() => setStatus("idle")}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Inquiry Category Pills */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-indigo-300">
                      1. Select Inquiry Type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {INQUIRY_TYPES.map((t) => {
                        const Icon = t.icon;
                        const isSelected = form.inquiryType === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => selectInquiryType(t.id)}
                            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition cursor-pointer text-center ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-600/30 text-white shadow-md shadow-indigo-500/20"
                                : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            <Icon className={`h-4 w-4 ${isSelected ? "text-indigo-400" : "text-slate-400"}`} />
                            <span className="text-[11px] leading-tight">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name & Email Fields */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-indigo-300">
                      2. Your Contact Information
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Input
                          label="Your Full Name *"
                          name="name"
                          autoComplete="name"
                          required
                          placeholder="e.g. Alex Morgan"
                          value={form.name}
                          onChange={(e) => {
                            updateField("name", e.target.value);
                            if (e.target.value.trim().length >= 2) clearFieldError("name");
                          }}
                        />
                        {fieldErrors.name && (
                          <p className="mt-1 text-xs text-rose-400 font-medium" role="alert">
                            {fieldErrors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <Input
                          label="Work / Business Email *"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder="alex@company.com"
                          value={form.email}
                          onChange={(e) => {
                            updateField("email", e.target.value);
                            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) clearFieldError("email");
                          }}
                        />
                        {fieldErrors.email && (
                          <p className="mt-1 text-xs text-rose-400 font-medium" role="alert">
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Company & Subject Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Input
                        label="Company / Team (Optional)"
                        name="company"
                        autoComplete="organization"
                        placeholder="e.g. Acme Health Corp"
                        value={form.company}
                        onChange={(e) => updateField("company", e.target.value)}
                      />
                    </div>

                    <div>
                      <Input
                        label="Subject / Topic *"
                        name="subject"
                        required
                        placeholder="e.g. Full-Stack Role / Project Scoping"
                        value={form.subject}
                        onChange={(e) => {
                          updateField("subject", e.target.value);
                          if (e.target.value.trim()) clearFieldError("subject");
                        }}
                      />
                      {fieldErrors.subject && (
                        <p className="mt-1 text-xs text-rose-400 font-medium" role="alert">
                          {fieldErrors.subject}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-1">
                    <Textarea
                      label="Project Brief / Role Details *"
                      name="message"
                      rows={4}
                      required
                      placeholder="Please outline the role responsibilities, tech stack requirements, project scope, or timeline..."
                      value={form.message}
                      onChange={(e) => {
                        updateField("message", e.target.value);
                        if (e.target.value.trim().length >= 10) clearFieldError("message");
                      }}
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Minimum 10 characters</span>
                      <span>{form.message.length} chars</span>
                    </div>
                    {fieldErrors.message && (
                      <p className="mt-1 text-xs text-rose-400 font-medium" role="alert">
                        {fieldErrors.message}
                      </p>
                    )}
                  </div>

                  {/* Error Notification Banner */}
                  {errorMessage && (
                    <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3.5 text-xs text-rose-200 animate-fade-in" role="alert">
                      <span className="font-bold uppercase tracking-wider text-rose-400 shrink-0">Error:</span>
                      <p className="leading-relaxed">{errorMessage}</p>
                    </div>
                  )}

                  {/* Submit Action Bar */}
                  <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-indigo-400 hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
                    >
                      {status === "loading" ? "Dispatching Message..." : "Send Message"}
                      <Send className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Confidential · Direct to Abdul Nabi</span>
                    </div>
                  </div>
                </form>
              )}
            </GlassCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
