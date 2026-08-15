export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: "github" | "linkedin" | "twitter" | "email" | "whatsapp";
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export type ProjectStatus = "live" | "github" | "case-study" | "in-progress";

export interface Project {
  id: string;
  title: string;
  description: string;
  problem: string;
  role: string;
  outcome: string;
  tags: string[];
  image?: string;
  liveUrl?: string;
  githubUrl?: string;
  /** Honest project status when no live demo exists */
  status: ProjectStatus;
  statusLabel: string;
  featured: boolean;
  year: string;
  published?: boolean;
  appreciations?: number;
  // Expanded Case Study Details
  architecture?: string;
  implementation?: string;
  results?: string;
  contribution?: string;
  challenges?: string;
  privateExplanation?: string;
  screenshots?: { url: string; caption: string }[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  description: string;
  highlights: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  period: string;
  description: string;
  highlights?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  tags: string[];
  coverImage?: string;
  published?: boolean;
  helpfulCount?: number;
  notHelpfulCount?: number;
  ratingSum?: number;
  ratingCount?: number;
}

export interface SiteContent {
  name: string;
  title: string;
  tagline: string;
  email: string;
  location: string;
  availability: string;
  /** Single professional portrait used once (hero) */
  portraitUrl: string;
  portraitAlt: string;
  resumeUrl?: string;
  navLinks: NavLink[];
  socials: SocialLink[];
  hero: {
    greeting: string;
    name: string;
    role: string;
    description: string;
    focusLine: string;
    ctaPrimary: { label: string; href: string };
    ctaSecondary: { label: string; href: string };
  };
  about: {
    title: string;
    paragraphs: string[];
    stats: { label: string; value: string }[];
  };
  skills: SkillCategory[];
  projectsIntro: {
    title: string;
    subtitle: string;
  };
  projects: Project[];
  experience: ExperienceItem[];
  education: EducationItem[];
  contact: {
    title: string;
    description: string;
    responseTime: string;
    formNote: string;
  };
  blog: BlogPost[];
  footer: {
    note: string;
  };
}

/**
 * PROFILE — early-career, interview-defensible positioning.
 */
export const siteContent: SiteContent = {
  name: "Abdul Nabi",
  title: "Abdul Nabi — Full-Stack Developer · Data & ML (Learning AppSec)",
  tagline:
    "Full-stack developer building clean Next.js apps, REST APIs, and ML models — with a strong specialization in Application Security (AppSec).",
  email: "abdulnabi.khaskhely@gmail.com",
  location: "Karachi, Sindh, Pakistan",
  availability: "Open to full-time engineering / security roles and focused freelance projects",
  portraitUrl: "/profile.jpg",
  portraitAlt: "Professional portrait of Abdul Nabi",
  resumeUrl: "/resume",
  navLinks: [
    { label: "About", href: "/#about" },
    { label: "Stack", href: "/#stack" },
    { label: "Work", href: "/#projects" },
    { label: "Mini Projects", href: "/mini-projects" },
    { label: "Experience", href: "/#experience" },
    { label: "Achievements", href: "/#achievements" },
    { label: "Dev Labs", href: "/#games" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/#contact" },
  ],
  socials: [
    {
      label: "GitHub",
      href: "https://github.com/abdulnabii",
      icon: "github",
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/abdulnabi-khaskheli",
      icon: "linkedin",
    },
    {
      label: "WhatsApp",
      href: "https://wa.me/923093751434",
      icon: "whatsapp",
    },
    {
      label: "Email",
      href: "mailto:abdulnabi.khaskhely@gmail.com",
      icon: "email",
    },
  ],
  hero: {
    greeting: "Full-Stack Developer · Data & ML · AppSec Engineer",
    name: "Abdul Nabi",
    role: "Clean Next.js apps, REST APIs & ML workflows — built with security awareness.",
    description:
      "I build web products with Next.js, TypeScript, and modern APIs. Outside web engineering, I train ML models in Python (like my Blood Sugar Tracker FYP) and build Application Security (AppSec) tooling.",
    focusLine: "Next.js · TypeScript · Python · ML Training · AppSec & DevSecOps",
    ctaPrimary: { label: "View selected work", href: "/#projects" },
    ctaSecondary: { label: "Get in touch", href: "/#contact" },
  },
  about: {
    title: "About",
    paragraphs: [
      "I'm a full-stack developer with 2+ years of experience building web applications. My core engineering focus spans responsive Next.js interfaces, RESTful backends, and data/ML projects in Python.",
      "I specialize in Application Security (AppSec) — continuously building awareness around OWASP Top 10 guidelines, safe authentication, proper authorization, and secure coding practices.",
      "Alongside web work, I bring practical experience in data analysis and machine learning — from data cleaning with Pandas to training regression models (such as my ElasticNet Blood Sugar Tracker FYP).",
      "I'm looking for engineering teams where I can build quality software, expand my technical skillset, and continue learning security and full-stack best practices.",
    ],
    stats: [
      { label: "Years building web products", value: "2+" },
      { label: "Primary identity", value: "Full-Stack Developer" },
      { label: "Core Competencies", value: "Full-Stack & AppSec" },
    ],
  },
  skills: [
    {
      title: "Frontend & UI",
      skills: [
        "Web Development",
        "React",
        "Next.js (App Router)",
        "TypeScript",
        "Tailwind CSS",
        "Accessible UI",
        "Responsive design",
      ],
    },
    {
      title: "Backend & APIs",
      skills: [
        "Node.js",
        "REST APIs",
        "PostgreSQL",
        "Supabase",
        "Prisma",
        "Auth patterns",
      ],
    },
    {
      title: "AppSec & DevSecOps",
      skills: [
        "OWASP Top 10",
        "Auth & RBAC design",
        "SQL injection testing",
        "XSS / CSRF awareness",
        "Supabase RLS policies",
        "Security code review",
      ],
    },
    {
      title: "Data & ML",
      skills: [
        "Python",
        "Pandas",
        "Data analysis",
        "ML model training",
        "Data storytelling",
        "Jupyter notebooks",
      ],
    },
    {
      title: "Delivery",
      skills: [
        "Git / GitHub",
        "Vercel",
        "Code review habits",
        "Performance basics",
        "Figma handoff",
        "Writing clear docs",
      ],
    },
  ],
  projectsIntro: {
    title: "Selected work",
    subtitle:
      "Five featured full-stack builds and real-world engineering systems — each demonstrating a distinct architecture, threat model, and technical implementation.",
  },
  projects: [
    {
      id: "aegis-appsec",
      title: "Aegis AppSec Sentinel",
      description:
        "Live full-stack DevSecOps platform featuring real-time OWASP Top 10 API vulnerability auditing, cryptographic JWT token inspection, and Supabase Row-Level Security (RLS) policy simulation.",
      problem:
        "Modern Next.js & Supabase applications suffer from silent security misconfigurations, unparameterized query injections, and insecure JWT verification defaults.",
      role: "Architected the full-stack AppSec auditor, created heuristic vulnerability scanners, implemented JWT cryptanalysis, and built the PostgreSQL RLS policy simulator.",
      outcome:
        "Delivered an interactive, production-grade security auditing suite that identifies critical vulnerabilities in real-time and generates hardened code fixes.",
      tags: ["Next.js 14", "TypeScript", "AppSec", "OWASP Top 10", "Supabase RLS", "JWT Crypto"],
      image: "/projects/ops.jpg",
      githubUrl: "https://github.com/abdulnabii/abdul-nabi-portfolio/tree/main/app/projects/aegis-appsec",
      liveUrl: "https://www.aiwithab.site/projects/aegis-appsec",
      status: "live",
      statusLabel: "Live Full-Stack App",
      featured: true,
      year: "2025",
    },
    {
      id: "aurora-dashboard",
      title: "Aurora Analytics",
      description:
        "Multi-tenant analytics workspace for product teams who need clear metrics without a heavy BI tool.",
      problem:
        "Teams tracked numbers across spreadsheets and disconnected dashboards, with no shared tenant model or consistent UI patterns.",
      role: "Built the Next.js app shell, data views, and basic RBAC-aware navigation end to end.",
      outcome:
        "Delivered a working multi-tenant dashboard prototype with reusable chart widgets and role-aware layouts ready for real data wiring.",
      tags: ["Next.js", "TypeScript", "Supabase", "Charts"],
      image: "/projects/aurora.jpg",
      githubUrl: "https://github.com/abdulnabii/abdul-nabi-portfolio/tree/main/app/projects/aurora-dashboard",
      status: "case-study",
      statusLabel: "Open Source Concept Build",
      featured: true,
      year: "2025",
    },
    {
      id: "nova-commerce",
      title: "Nova Commerce",
      description:
        "Headless storefront focused on product storytelling and a clean mobile checkout path.",
      problem:
        "Product pages felt slow and inconsistent; content updates required developer time for simple merchandising changes.",
      role: "Implemented product/collection templates, performance-minded layouts, and checkout UI integration points.",
      outcome:
        "Shipped a content-friendly storefront structure with clearer product hierarchy and faster perceived load on key templates.",
      tags: ["Next.js", "Stripe", "CMS", "Tailwind"],
      image: "/projects/nova.jpg",
      githubUrl: "https://github.com/abdulnabii/abdul-nabi-portfolio/tree/main/app/projects/nova-commerce",
      status: "case-study",
      statusLabel: "Open Source Concept Build",
      featured: true,
      year: "2025",
    },
    {
      id: "pulse-chat",
      title: "Pulse Support Chat",
      description:
        "Embeddable support chat UI with streaming replies and knowledge-base-ready scaffolding.",
      problem:
        "Support teams needed an in-product assistant surface that felt native — without inventing answers in the UI layer.",
      role: "Designed the chat interface, conversation states, and client/API contract for streaming messages.",
      outcome:
        "Built a reusable widget with solid empty/loading/error states and a clean path to plug in a real model provider.",
      tags: ["React", "Node.js", "Streaming", "UX"],
      image: "/projects/pulse.jpg",
      githubUrl: "https://github.com/abdulnabii/abdul-nabi-portfolio/tree/main/app/projects/pulse-chat",
      status: "case-study",
      statusLabel: "Open Source Concept Build",
      featured: true,
      year: "2025",
    },
    {
      id: "signal-ops",
      title: "Ops status console",
      description:
        "Lightweight internal console for deploy health and incident visibility during handoffs.",
      problem:
        "Status lived in chat threads; engineers needed one calm place to scan service state.",
      role: "Built authenticated status views and a simple ops-oriented UI for scanability.",
      outcome:
        "Delivered a focused console layout that reduces context-switching during on-call handoffs.",
      tags: ["Next.js", "PostgreSQL", "Auth"],
      image: "/projects/ops.jpg",
      githubUrl: "https://github.com/abdulnabii/abdul-nabi-portfolio/tree/main/app/projects/signal-ops",
      status: "case-study",
      statusLabel: "Open Source Concept Build",
      featured: true,
      year: "2024",
    },
  ],
  experience: [
    {
      id: "exp-1",
      role: "Full-Stack Developer · Web & Data",
      company: "Product & client projects",
      location: "Remote",
      period: "2024 — Present",
      description:
        "Building and shipping full-stack web features with Next.js and TypeScript, with a strong focus on application security patterns and practical data work.",
      highlights: [
        "Owned feature slices across UI, API routes, and data access — including authentication, RBAC, and Supabase RLS policy definitions",
        "Performed application security reviews on REST APIs and Next.js routes, identifying and resolving authorization logic gaps",
        "Built responsive interfaces with Tailwind CSS, focusing on semantic markup, accessible forms, and clean mobile layouts",
        "Integrated AI/ML capabilities into web applications, including Gemini-powered analysis tools and scikit-learn regression models",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "BS in Computer Science",
      institution: "University of Sindh",
      location: "Jamshoro, Sindh, Pakistan",
      period: "2022 — 2026",
      description:
        "Graduated in 2026 with a focus on Software Engineering, Database Systems, Web Technologies, Application Security, and Machine Learning. Final Year Project: ML-powered Blood Sugar Tracker with ElasticNet regression.",
    },
  ],
  contact: {
    title: "Get in touch",
    description:
      "I'm open to full-time roles, contract work, and application security consulting. The fastest way to reach me is email or WhatsApp.",
    responseTime: "I usually reply within 1–2 business days.",
    formNote:
      "Send a message using the form below or email me directly at abdulnabi.khaskhely@gmail.com.",
  },
  blog: [],
  footer: {
    note: "Designed and built with Next.js, TypeScript, and Tailwind CSS. Hosted on Vercel with Cloudflare DNS.",
  },
};

/** Helpers */
export function getActiveSocials(): SocialLink[] {
  return siteContent.socials.filter((s) => s.href && s.href.length > 0);
}
