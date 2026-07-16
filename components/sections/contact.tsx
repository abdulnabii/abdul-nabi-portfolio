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

export function Contact() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const email = siteContent.email?.trim();
  const mailto = email ? `mailto:${email}` : null;
  const socials = getActiveSocials();
  const showResume = isPublicUrl(siteContent.resumeUrl);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

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
                        className="text-sm text-slate-200 transition-colors hover:text-white"
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
                      {siteContent.location}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-accent-soft">
                    <Phone className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Phone / Mobile
                    </p>
                    <a href="tel:03337597315" className="text-sm text-slate-200 hover:text-white transition cursor-grow">
                      0333 7597315
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
                      {siteContent.contact.responseTime}
                    </p>
                  </div>
                </li>
              </ul>

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                <p className="text-xs uppercase tracking-wider text-emerald-300/80">
                  Availability
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  {siteContent.availability}
                </p>
              </div>

              {showResume && siteContent.resumeUrl && (
                <a
                  href={siteContent.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-sm font-medium text-accent-soft transition-colors hover:text-white"
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
                        className="cursor-grow inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300 transition-colors hover:border-white/20 hover:text-white"
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
                    <Input
                      label="Your name"
                      name="name"
                      autoComplete="name"
                      required
                      placeholder="Jane Doe"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                    />
                    <Input
                      label="Work email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="jane@company.com"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      label="Company / team"
                      name="company"
                      autoComplete="organization"
                      placeholder="Optional"
                      value={form.company}
                      onChange={(e) => updateField("company", e.target.value)}
                    />
                    <Input
                      label="Subject"
                      name="subject"
                      required
                      placeholder="Role, project, or intro"
                      value={form.subject}
                      onChange={(e) => updateField("subject", e.target.value)}
                    />
                  </div>

                  <Textarea
                    label="Message"
                    name="message"
                    required
                    placeholder="Role type, stack, timeline, and what success looks like…"
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                  />

                  {errorMessage && (
                    <p className="text-sm text-red-400" role="alert">
                      {errorMessage}
                    </p>
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
