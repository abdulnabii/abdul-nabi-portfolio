/**
 * Treat root domains and example.com as non-public placeholders.
 * Only render outbound CTAs when a real destination is configured.
 */
export function isPublicUrl(url?: string | null): boolean {
  if (!url || !url.trim()) return false;

  try {
    const parsed = new URL(url, "https://placeholder.local");
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const path = parsed.pathname.replace(/\/$/, "");

    if (host === "example.com" || host.endsWith(".example.com")) {
      return false;
    }

    // Bare social homepages without a profile path look unfinished
    if (
      (host === "github.com" ||
        host === "linkedin.com" ||
        host === "twitter.com" ||
        host === "x.com") &&
      path === ""
    ) {
      return false;
    }

    return true;
  } catch {
    // Allow same-origin paths like /resume.pdf or /#contact
    return url.startsWith("/") || url.startsWith("#") || url.startsWith("mailto:");
  }
}

export function isMailto(url?: string | null): boolean {
  if (!url) return false;
  if (!url.startsWith("mailto:")) return false;
  const address = url.replace(/^mailto:/i, "").trim();
  return Boolean(address) && !address.includes("example.com");
}
