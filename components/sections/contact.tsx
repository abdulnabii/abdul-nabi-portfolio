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
} from "lucide-react";
import { FormEvent, useState } from "react";

interface FormState {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
}

const initialState: FormState = {
  name: "",
  email: "",
  company: "",
  subject: "",
  message: "",
};

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  email: Mail,
  whatsapp: Mail,
};

import { useSiteSettings } from "@/components/settings-provider";

export function Contact() {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Clear a single field's inline error as soon as the user types valid input
  function clearFieldError(key: keyof FormState) {
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  const email = settings.email || siteContent.email?.trim();
  const location = settings.location || siteContent.location;
  const phone = settings.phone || "0333 7597315";
  const whatsapp = settings.whatsapp || "+92 309 3751434";
  const responseTime = settings.responseTime || siteContent.contact.responseTime;
  const availabilityText = settings.availabilityText || siteContent.availability;
  const mailto = email ? `mailto:${email}` : null;
  const socials = getActiveSocials();
  const showResume = isPublicUrl(siteContent.resumeUrl);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Per-field client-side validation before network call
    const newFieldErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      newFieldErrors.name = "Name must be at least 2 characters.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newFieldErrors.email = "A valid email address is required.";
    if (!form.subject.trim())
      newFieldErrors.subject = "Please add a subject so I know the context.";
    if (!form.message.trim() || form.message.trim().length < 10)
      newFieldErrors.message = "Message must be at least 10 characters.";

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setStatus("loading");
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.company
            ? `[${form.company}] ${form.subject}`
            : form.subject,
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
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  }

  return (
    <section
      id="contact"
      className="section-padding relative"
      aria-labelledby="contact-heading"
    >
      <div className="container-narrow">
        <Reveal>
          <SectionHeading
            eyebrow="Hire / inquire"
            title={siteContent.contact.title}
            subtitle={siteContent.contact.description}
          />
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal delay={60}>
            <GlassCard interactive padding="lg" className="h-full space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  How to reach me
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Prefer the form for role briefs. Email or LinkedIn work for
                  short intros.
                </p>
              </div>

              <ul className="space-y-4">
                {mailto && isMailto(mailto) && (
                  <li className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-accent-soft">
                      <Mail className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Email
                      </p>
                      <a
                        href={mailto}
                        className="cursor-grow text-sm text-slate-200 transition-colors hover:text-accent-soft hover:underline"
                      >
                        {email}
                      </a>
                    </div>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-accent-soft">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Location
                    </p>
                    <p className="text-sm text-slate-200">
                      {location}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-accent-soft">
                    <Phone className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Voice Phone
                    </p>
                    <a href={`tel:${phone.replace(/\s+/g, "")}`} className="cursor-grow text-sm text-slate-200 transition-colors hover:text-accent-soft hover:underline">
                      {phone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      WhatsApp Direct
                    </p>
                    <a
                      href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-grow text-sm text-emerald-300 transition-colors hover:text-emerald-200 hover:underline"
                    >
                      {whatsapp}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-accent-soft">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Response
                    </p>
                    <p className="text-sm text-slate-200">
                      {responseTime}
                    </p>
                  </div>
                </li>
              </ul>

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                <p className="text-xs uppercase tracking-wider text-emerald-300/80">
                  Availability
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  {availabilityText}
                </p>
              </div>

              {showResume && siteContent.resumeUrl && (
                <a
                  href={siteContent.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-grow inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white hover:-translate-y-0.5"
                >
                  Download CV (PDF) →
                </a>
              )}

              {socials.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t border-white/5 pt-5">
                  {socials.map((social) => {
                    const Icon = socialIcons[social.icon];
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target={social.icon === "email" ? undefined : "_blank"}
                        rel={
                          social.icon === "email"
                            ? undefined
                            : "noopener noreferrer"
                        }
                        className="cursor-grow inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white hover:-translate-y-0.5"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {social.label}
                      </a>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </Reveal>

          <Reveal delay={120}>
            <GlassCard padding="lg" elevated interactive className="cursor-grow">
              {status === "success" ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                  <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                    <CheckCircle2 className="h-7 w-7" />
                  </span>
                  <h3 className="text-xl font-semibold text-white">
                    Message received
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-400">
                    Thanks — I&apos;ll review the details and respond within 1–2
                    business days.
                  </p>
                  <Button
                    className="mt-6"
                    variant="secondary"
                    onClick={() => setStatus("idle")}
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <p className="text-sm leading-relaxed text-slate-400">
                    {siteContent.contact.formNote}
                  </p>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Input
                        label="Your name"
                        name="name"
                        autoComplete="name"
                        required
                        placeholder="Jane Doe"
                        value={form.name}
                        onChange={(e) => {
                          updateField("name", e.target.value);
                          if (e.target.value.trim().length >= 2) clearFieldError("name");
                        }}
                      />
                      {fieldErrors.name && (
                        <p className="mt-1 text-xs text-red-400" role="alert">{fieldErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <Input
                        label="Work email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="jane@company.com"
                        value={form.email}
                        onChange={(e) => {
                          updateField("email", e.target.value);
                          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) clearFieldError("email");
                        }}
                      />
                      {fieldErrors.email && (
                        <p className="mt-1 text-xs text-red-400" role="alert">{fieldErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Input
                        label="Company / team"
                        name="company"
                        autoComplete="organization"
                        placeholder="Optional"
                        value={form.company}
                        onChange={(e) => updateField("company", e.target.value)}
                      />
                      {/* Spacer so this column height matches its sibling when Subject has an error */}
                      {fieldErrors.subject && <div className="mt-1 h-[1.25rem]" aria-hidden />}
                    </div>
                    <div>
                      <Input
                        label="Subject"
                        name="subject"
                        required
                        placeholder="Role, project, or intro"
                        value={form.subject}
                        onChange={(e) => {
                          updateField("subject", e.target.value);
                          if (e.target.value.trim()) clearFieldError("subject");
                        }}
                      />
                      {fieldErrors.subject && (
                        <p className="mt-1 text-xs text-red-400" role="alert">{fieldErrors.subject}</p>
                      )}
                    </div>
                  </div>

                  <Textarea
                    label="Message"
                    name="message"
                    required
                    placeholder="Role type, stack, timeline, and what success looks like…"
                    value={form.message}
                    onChange={(e) => {
                      updateField("message", e.target.value);
                      if (e.target.value.trim().length >= 10) clearFieldError("message");
                    }}
                  />
                  {fieldErrors.message && (
                    <p className="mt-1 text-xs text-red-400" role="alert">{fieldErrors.message}</p>
                  )}

                  {errorMessage && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 animate-fade-in" role="alert">
                      <span className="font-bold uppercase tracking-wider text-red-400 shrink-0">Error:</span>
                      <p className="leading-relaxed">{errorMessage}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={status === "loading"}
                      className="w-full sm:w-auto"
                    >
                      {status === "loading" ? "Sending…" : "Send message"}
                      <Send className="h-4 w-4" />
                    </Button>
                    <p className="text-xs text-slate-500">
                      No spam. Used only to reply to your inquiry.
                    </p>
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
