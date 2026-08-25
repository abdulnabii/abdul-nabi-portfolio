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
  hidden?: boolean;
  createdAt?: string;
}

export const INITIAL_MINI_PROJECTS: MiniProject[] = [
  {
    id: "mini-01",
    dayNumber: 1,
    title: "AI Symptom Checker & Triage Assistant",
    category: "Healthcare AI",
    description: "Conversational medical NLP symptom evaluator with WHO risk level classification, possible conditions confidence score, and emergency triage recommendations.",
    vercelUrl: "https://day-01-ai-symptom-checker.vercel.app",
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
    vercelUrl: "https://day-02-code-review-bot.vercel.app",
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
    vercelUrl: "https://day-03-smart-resume-builder.vercel.app",
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
    vercelUrl: "https://day-04-diabetes-risk-predictor.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-04-diabetes-predictor",
    tags: ["Python Flask", "scikit-learn", "Chart.js", "Next.js 14"],
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
    vercelUrl: "https://day-05-ai-meeting-summarizer.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-05-meeting-summarizer",
    tags: ["Whisper API", "Gemini 1.5 Flash", "Next.js 14", "TailwindCSS"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-08T00:00:00Z",
  },
  {
    id: "mini-06",
    dayNumber: 6,
    title: "Real-Time Stock Dashboard & Sentiment",
    category: "FinTech & Data",
    description: "Live WebSocket trading dashboard featuring technical indicators (RSI, MACD), portfolio tracker, and AI sentiment analysis of financial news headlines.",
    vercelUrl: "https://day-06-stock-dashboard.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-06-stock-dashboard",
    tags: ["WebSockets", "Recharts", "FinNHub API", "TailwindCSS"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-08T00:00:00Z",
  },
  {
    id: "mini-07",
    dayNumber: 7,
    title: "AI Logo Generator & Brand Identity Studio",
    category: "AI Creative Tools",
    description: "AI brand vector generator creating custom SVG logos, color mood palettes, typography pairings, and downloadable brand guideline asset packages.",
    vercelUrl: "https://day-07-ai-logo-generator.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-07-ai-logo-generator",
    tags: ["Next.js 16", "Replicate API", "SVG Canvas", "TailwindCSS"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-11T00:00:00Z",
  },
  {
    id: "mini-08",
    dayNumber: 8,
    title: "Smart Expense Tracker & AI Receipt Scanner",
    category: "FinTech & OCR AI",
    description: "Automated personal finance tracker extracting line items from receipt photos via OCR, auto-categorizing expenses, and analyzing spending habits with an AI financial coach.",
    vercelUrl: "https://day-08-smart-expense-tracker.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-08-smart-expense-tracker",
    tags: ["Tesseract OCR", "Gemini 1.5 Flash", "Recharts", "Next.js 16"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-11T00:00:00Z",
  },
  {
    id: "mini-09",
    dayNumber: 9,
    title: "GitHub Profile Visual Analyzer & Impact Card",
    category: "Developer Tools",
    description: "Visual developer metric dashboard calculating language proficiency radar, commit heatmaps, repository impact scores, and shareable developer cards.",
    vercelUrl: "https://day-09-github-profile-analyzer.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-09-github-profile-analyzer",
    tags: ["Next.js 16", "GitHub REST API", "Recharts", "TailwindCSS"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-12T00:00:00Z",
  },
  {
    id: "mini-10",
    dayNumber: 10,
    title: "AI Email Composer & Subject Line Optimizer",
    category: "AI Productivity",
    description: "Multi-tone AI email generator with tone selector (formal, casual, persuasive), A/B email variation generator, and open-rate predictor.",
    vercelUrl: "https://day-10-ai-email-composer.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-10-ai-email-composer",
    tags: ["Next.js 16", "Gemini 1.5 Flash", "Framer Motion", "TailwindCSS"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-12T00:00:00Z",
  },
  {
    id: "mini-11",
    dayNumber: 11,
    title: "Medical Image Classifier & Diagnostic Assistant",
    category: "Healthcare AI",
    description: "Browser-based computer vision web application for classifying diagnostic medical scans (Chest X-ray pneumonia vs normal, skin lesion benign vs malignant) with Grad-CAM heatmap overlay.",
    vercelUrl: "https://day-11-medical-image-classifier.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-11-medical-image-classifier",
    tags: ["TensorFlow.js", "Computer Vision", "Next.js 16", "Grad-CAM"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-12",
    dayNumber: 12,
    title: "AI Coding Interview Coach & Simulator",
    category: "AI EdTech",
    description: "Interactive technical coding interview simulator providing real-time problem presentation, progressive hint generation, time/space complexity analysis, and communication quality scoring.",
    vercelUrl: "https://day-12-coding-interview-coach.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-12-coding-interview-coach",
    tags: ["Next.js 16", "Gemini 1.5 Pro", "Monaco Editor", "TailwindCSS"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-13",
    dayNumber: 13,
    title: "Personal Finance AI & Health Dashboard",
    category: "FinTech & Data",
    description: "Financial health analytics platform evaluating bank statement CSV exports to compute net worth trajectory, monthly burn rate, 12-month projections, and debt payoff optimization.",
    vercelUrl: "https://day-13-personal-finance-ai.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-13-personal-finance-ai",
    tags: ["PapaParse", "Recharts", "Gemini 1.5 Flash", "Next.js 16"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-14",
    dayNumber: 14,
    title: "AI Language Flashcard & Spaced Repetition App",
    category: "AI EdTech",
    description: "Language acquisition platform using SuperMemo SM-2 spaced-repetition algorithms with contextual sentence generation, Web Speech audio pronunciation, and gamified streak tracking.",
    vercelUrl: "https://day-14-language-flashcard-ai.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-14-language-flashcard-ai",
    tags: ["SM-2 Algorithm", "Web Speech API", "Next.js 16", "Framer Motion"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-15",
    dayNumber: 15,
    title: "AI-Powered Blog SEO & Readability Auditor",
    category: "Developer Tools",
    description: "Comprehensive blog SEO auditor computing Flesch-Kincaid readability scores, keyword density distribution, meta description optimization, and heading structural hierarchy.",
    vercelUrl: "https://day-15-blog-seo-optimizer.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-15-blog-seo-optimizer",
    tags: ["NLP Engine", "Gemini 1.5 Pro", "Next.js 16", "TailwindCSS"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-16",
    dayNumber: 16,
    title: "Cloud Architecture AI Studio & Admin Site",
    category: "Cloud / DevOps & Admin",
    description: "Enterprise cloud architecture generator & SPOF reliability auditor with real-time multi-cloud topology diagrams, Terraform/IaC synthesis, and monthly cost estimation.",
    vercelUrl: "https://day-16-cloud-architecture-ai.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-16-cloud-architecture-ai",
    tags: ["Next.js 16", "React Flow", "Terraform / IaC", "Gemini 1.5 Pro", "TailwindCSS"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-19T00:00:00Z",
  },
  {
    id: "mini-17",
    dayNumber: 17,
    title: "Smart Job Application & Outreach Tracker",
    category: "AI Productivity",
    description: "Kanban job application management board with automated follow-up reminders, cold email outreach generator, and recruiter response tracking.",
    vercelUrl: "https://day-17-job-application-tracker.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-17-job-tracker",
    tags: ["Next.js 16", "dnd-kit", "Supabase", "TailwindCSS"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-18",
    dayNumber: 18,
    title: "AI Mental Health & Emotion Tracking Journal",
    category: "Healthcare AI",
    description: "Encrypted daily reflection journal utilizing sentiment analysis to map mood trends, cognitive distortion detection, and personalized mindfulness suggestions.",
    vercelUrl: "https://day-18-mental-health-journal.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-18-mental-health-journal",
    tags: ["Next.js 16", "Vader Sentiment", "AES-256", "Recharts"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-19",
    dayNumber: 19,
    title: "Real-Time Collaborative Canvas & Whiteboard",
    category: "Developer Tools",
    description: "Multi-user vector drawing whiteboard supporting live cursor tracking, shape tools, real-time WebSocket sync, and SVG asset export.",
    vercelUrl: "https://day-19-collaborative-whiteboard.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-19-collaborative-whiteboard",
    tags: ["HTML5 Canvas", "WebSockets", "Liveblocks", "Next.js 16"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-20",
    dayNumber: 20,
    title: "AI Meal & Personal Nutrition Planner",
    category: "Healthcare AI",
    description: "Personalized dietary planning app generating weekly macronutrient balance, automated grocery shopping lists, and AI recipe adaptation based on dietary constraints.",
    vercelUrl: "https://day-20-ai-nutrition-planner.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-20-nutrition-planner",
    tags: ["Next.js 16", "Gemini 1.5 Flash", "Spoonacular API", "TailwindCSS"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-21",
    dayNumber: 21,
    title: "Distributed API Load Testing Dashboard",
    category: "DevOps & Testing",
    description: "Performance load testing suite executing concurrency stress tests against REST/GraphQL endpoints with real-time latency graphs and status code telemetry.",
    vercelUrl: "https://day-21-api-load-testing-dashboard.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-21-load-testing-dashboard",
    tags: ["Next.js 16", "Worker Threads", "Chart.js", "TailwindCSS"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-22",
    dayNumber: 22,
    title: "AI Legal Document & Contract Analyzer",
    category: "LegalTech & NLP",
    description: "Contract analysis engine identifying risk clauses, non-compete duration, indemnity liabilities, and key renewal deadlines from PDF agreements.",
    vercelUrl: "https://day-22-legal-document-analyzer.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-22-legal-document-analyzer",
    tags: ["PDF.js", "Gemini 1.5 Pro", "Next.js 16", "TailwindCSS"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-23",
    dayNumber: 23,
    title: "IoT Smart Home Energy & Device Dashboard",
    category: "IoT & Hardware",
    description: "Interactive smart home telemetry console tracking kilowatt power consumption, temperature sensors, automated lighting schedules, and device health.",
    vercelUrl: "https://day-23-smart-home-dashboard.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-23-smart-home-dashboard",
    tags: ["MQTT Protocol", "Recharts", "Next.js 16", "Framer Motion"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-24",
    dayNumber: 24,
    title: "Open-Source Discovery & Impact Engine",
    category: "Developer Tools",
    description: "GitHub repository recommendation tool analyzing developer skill stacks to surface trending open-source projects seeking first-time contributors.",
    vercelUrl: "https://day-24-opensource-discovery-engine.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-24-opensource-discovery-engine",
    tags: ["GitHub REST API", "Algolia Search", "Next.js 16", "TailwindCSS"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-25",
    dayNumber: 25,
    title: "Multi-Channel AI Content Studio & Copywriter",
    category: "AI Productivity",
    description: "Unified social publishing engine transforming long-form blog posts into optimized LinkedIn articles, Twitter/X threads, and Reddit discussions.",
    vercelUrl: "https://day-25-ai-content-studio.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-25-ai-content-studio",
    tags: ["Next.js 16", "Gemini 1.5 Flash", "LinkedIn API", "TailwindCSS"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-26",
    dayNumber: 26,
    title: "Medical Prescription & Medication Reminder Bot",
    category: "Healthcare AI",
    description: "Patient compliance web app parsing prescription bottle labels via OCR, scheduling dosage notifications, and warning of potential drug-drug interactions.",
    vercelUrl: "https://day-26-medication-reminder-system.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-26-medication-reminder-system",
    tags: ["Tesseract OCR", "RxNorm API", "Next.js 16", "PWA Web Push"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-27",
    dayNumber: 27,
    title: "AI Natural Language Database Query Builder",
    category: "Data & SQL AI",
    description: "SQL query generator converting plain English questions into optimized PostgreSQL/MySQL queries with schema visualization and safety validation.",
    vercelUrl: "https://day-27-ai-database-query-builder.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-27-ai-database-query-builder",
    tags: ["Next.js 16", "Gemini 1.5 Pro", "SQL Parser", "Monaco Editor"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-28",
    dayNumber: 28,
    title: "Interactive 3D WebGL Data Visualization Terminal",
    category: "Data Science",
    description: "3D particle matrix visualizer rendering multi-dimensional data clusters, PCA dimensional reduction, and interactive camera orbital controls in WebGL.",
    vercelUrl: "https://day-28-3d-data-visualization.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-28-3d-data-visualization",
    tags: ["Three.js", "React Three Fiber", "WebGL", "Next.js 16"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-29",
    dayNumber: 29,
    title: "DevOps Incident Responder & Log Diagnostics Bot",
    category: "DevOps & Systems",
    description: "Automated root cause analysis tool inspecting Kubernetes server log streams to identify stack trace exceptions, memory pressure, and deployment failures.",
    vercelUrl: "https://day-29-devops-incident-assistant.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-29-devops-incident-assistant",
    tags: ["Next.js 16", "Gemini 1.5 Pro", "RegEx Parser", "TailwindCSS"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
  },
  {
    id: "mini-30",
    dayNumber: 30,
    title: "Production AI SaaS Starter Boilerplate",
    category: "SaaS Framework",
    description: "Production-ready full-stack AI SaaS template featuring Supabase Auth, Stripe subscription billing, rate-limited API routes, and glassmorphism design system.",
    vercelUrl: "https://day-30-ai-saas-boilerplate.vercel.app",
    githubUrl: "https://github.com/abdulnabii/mini-projects/tree/main/day-30-ai-saas-boilerplate",
    tags: ["Next.js 16", "Stripe Billing", "Supabase Auth", "TypeScript"],
    status: "Live",
    featured: true,
    createdAt: "2026-08-13T00:00:00Z",
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
        const map = new Map<number, MiniProject>();
        parsed.forEach((p) => map.set(p.dayNumber, p));

        // Auto-merge any missing days from INITIAL_MINI_PROJECTS
        INITIAL_MINI_PROJECTS.forEach((initP) => {
          if (!map.has(initP.dayNumber)) {
            map.set(initP.dayNumber, initP);
          }
        });

        memoryMiniProjects = Array.from(map.values()).map((p) => {
          return {
            ...p,
            status: p.status || "Live",
            hidden: Boolean(p.hidden),
            vercelUrl: p.vercelUrl || `https://day-${String(p.dayNumber).padStart(2, "0")}-project.vercel.app`,
            githubUrl: p.githubUrl || `https://github.com/abdulnabii/mini-projects/tree/main/day-${String(p.dayNumber).padStart(2, "0")}`,
          };
        });
        return memoryMiniProjects.sort((a, b) => a.dayNumber - b.dayNumber);
      }
    }
  } catch (err) {
    console.error("[getMiniProjects] Exception:", err);
  }

  // Fallback to initial 30 items
  memoryMiniProjects = [...INITIAL_MINI_PROJECTS];
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
