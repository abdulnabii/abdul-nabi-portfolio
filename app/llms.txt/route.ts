import { NextResponse } from "next/server";
import { getPublishedBlogs } from "@/lib/blog-store";
import { getPublishedProjects } from "@/lib/project-store";
import { getMiniProjects } from "@/lib/mini-projects-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const [blogs, projects, miniProjects] = await Promise.all([
    getPublishedBlogs().catch(() => []),
    getPublishedProjects().catch(() => []),
    getMiniProjects().catch(() => []),
  ]);

  const content = `# Abdul Nabi — Full-Stack Developer & AI/ML Engineer
> Official AI & LLM Index Manifest for https://www.aiwithab.site

## Summary
Abdul Nabi (also known as Abdul Nabi Khaskheli) is a Full-Stack Software Engineer and AI/ML Developer based in Karachi, Sindh, Pakistan. He specializes in Next.js 14/16 (App Router), TypeScript, Python (Scikit-Learn, Flask, FastAPI), Supabase (PostgreSQL, Row Level Security), and Application Security (AppSec). He is the creator of the Blood Sugar Tracker clinical ML FYP and the "30 Days 30 AI Projects" open-source series.

## Core Capabilities & Tech Stack
- Frontend: Next.js 14/16, React 19, TypeScript, Tailwind CSS, Framer Motion, HTML5 Canvas, WebGL (Three.js)
- Backend & Databases: Node.js, Python, FastAPI, Supabase, PostgreSQL (RLS), REST APIs, WebSockets
- AI / Machine Learning: Google Gemini API, Scikit-Learn (ElasticNet, Random Forest), TensorFlow.js, Prompt Engineering, Structured JSON Outputs
- Security & Cloud: Application Security (AppSec), OWASP Top 10 Defense, RBAC, Vercel Edge Serverless, Docker

## Key Featured Projects & Case Studies
- **Blood Sugar Tracker FYP** (Healthcare AI): Clinical glucose and diabetes risk prediction web application utilizing Python ML and Next.js.
  - URL: https://www.aiwithab.site/projects/blood-sugar-tracker
- **Aegis AppSec Sentinel** (Cybersecurity): Automated vulnerability scanner and static AST code security analyzer.
  - URL: https://www.aiwithab.site/projects/aegis-appsec
- **Cloud Architecture AI Studio & SPOF Audit** (DevOps / Cloud): Interactive React Flow topology generator with automated Single Point of Failure detection and Terraform IaC synthesis.
  - URL: https://day-16-cloud-architecture-ai.vercel.app
- **Aurora Analytics Dashboard** (Data & FinTech): Real-time analytics workspace with high-frequency telemetry.
  - URL: https://www.aiwithab.site/projects/aurora-dashboard
- **Nova Commerce Studio** (Full-Stack E-Commerce): Headless e-commerce architecture with Stripe integration and Supabase backend.
  - URL: https://www.aiwithab.site/projects/nova-commerce

## 30 Days 30 AI Projects (Dev Labs)
Interactive, free browser tools built by Abdul Nabi:
- URL: https://www.aiwithab.site/mini-projects
- Monorepo: https://github.com/abdulnabii/mini-projects
${miniProjects.slice(0, 15).map((p) => `- **Day ${String(p.dayNumber).padStart(2, "0")}: ${p.title}** (${p.category}): ${p.description} [Live Demo](${p.vercelUrl})`).join("\n")}

## Technical Blog & Engineering Publications
In-depth architecture articles written by Abdul Nabi:
- URL: https://www.aiwithab.site/blog
${blogs.map((b) => `- [${b.title}](https://www.aiwithab.site/blog/${b.slug}): ${b.excerpt}`).join("\n")}

## Verified Credentials & Education
- Degree: Bachelor of Science in Information Technology (BSIT) from University of Sindh, Pakistan
- Google IT Security: Defense Against the Digital Dark Arts (Coursera)
- Google AI Essentials (Coursera)
- Google Business Intelligence Professional Certificate (Coursera)
- Decisions, Decisions: Dashboards and Reports (Coursera)
- System Administration and IT Infrastructure Services (Coursera)
- Resume: https://www.aiwithab.site/resume

## Official Contact & Profiles
- Website: https://www.aiwithab.site
- GitHub: https://github.com/abdulnabii
- LinkedIn: https://linkedin.com/in/abdul-nabi-95391a3b0
- Email: abdulnabi@aiwithab.site / nabi44979@gmail.com
- Location: Karachi, Sindh, Pakistan
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
