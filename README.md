<div align="center">

# ⚡ Abdul Nabi — Full-Stack Engineering Portfolio & DevSecOps Platform

[![Live Production](https://img.shields.io/badge/Production_Site-aiwithab.site-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://aiwithab.site)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.35-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<br/>

<p align="center">
  A high-performance, security-focused full-stack engineering portfolio, AppSec studio, and CMS built with <b>Next.js 14 (App Router)</b>, <b>TypeScript</b>, <b>Supabase PostgreSQL</b>, and <b>Tailwind CSS</b>.
</p>

[🌐 Live Demo](https://aiwithab.site) · [🛡️ Aegis AppSec Sentinel](https://aiwithab.site/projects/aegis-appsec) · [🕹️ Dev Labs](https://aiwithab.site/#games) · [📄 Official CV](https://aiwithab.site/resume) · [📬 Contact](https://aiwithab.site/#contact)

</div>

---

## 📌 Architecture & Key Features

### 🛡️ 1. Aegis AppSec Sentinel (`/projects/aegis-appsec`)
An interactive developer security suite built directly into the portfolio:
- **OWASP Top 10 API & Payload Auditor**: Scans JSON/REST payloads for SQL Injection, NoSQL operators, Prototype Pollution, and SSRF patterns with CVSS 3.1 severity scoring and automated TypeScript remediation generation.
- **JWT Cryptanalysis Inspector**: Audits JSON Web Tokens for `alg: "none"` authorization bypasses, weak symmetric HMAC secrets, expiration flaws, and unverified claims.
- **Supabase PostgreSQL RLS Simulator**: Simulates real-time query execution across anonymous, authenticated owner, cross-tenant attacker, and service-role permission contexts.
- **HTTP Security Headers & CSP Studio**: Evaluates `Content-Security-Policy`, `HSTS`, `X-Frame-Options`, and generates 1-click Next.js `middleware.ts` configurations.

### 🕹️ 2. Interactive Dev Labs & Canvas Benchmarks (`/#games`)
Zero-dependency browser game engines demonstrating client-side state machines, 60 FPS animation loops, and spatial kinematics:
- **Snake Grid Engine**: `requestAnimationFrame` loop with 20x18 grid matrix and velocity vectors.
- **2048 Matrix Reducer**: 4x4 matrix row/column shifts, tile fusion math, and game-over state reducers.
- **Aero Physics Simulator**: Continuous gravity acceleration vectors and obstacle collision hitboxes.
- **Neural Reflex Benchmark**: `performance.now()` high-resolution timestamp telemetry measuring browser event loop latency.
- **Spatial Precision Trainer**: Dynamic Cartesian target raycasting and precision accuracy scoring.

### 🛠️ 3. Full-Featured Admin Panel & Automation Suite (`/admin`)
- **1-Click GitHub Streak Keeper**: Live commit health telemetry with 1-click manual push and automated daily GitHub Actions scheduler (`.github/workflows/streak-keeper.yml`).
- **AI Content Automation**: AI blog generator and LinkedIn/X social post scheduler with automated cron jobs.
- **Telemetry & Analytics Dashboard**: Real-time view tracking, project appreciation metrics, and visitor engagement telemetry.
- **Dynamic Content Management**: Full CRUD controls for Projects, Case Studies, Stack items, Achievements, Experience, and Education with real-time Supabase sync.

### 🔒 4. Enterprise-Grade Security Architecture
- **Cryptographic Session Verification**: Admin authentication uses **HMAC-SHA256 signed HttpOnly cookies** with timing-safe comparison (`crypto.timingSafeEqual`) to prevent timing attack vulnerabilities.
- **Database Row-Level Security (RLS)**: Public client access restricted to read-only queries with Service-Role enforcement on write operations.
- **Strict Input Validation & Sanitization**: Anti-tampering guards across all API routes and public contact endpoints.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | **Next.js 14** (App Router, Server Components, Route Handlers) |
| **Language** | **TypeScript 5.x** (Strict type safety) |
| **Styling & UI** | **Tailwind CSS**, Glassmorphism Design System, Lucide Icons |
| **Database & Auth** | **Supabase (PostgreSQL)**, Row-Level Security (RLS), HMAC Sessions |
| **AI Integration** | **Google Gemini 1.5 API**, **OpenAI GPT-4o** |
| **Automation** | **GitHub Actions** (Daily Streak Keeper), Vercel Cron Jobs |
| **Deployment** | **Vercel** Edge Network, **Cloudflare DNS** (SSL/TLS) |

---

## 📁 Repository Structure

```text
abdul-nabi-portfolio/
├── .github/
│   └── workflows/
│       └── streak-keeper.yml       # Automated daily GitHub contribution cron
├── app/
│   ├── (public)/                   # Public site routes (Home, Blog, Projects, Resume)
│   │   ├── projects/
│   │   │   ├── aegis-appsec/       # Flagship AppSec Sentinel Studio
│   │   │   ├── aurora-dashboard/   # Aurora Analytics Case Study
│   │   │   ├── blood-sugar-tracker/# FYP Machine Learning Case Study
│   │   │   └── nova-commerce/      # Headless E-commerce Storefront
│   │   ├── blog/                   # Technical blog posts & dynamic [slug] reader
│   │   ├── mini-projects/          # 30-Days AI Projects Showcase
│   │   ├── resume/                 # Official printable developer CV
│   │   ├── layout.tsx              # Root HTML & theme providers
│   │   └── page.tsx                # Dynamic homepage
│   ├── admin/                      # Secure Admin Dashboard & CMS
│   │   ├── blogs/                  # Blog post manager & AI post creator
│   │   ├── inbox/                  # Visitor message & feedback management
│   │   ├── mini-projects/          # Mini project sync & metadata editor
│   │   ├── projects/               # Case studies & banner manager
│   │   ├── settings/               # Profile, site config & social accounts
│   │   └── social-bot/             # AI LinkedIn & Twitter scheduler
│   └── api/                        # Next.js Serverless Route Handlers
│       ├── admin/                  # Protected CMS & Streak Keeper endpoints
│       ├── cron/                   # Scheduled auto-publish cron handlers
│       └── projects/               # Live project interactive backends
├── components/
│   ├── admin/                      # Admin UI widgets, panels & Streak Keeper
│   ├── games/                      # 60 FPS HTML5 Canvas game engines
│   ├── projects/                   # Interactive demo components (Aegis, Pulse, etc.)
│   ├── sections/                   # Modular homepage sections (Hero, About, Stack, Labs)
│   └── ui/                         # Glassmorphism cards, badges, buttons, modals
├── data/                           # Structured content, seed data & static fallbacks
├── lib/                            # Data store abstractions, Supabase client, auth & analytics
└── public/                         # Optimized project banners, icons & resume assets
```

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/abdulnabii/abdul-nabi-portfolio.git
cd abdul-nabi-portfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Authentication
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password
SESSION_SECRET=your-32-character-random-session-secret

# AI Models (Optional for local testing)
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Available Scripts

- `npm run dev`: Starts the Next.js local development server with Hot Module Replacement.
- `npm run build`: Compiles production bundle and statically generates all 47 routes.
- `npm start`: Starts production Node.js server.
- `npx tsc --noEmit`: Runs strict TypeScript type checking.

---

## 👨‍💻 Author

**Abdul Nabi**  
*Full-Stack Software Engineer & AI/ML Developer (AppSec Specialist)*
* 🌐 Website: [aiwithab.site](https://aiwithab.site)
* 💼 LinkedIn: [linkedin.com/in/abdul-nabi-95391a3b0](https://linkedin.com/in/abdul-nabi-95391a3b0)
* 📧 Email: [abdulnabi.khaskhely@gmail.com](mailto:abdulnabi.khaskhely@gmail.com)
* 🐙 GitHub: [@abdulnabii](https://github.com/abdulnabii)
* 📱 WhatsApp: [+92 309 3751434](https://wa.me/923093751434)

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
