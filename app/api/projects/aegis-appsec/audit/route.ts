import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface SecurityVulnerability {
  title: string;
  category: "OWASP A01: Broken Access Control" | "OWASP A02: Cryptographic Failures" | "OWASP A03: Injection" | "OWASP A04: Insecure Design" | "OWASP A05: Security Misconfiguration" | "OWASP A07: Identification and Authentication Failures" | "OWASP A08: Software and Data Integrity Failures" | "OWASP A10: Server-Side Request Forgery (SSRF)";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE";
  cvssScore: number;
  description: string;
  remediationCode: string;
  explanation: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payload, targetType, endpoint } = body;

    if (!payload && typeof payload !== "string") {
      return NextResponse.json({ error: "Missing payload to audit" }, { status: 400 });
    }

    const vulnerabilities: SecurityVulnerability[] = [];
    let riskScore = 0; // 0 (Safe) to 100 (Critical)

    const text = (payload || "").trim();
    const lower = text.toLowerCase();

    // 1. SQL Injection Checks
    if (
      lower.includes("or 1=1") ||
      lower.includes("' or '1'='1") ||
      lower.includes("union select") ||
      lower.includes("--") ||
      lower.includes("; drop table") ||
      lower.includes("exec(")
    ) {
      vulnerabilities.push({
        title: "SQL Injection (SQLi) Vulnerability Detected",
        category: "OWASP A03: Injection",
        severity: "CRITICAL",
        cvssScore: 9.8,
        description:
          "Input contains raw SQL metacharacters that alter query logic when concatenated into raw SQL strings without parameterization.",
        remediationCode: `// ❌ Vulnerable (Raw string interpolation):
const { data } = await db.query(\`SELECT * FROM users WHERE email = '\${input}'\`);

// ✅ Secured (Parameterized query via Supabase / Prisma):
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', input); // Parameterized automatically`,
        explanation:
          "Always use parameterized queries or an ORM like Supabase/Prisma. Never construct raw SQL strings via template literals.",
      });
      riskScore = Math.max(riskScore, 98);
    }

    // 2. Cross-Site Scripting (XSS) Checks
    if (
      lower.includes("<script") ||
      lower.includes("javascript:") ||
      lower.includes("onerror=") ||
      lower.includes("onload=") ||
      lower.includes("<iframe") ||
      lower.includes("eval(")
    ) {
      vulnerabilities.push({
        title: "Cross-Site Scripting (Reflected / Stored XSS) Risk",
        category: "OWASP A03: Injection",
        severity: "HIGH",
        cvssScore: 8.2,
        description:
          "Unsanitized HTML/JavaScript payload detected. If rendered via dangerouslySetInnerHTML or unescaped templates, attacker code executes in user browser session.",
        remediationCode: `import DOMPurify from 'isomorphic-dompurify';

// ❌ Vulnerable:
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// ✅ Secured (Sanitization + Text rendering):
// Default React JSX auto-escapes string content:
<div>{userComment}</div>

// If rich HTML is strictly required, sanitize first:
const cleanHtml = DOMPurify.sanitize(userComment);
<div dangerouslySetInnerHTML={{ __html: cleanHtml }} />`,
        explanation:
          "Rely on React's automatic string escaping. For rich markdown/HTML, sanitize strictly with DOMPurify on the server before rendering.",
      });
      riskScore = Math.max(riskScore, 82);
    }

    // 3. Server-Side Request Forgery (SSRF) Checks
    if (
      lower.includes("169.254.169.254") ||
      lower.includes("127.0.0.1") ||
      lower.includes("localhost") ||
      lower.includes("http://internal") ||
      lower.includes("metadata.google")
    ) {
      vulnerabilities.push({
        title: "Server-Side Request Forgery (SSRF) to Cloud Metadata / Localhost",
        category: "OWASP A10: Server-Side Request Forgery (SSRF)",
        severity: "CRITICAL",
        cvssScore: 9.6,
        description:
          "Target URL points to internal AWS/GCP instance metadata IP (169.254.169.254) or internal loopback interface, allowing theft of cloud IAM credentials.",
        remediationCode: `import ipaddr from 'ipaddr.js';

function isAllowedExternalUrl(urlString: string): boolean {
  const url = new URL(urlString);
  if (!['http:', 'https:'].includes(url.protocol)) return false;
  
  // Resolve hostname and block private/link-local ranges (RFC 1918 / 3927)
  const ip = ipaddr.parse(url.hostname);
  return ip.range() === 'unicast'; // Blocks loopback, linkLocal, private, carrierGradeNat
}`,
        explanation:
          "Validate destination URLs against an explicit allowlist and verify resolved IP addresses do not fall within private or metadata ranges.",
      });
      riskScore = Math.max(riskScore, 96);
    }

    // 4. Broken Object-Level Authorization (BOLA / IDOR)
    if (
      lower.includes("user_id=1") ||
      lower.includes("id=admin") ||
      lower.includes("role=admin") ||
      lower.includes("isadmin=true")
    ) {
      vulnerabilities.push({
        title: "Broken Object-Level Authorization (BOLA / IDOR Risk)",
        category: "OWASP A01: Broken Access Control",
        severity: "HIGH",
        cvssScore: 8.5,
        description:
          "Client payload attempts to specify privileged account IDs or override role flags directly in request body or URL parameters.",
        remediationCode: `// ❌ Vulnerable (Trusting client-supplied user_id):
export async function POST(req: NextRequest) {
  const { userId, invoiceId } = await req.json();
  await db.invoices.delete({ where: { id: invoiceId, userId } });
}

// ✅ Secured (Deriving identity strictly from verified session JWT):
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Derive userId strictly from session claims:
  await db.invoices.delete({ 
    where: { id: invoiceId, userId: session.userId } 
  });
}`,
        explanation:
          "Never trust client-submitted IDs for authorization. Always extract the user identity from cryptographically verified server session tokens or Supabase `auth.uid()`.",
      });
      riskScore = Math.max(riskScore, 85);
    }

    // 5. Prototype Pollution Checks
    if (lower.includes("__proto__") || lower.includes("constructor.prototype")) {
      vulnerabilities.push({
        title: "JavaScript Prototype Pollution Vulnerability",
        category: "OWASP A08: Software and Data Integrity Failures",
        severity: "HIGH",
        cvssScore: 7.5,
        description:
          "Payload targets Object.prototype properties, which can alter application behavior across all in-memory JavaScript objects.",
        remediationCode: `// ✅ Secured deep merge / JSON parsing:
function safeAssign(target: any, source: any) {
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue; // Strip dangerous prototype keys
    }
    target[key] = source[key];
  }
  return target;
}`,
        explanation:
          "Sanitize keys when recursively merging objects or use `Map` data structures rather than plain objects for arbitrary user keys.",
      });
      riskScore = Math.max(riskScore, 75);
    }

    // If no vulnerabilities triggered
    if (vulnerabilities.length === 0) {
      vulnerabilities.push({
        title: "Payload Sanitized & Validated",
        category: "OWASP A04: Insecure Design",
        severity: "SAFE",
        cvssScore: 0.0,
        description:
          "No known high-risk injection, SSRF, or prototype pollution patterns were detected in the input payload.",
        remediationCode: `// Continue enforcing strict schema validation (e.g. Zod):
import { z } from 'zod';

const InputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80),
});`,
        explanation: "Input passes heuristic audit checks. Ensure strong validation schemas remain active.",
      });
      riskScore = 0;
    }

    return NextResponse.json({
      ok: true,
      riskScore,
      vulnerabilitiesCount: vulnerabilities.filter((v) => v.severity !== "SAFE").length,
      vulnerabilities,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[aegis-appsec/audit error]", err);
    return NextResponse.json({ error: err.message || "Audit failed" }, { status: 500 });
  }
}
