import { supabaseDbQuery, supabaseDbUpsert } from "./supabase";

export interface MiniProject {
  id: string;
  dayNumber: number;
  title: string;
  category: string;
  description: string;
  vercelUrl: string;
  githubUrl?: string;
  tags: string[];
  status: "Live" | "In Progress" | "Planned";
  featured?: boolean;
  createdAt?: string;
}

export const INITIAL_MINI_PROJECTS: MiniProject[] = [
  {
    id: "mini-01",
    dayNumber: 1,
    title: "AI Symptom Checker & Triage Assistant",
    category: "Healthcare AI",
    description: "Conversational medical NLP symptom evaluator with WHO risk level classification, possible conditions confidence score, and emergency triage recommendations.",
    vercelUrl: "https://ai-symptom-checker.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-01-ai-symptom-checker",
    tags: ["Next.js 14", "Gemini 1.5 Pro", "TailwindCSS", "Framer Motion"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-08T00:00:00Z",
  },
  {
    id: "mini-02",
    dayNumber: 2,
    title: "AI Code Review & Security Audit Bot",
    category: "Developer Tools",
    description: "Automated static code security auditor that scans pull requests for OWASP vulnerabilities, memory leaks, and performance bottlenecks.",
    vercelUrl: "https://code-review-bot.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-02-code-review-bot",
    tags: ["Next.js 14", "Claude 3.5 API", "AST Parser", "TypeScript"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-08T00:00:00Z",
  },
  {
    id: "mini-03",
    dayNumber: 3,
    title: "Smart AI Resume Builder & ATS Optimizer",
    category: "AI Productivity",
    description: "ATS keyword optimizer and instant resume builder that converts raw work history into high-scoring PDF resumes tailored to target job descriptions.",
    vercelUrl: "https://smart-resume-builder.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-03-smart-resume-builder",
    tags: ["Next.js 14", "PDFKit", "Gemini AI", "TailwindCSS"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-08T00:00:00Z",
  },
  {
    id: "mini-04",
    dayNumber: 4,
    title: "Diabetes & Glucose Risk Predictor",
    category: "Healthcare ML",
    description: "ML health application evaluating patient vitals (glucose, BMI, blood pressure, insulin) to predict diabetes risk probability with scikit-learn ElasticNet.",
    vercelUrl: "https://diabetes-predictor.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-04-diabetes-predictor",
    tags: ["Python Flask", "scikit-learn", "Chart.js", "Next.js"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-08T00:00:00Z",
  },
  {
    id: "mini-05",
    dayNumber: 5,
    title: "AI Meeting Summarizer & Action Extractor",
    category: "AI Productivity",
    description: "Transcript analyzer extracting executive summaries, key decisions, blockers, and assigned action items with deadlines from Zoom/Teams transcripts.",
    vercelUrl: "https://meeting-summarizer.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-05-meeting-summarizer",
    tags: ["Whisper API", "Gemini 1.5 Flash", "Next.js 14"],
    status: "Live",
    featured: false,
    createdAt: "2026-08-08T00:00:00Z",
  },
  {
    id: "mini-06",
    dayNumber: 6,
    title: "Real-Time Stock Dashboard & Sentiment",
    category: "FinTech & Data",
    description: "Live WebSocket trading dashboard featuring technical indicators (RSI, MACD), portfolio tracker, and AI sentiment analysis of financial news headlines.",
    vercelUrl: "https://stock-dashboard.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-06-stock-dashboard",
    tags: ["WebSockets", "Recharts", "FinNHub API", "TailwindCSS"],
    status: "Live",
    featured: false,
    createdAt: "2026-08-08T00:00:00Z",
  },
];

let memoryMiniProjects: MiniProject[] = [...INITIAL_MINI_PROJECTS];

export async function getMiniProjects(): Promise<MiniProject[]> {
  try {
    const rows = await supabaseDbQuery<{ key: string; value: string }>(
      "site_settings",
      "select=*&key=eq.mini_projects_data"
    );
    if (rows && rows.length > 0 && rows[0].value) {
      const parsed = JSON.parse(rows[0].value) as MiniProject[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Sanitize Vercel URLs to ensure clean Vercel links without day-XX prefixes
        memoryMiniProjects = parsed.map((p) => {
          let cleanUrl = p.vercelUrl;
          if (p.dayNumber === 1) cleanUrl = "https://ai-symptom-checker.vercel.app";
          else if (p.dayNumber === 2) cleanUrl = "https://code-review-bot.vercel.app";
          else if (p.dayNumber === 3) cleanUrl = "https://smart-resume-builder.vercel.app";
          else if (cleanUrl && (cleanUrl.includes("day-") || cleanUrl.includes("aiwithab.site"))) {
            cleanUrl = cleanUrl
              ? cleanUrl.replace(/^https:\/\/day-\d+-/, "https://").replace(".aiwithab.site", ".vercel.app")
              : "https://vercel.app";
          }
          return {
            ...p,
            vercelUrl: cleanUrl,
            githubUrl: p.githubUrl || `https://github.com/abdulnabii/mini-projects/tree/main/day-${String(p.dayNumber).padStart(2, "0")}`,
          };
        });
        return memoryMiniProjects.sort((a, b) => a.dayNumber - b.dayNumber);
      }
    }
  } catch (err) {
    console.error("[getMiniProjects] Exception:", err);
  }
  return memoryMiniProjects.sort((a, b) => a.dayNumber - b.dayNumber);
}

export async function saveMiniProjects(projects: MiniProject[]): Promise<MiniProject[]> {
  try {
    memoryMiniProjects = [...projects];
    await supabaseDbUpsert("site_settings", [
      {
        key: "mini_projects_data",
        value: JSON.stringify(projects),
        updated_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error("[saveMiniProjects] Exception:", err);
  }
  return memoryMiniProjects;
}

export async function createMiniProject(newProj: Partial<MiniProject>): Promise<MiniProject> {
  const current = await getMiniProjects();
  const created: MiniProject = {
    id: newProj.id || `mini-${Date.now()}`,
    dayNumber: newProj.dayNumber || current.length + 1,
    title: newProj.title || "New Mini Project",
    category: newProj.category || "Full-Stack Web App",
    description: newProj.description || "",
    vercelUrl: newProj.vercelUrl || "https://vercel.app",
    githubUrl: newProj.githubUrl || "",
    tags: newProj.tags || ["Next.js", "TypeScript"],
    status: newProj.status || "Live",
    featured: newProj.featured ?? false,
    createdAt: new Date().toISOString(),
  };

  const updated = [created, ...current];
  await saveMiniProjects(updated);
  return created;
}

export async function updateMiniProject(
  id: string,
  updates: Partial<MiniProject>
): Promise<MiniProject | null> {
  const current = await getMiniProjects();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return null;

  current[index] = { ...current[index], ...updates };
  await saveMiniProjects(current);
  return current[index];
}

export async function deleteMiniProject(id: string): Promise<boolean> {
  const current = await getMiniProjects();
  const filtered = current.filter((p) => p.id !== id);
  if (filtered.length === current.length) return false;

  await saveMiniProjects(filtered);
  return true;
}
