"use client";

import { useState } from "react";

interface MarkdownEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return "<p class='text-slate-500 italic'>Nothing to preview...</p>";

  let html = markdown
    // Escape HTML tags to prevent XSS
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks ``` code ```
  html = html.replace(/```([\s\S]*?)```/g, (_match, code) => {
    return `<pre class="my-3 overflow-x-auto rounded-xl border border-white/10 bg-[#050814] p-3 font-mono text-xs text-emerald-300"><code>${code.trim()}</code></pre>`;
  });

  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, `<code class="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-amber-200">$1</code>`);

  // Headings #, ##, ###
  html = html.replace(/^### (.*$)/gim, '<h3 class="mt-4 mb-2 text-base font-semibold text-white">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="mt-5 mb-2 text-lg font-bold text-white border-b border-white/10 pb-1">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="mt-6 mb-3 text-xl font-extrabold text-white border-b border-accent/30 pb-1.5">$1</h1>');

  // Blockquotes > quote
  html = html.replace(/^&gt; (.*$)/gim, '<blockquote class="my-3 border-l-2 border-accent pl-3 text-sm italic text-slate-300">$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-200">$1</em>');

  // Lists (- or * or 1.)
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>');
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-slate-300">$1</li>');

  // Line breaks to paragraphs
  const paragraphs = html
    .split(/\n\n+/)
    .map((p) => {
      if (
        p.startsWith("<h1") ||
        p.startsWith("<h2") ||
        p.startsWith("<h3") ||
        p.startsWith("<pre") ||
        p.startsWith("<blockquote") ||
        p.startsWith("<li")
      ) {
        return p;
      }
      return `<p class="mb-2 text-sm leading-relaxed text-slate-300">${p.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("");

  return paragraphs;
}

export function MarkdownEditor({
  label,
  value,
  onChange,
  placeholder,
  rows = 8,
  required = false,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </label>

        {/* Mobile Tab Toggle */}
        <div className="flex sm:hidden rounded-lg bg-white/5 p-0.5 border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              activeTab === "edit" ? "bg-accent/30 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              activeTab === "preview" ? "bg-accent/30 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Desktop Split-Pane (50% | 50%) / Mobile Conditional Display */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Editor Pane */}
        <div className={activeTab === "preview" ? "hidden sm:block" : "block"}>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            required={required}
            placeholder={placeholder}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 font-mono text-sm text-white placeholder-slate-500 outline-none focus:border-accent/40 focus:bg-white/[0.07] transition"
          />
        </div>

        {/* Live Preview Pane */}
        <div className={activeTab === "edit" ? "hidden sm:block" : "block"}>
          <div
            className="h-full min-h-[160px] max-h-[420px] overflow-y-auto rounded-xl border border-white/10 bg-[#050814]/80 p-4 font-sans text-sm shadow-inner"
            dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(value) }}
          />
        </div>
      </div>
    </div>
  );
}
