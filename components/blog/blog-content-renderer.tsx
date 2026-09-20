"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

function CodeBlock({ code, language = "code" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="my-6 rounded-2xl border border-white/15 bg-[#060a17] overflow-hidden shadow-2xl">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Terminal className="h-3 w-3 text-indigo-400" />
            {language}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-300">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto max-w-full">
        <pre className="font-mono text-xs sm:text-sm text-indigo-200 leading-relaxed whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

/**
 * Sanitizes and parses inline markdown:
 * - Strips leaking HTML tags (<font>, <a>, etc.)
 * - Strips Google News RSS tracking redirect URLs
 * - Converts **bold** to <strong>
 * - Converts *italic* to <em>
 * - Converts `code` to <code>
 * - Converts [text](url) to <a>
 * - Auto-links raw URLs safely with break-all
 */
function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // 1. Strip raw HTML tags and decode common entities
  let clean = text
    .replace(/<font[^>]*>/gi, "")
    .replace(/<\/font>/gi, "")
    .replace(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    // Remove Google News RSS redirect links which stretch mobile frames
    .replace(/https?:\/\/news\.google\.com\/[^\s)\]]+/g, "");

  // Regex tokenizer for [text](url), `code`, **bold**, *italic*, raw URLs
  const tokenRegex = /(\[[^\]]+\]\([^\)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|https?:\/\/[^\s<]+)/g;
  const parts = clean.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Markdown Link [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (linkMatch) {
      const linkText = linkMatch[1];
      const linkUrl = linkMatch[2];
      return (
        <a
          key={index}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 break-all transition-colors font-medium"
        >
          {linkText}
        </a>
      );
    }

    // Bare URL (https://...)
    if (/^https?:\/\/[^\s]+$/.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 break-all transition-colors font-medium"
        >
          {part}
        </a>
      );
    }

    // Inline Code `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={index}
          className="rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-accent-soft break-all"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={index} className="italic text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

/**
 * Parses markdown tables
 */
function renderTable(lines: string[]): React.ReactNode {
  const parseRow = (line: string) =>
    line
      .split("|")
      .map((c) => c.trim())
      .filter((_, i, arr) => i > 0 && i < arr.length - 1);

  const headerRow = parseRow(lines[0] || "");
  const bodyRows = lines.slice(2).map(parseRow);

  return (
    <div className="my-6 overflow-x-auto max-w-full rounded-2xl border border-white/10 bg-[#060a17]/80">
      <table className="w-full text-left border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03]">
            {headerRow.map((cell, idx) => (
              <th key={idx} className="p-3.5 font-semibold text-white">
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="p-3.5 text-slate-300">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type ParsedBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "h4"; text: string }
  | { type: "hr" }
  | { type: "table"; lines: string[] }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; lines: string[] }
  | { type: "paragraph"; text: string };

function parseMarkdownToBlocks(markdown: string): ParsedBlock[] {
  const rawLines = markdown.split(/\r?\n/);
  const blocks: ParsedBlock[] = [];

  let currentTable: string[] = [];
  let currentUl: string[] = [];
  let currentOl: string[] = [];
  let currentQuote: string[] = [];
  let currentPara: string[] = [];

  const flush = () => {
    if (currentTable.length > 0) {
      blocks.push({ type: "table", lines: [...currentTable] });
      currentTable = [];
    }
    if (currentUl.length > 0) {
      blocks.push({ type: "ul", items: [...currentUl] });
      currentUl = [];
    }
    if (currentOl.length > 0) {
      blocks.push({ type: "ol", items: [...currentOl] });
      currentOl = [];
    }
    if (currentQuote.length > 0) {
      blocks.push({ type: "quote", lines: [...currentQuote] });
      currentQuote = [];
    }
    if (currentPara.length > 0) {
      const text = currentPara.join(" ").trim();
      if (text) {
        blocks.push({ type: "paragraph", text });
      }
      currentPara = [];
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Blank line
    if (!trimmed) {
      flush();
      continue;
    }

    // Horizontal Rule
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flush();
      blocks.push({ type: "hr" });
      continue;
    }

    // Headings
    if (trimmed.startsWith("## ")) {
      flush();
      blocks.push({ type: "h2", text: trimmed.replace(/^##\s+/, "") });
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flush();
      blocks.push({ type: "h3", text: trimmed.replace(/^###\s+/, "") });
      continue;
    }
    if (trimmed.startsWith("#### ")) {
      flush();
      blocks.push({ type: "h4", text: trimmed.replace(/^####\s+/, "") });
      continue;
    }

    // Table Row
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (currentUl.length || currentOl.length || currentQuote.length || currentPara.length) {
        flush();
      }
      currentTable.push(trimmed);
      continue;
    } else if (currentTable.length > 0) {
      flush();
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      if (currentUl.length || currentOl.length || currentTable.length || currentPara.length) {
        flush();
      }
      currentQuote.push(trimmed.replace(/^>\s?/, ""));
      continue;
    } else if (currentQuote.length > 0) {
      flush();
    }

    // Unordered list item
    if (/^[-*]\s+/.test(trimmed)) {
      if (currentOl.length || currentTable.length || currentQuote.length || currentPara.length) {
        flush();
      }
      currentUl.push(trimmed.replace(/^[-*]\s+/, ""));
      continue;
    } else if (currentUl.length > 0) {
      flush();
    }

    // Ordered list item
    if (/^\d+\.\s+/.test(trimmed)) {
      if (currentUl.length || currentTable.length || currentQuote.length || currentPara.length) {
        flush();
      }
      currentOl.push(trimmed.replace(/^\d+\.\s+/, ""));
      continue;
    } else if (currentOl.length > 0) {
      flush();
    }

    // Regular Paragraph line
    currentPara.push(trimmed);
  }

  flush();
  return blocks;
}

export function BlogContentRenderer({ content }: { content: string }) {
  if (!content) return null;

  // 1. First tokenize code blocks
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const sections: { type: "code" | "markdown"; content: string; language?: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      sections.push({
        type: "markdown",
        content: content.slice(lastIndex, match.index),
      });
    }
    sections.push({
      type: "code",
      language: match[1]?.trim() || "code",
      content: match[2],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    sections.push({
      type: "markdown",
      content: content.slice(lastIndex),
    });
  }

  return (
    <div className="space-y-6 text-slate-300 leading-relaxed max-w-full overflow-hidden break-words">
      {sections.map((sec, secIdx) => {
        if (sec.type === "code") {
          // Check if it's an ASCII diagram box
          const isAsciiBox = /[┌┐└┘├┤─│]/.test(sec.content);
          if (isAsciiBox) {
            return (
              <div
                key={secIdx}
                className="my-6 p-4 rounded-2xl border border-white/15 bg-[#060a17] overflow-x-auto max-w-full shadow-2xl"
              >
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10 text-xs font-semibold text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span>System Architecture Flow</span>
                </div>
                <pre className="font-mono text-xs sm:text-sm text-indigo-300 leading-tight whitespace-pre">
                  {sec.content.trim()}
                </pre>
              </div>
            );
          }

          return (
            <CodeBlock
              key={secIdx}
              code={sec.content.trim()}
              language={sec.language || "typescript"}
            />
          );
        }

        // Markdown blocks parser
        const blocks = parseMarkdownToBlocks(sec.content);

        return (
          <React.Fragment key={secIdx}>
            {blocks.map((b, bIdx) => {
              const blockKey = `${secIdx}-${bIdx}`;

              switch (b.type) {
                case "hr":
                  return <hr key={blockKey} className="my-8 border-white/10" />;

                case "h2":
                  return (
                    <h2
                      key={blockKey}
                      className="mt-10 mb-4 text-2xl sm:text-3xl font-bold tracking-tight text-white first:mt-0"
                    >
                      {renderInline(b.text)}
                    </h2>
                  );

                case "h3":
                  return (
                    <h3
                      key={blockKey}
                      className="mt-8 mb-3 text-lg sm:text-xl font-semibold tracking-tight text-white"
                    >
                      {renderInline(b.text)}
                    </h3>
                  );

                case "h4":
                  return (
                    <h4
                      key={blockKey}
                      className="mt-6 mb-2 text-base font-semibold text-white"
                    >
                      {renderInline(b.text)}
                    </h4>
                  );

                case "table":
                  return (
                    <React.Fragment key={blockKey}>
                      {renderTable(b.lines)}
                    </React.Fragment>
                  );

                case "ul":
                  return (
                    <ul
                      key={blockKey}
                      className="my-4 list-disc pl-5 space-y-2 text-sm sm:text-base text-slate-300"
                    >
                      {b.items.map((item, i) => (
                        <li key={i}>{renderInline(item)}</li>
                      ))}
                    </ul>
                  );

                case "ol":
                  return (
                    <ol
                      key={blockKey}
                      className="my-4 list-decimal pl-5 space-y-2 text-sm sm:text-base text-slate-300"
                    >
                      {b.items.map((item, i) => (
                        <li key={i}>{renderInline(item)}</li>
                      ))}
                    </ol>
                  );

                case "quote":
                  return (
                    <blockquote
                      key={blockKey}
                      className="my-4 border-l-4 border-indigo-500/60 bg-white/[0.02] py-2 px-4 italic text-slate-300 rounded-r-lg"
                    >
                      {b.lines.map((ql, i) => (
                        <p key={i}>{renderInline(ql)}</p>
                      ))}
                    </blockquote>
                  );

                case "paragraph":
                default:
                  return (
                    <p
                      key={blockKey}
                      className="mt-4 text-base leading-relaxed text-slate-300 break-words"
                    >
                      {renderInline(b.text)}
                    </p>
                  );
              }
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}
