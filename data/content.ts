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
 * Update GitHub / LinkedIn URLs if your handles differ.
 */
export const siteContent: SiteContent = {
  name: "Abdul Nabi",
  title: "Abdul Nabi — Full-Stack Developer & Pentester",
  tagline:
    "Full-stack developer and pentester building clear product UIs and performing web application security assessments.",
  email: "abdulnabi.khaskhely@gmail.com",
  location: "Karachi, Sindh, Pakistan",
  availability: "Open to full-time engineering / security roles and focused freelance projects",
  portraitUrl: "/profile.jpg",
  portraitAlt: "Professional portrait of Abdul Nabi",
  resumeUrl: "/ab_resume.pdf",
  navLinks: [
    { label: "About", href: "/#about" },
    { label: "Work", href: "/#projects" },
    { label: "Stack", href: "/#stack" },
    { label: "Experience", href: "/#experience" },
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
      href: "https://linkedin.com/in/abdul-nabi-95391a3b0",
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
    greeting: "Pentester & Full-Stack Developer",
    name: "Abdul Nabi",
    role: "I build secure web applications and analyze product interfaces for logic vulnerabilities.",
    description:
      "I work with Next.js, TypeScript, and modern security toolkits. I focus on shipping high-performance product interfaces while ensuring proper data-model validation and endpoint authorization.",
    focusLine: "Next.js · TypeScript · Penetration Testing · AppSec · Tailwind",
    ctaPrimary: { label: "View selected work", href: "/#projects" },
    ctaSecondary: { label: "Get in touch", href: "/#contact" },
  },
  about: {
    title: "About",
    paragraphs: [
      "I'm a full-stack developer with 1+ years building product-facing web apps. I enjoy the space where UI craft meets practical engineering — component systems, App Router patterns, and APIs that are easy to reason about.",
      "I care about shipping work that holds up in review: clear requirements, honest trade-offs, solid loading/error states, and code teammates can extend without guesswork.",
      "I'm looking for teams where I can own features, learn from strong peers, and keep raising the quality of what I ship.",
    ],
    stats: [
      { label: "Years building web products", value: "1+" },
      { label: "Focus", value: "Product UI" },
      { label: "Primary stack", value: "Next.js" },
    ],
  },
  skills: [
    {
      title: "Frontend & UI",
      skills: [
        "React",
        "Next.js (App Router)",
        "TypeScript",
        "Tailwind CSS",
        "Accessible UI",
        "Responsive design",
      ],
    },
    {
      title: "Backend & Data",
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
      "Four projects that show different problems: product UI, commerce, AI assist, and internal tooling.",
  },
  projects: [
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
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
      status: "case-study",
      statusLabel: "Case study · UI + data model",
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
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=80",
      status: "case-study",
      statusLabel: "Case study · Commerce UI",
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
      image:
        "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=1400&q=80",
      status: "in-progress",
      statusLabel: "In progress · Demo on request",
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
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
      status: "case-study",
      statusLabel: "Case study · Internal tool",
      featured: true,
      year: "2024",
    },
  ],
  experience: [
    {
      id: "exp-1",
      role: "Full-Stack Developer",
      company: "Product & client projects",
      location: "Remote",
      period: "2024 — Present",
      description:
        "Building and shipping full-stack web features with Next.js and TypeScript for product and client work.",
      highlights: [
        "Owned feature slices across UI, API routes, and data access for small product surfaces",
        "Collaborated with design on component consistency, empty states, and responsive polish",
        "Improved maintainability through typed models, clear folder structure, and practical performance checks",
      ],
    },
    {
      id: "exp-2",
      role: "Junior Full-Stack Developer",
      company: "Learning projects & freelance",
      location: "Remote",
      period: "2023 — 2024",
      description:
        "Grew from focused frontend work into full-stack delivery through applied projects and freelance tasks.",
      highlights: [
        "Shipped responsive marketing and app UIs with accessibility and SEO basics in mind",
        "Practiced REST APIs, auth flows, and PostgreSQL-backed features on real briefs",
        "Built a habit of writing readable PRs and documenting decisions for collaborators",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "Computer Science studies",
      institution: "Formal coursework + self-directed product builds",
      location: "—",
      period: "Ongoing foundation",
      description:
        "Core CS fundamentals paired with continuous practice building production-style web apps.",
      highlights: [
        "Applied projects in React/Next.js, APIs, and databases",
        "Focus on clean architecture and user-facing quality",
      ],
    },
  ],
  contact: {
    title: "Let's talk about the role or project",
    description:
      "Hiring managers and founders: if you need a full-stack developer who ships UI + API work with care, send a short note with context and timeline.",
    responseTime: "Typical response time: 1–2 business days",
    formNote:
      "Include role type (full-time / contract), stack, and timeline if you can — it helps me reply with something useful.",
  },
  blog: [],
  footer: {
    note: "Built with Next.js, TypeScript, and Tailwind. Honest work over hype.",
  },
};

export function getFeaturedProjects(): Project[] {
  return siteContent.projects.filter((p) => p.featured);
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return siteContent.blog.find((post) => post.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return siteContent.blog.map((post) => post.slug);
}

export function getActiveSocials(): SocialLink[] {
  return siteContent.socials.filter((s) => {
    if (s.icon === "email") {
      return s.href.startsWith("mailto:") && !s.href.includes("example.com");
    }
    if (s.icon === "whatsapp") {
      return s.href.includes("wa.me/") && s.href.length > 20;
    }
    try {
      const u = new URL(s.href);
      const path = u.pathname.replace(/\/$/, "");
      return path.length > 0;
    } catch {
      return false;
    }
  });
}
