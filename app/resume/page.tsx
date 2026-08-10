import React from "react";
import Link from "next/link";
import { ArrowLeft, Globe, Github, Linkedin, Mail, MapPin } from "lucide-react";
import { Metadata } from "next";
import { ResumePrintButton } from "@/components/resume-print-button";

export const metadata: Metadata = {
  title: "Resume · Abdul Nabi — Full-Stack Developer",
  description: "Official Resume of Abdul Nabi — Full-Stack Developer & Software Engineer based in Karachi, Pakistan.",
};

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 section-padding pt-28 pb-20 print:bg-white print:text-black print:p-0 print:pt-0">
      <div className="container-narrow max-w-4xl space-y-8 print:max-w-none print:w-full">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Main Portfolio
          </Link>

          <div className="flex items-center gap-3">
            <ResumePrintButton />
          </div>
        </div>

        {/* Printable Resume Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 sm:p-12 shadow-2xl space-y-8 font-sans print:border-none print:bg-white print:p-0 print:shadow-none print:text-black print:space-y-6">
          {/* Header Block */}
          <div className="border-b border-white/10 print:border-slate-300 pb-6 text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white print:text-black tracking-tight uppercase">
              Abdul Nabi
            </h1>
            <p className="text-sm font-bold text-indigo-400 print:text-slate-800 tracking-wide uppercase">
              Full-Stack Developer | Software Engineer
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 print:text-slate-700 font-mono pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-indigo-400 print:hidden" />
                Karachi, Pakistan
              </span>
              <span>•</span>
              <a href="mailto:abdulnabi.khaskhely@gmail.com" className="hover:underline flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-indigo-400 print:hidden" />
                abdulnabi.khaskhely@gmail.com
              </a>
              <span>•</span>
              <a href="https://www.aiwithab.site" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-indigo-400 print:hidden" />
                www.aiwithab.site
              </a>
              <span>•</span>
              <a href="https://github.com/abdulnabii" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                <Github className="h-3.5 w-3.5 text-indigo-400 print:hidden" />
                github.com/abdulnabii
              </a>
              <span>•</span>
              <a href="https://linkedin.com/in/abdul-nabi-95391a3b0" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                <Linkedin className="h-3.5 w-3.5 text-indigo-400 print:hidden" />
                linkedin.com/in/abdul-nabi-95391a3b0
              </a>
            </div>
          </div>

          {/* Professional Summary */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 print:text-slate-900 border-b border-white/10 print:border-slate-300 pb-1">
              📌 Professional Summary
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300 print:text-slate-800">
              Security-minded <strong>Software Engineer</strong> and <strong>Full-Stack Developer</strong> with <strong>2+ years of experience</strong> building high-performance web applications, scalable <strong>REST API development</strong>, and machine learning workflows. Proficient in <strong>TypeScript</strong>, <strong>Next.js</strong>, <strong>React.js</strong>, <strong>Node.js</strong>, <strong>Python</strong>, and <strong>SQL</strong> databases. Strong practical focus on <strong>Application Security (AppSec)</strong> best practices (OWASP Top 10, RBAC, RLS data isolation) and <strong>CI/CD</strong> deployment pipelines within <strong>Agile</strong> team environments. Proven track record of delivering production-grade micro-services, real-time AI tools, and clinical ML applications.
            </p>
          </section>

          {/* Technical Competencies Table */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 print:text-slate-900 border-b border-white/10 print:border-slate-300 pb-1">
              🛠️ Technical Competencies
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-300 print:text-slate-800 border-collapse">
                <tbody>
                  <tr className="border-b border-white/10 print:border-slate-200">
                    <td className="py-2 pr-4 font-bold text-white print:text-slate-900 w-36">Languages</td>
                    <td className="py-2">TypeScript, JavaScript (ES6+), Python, SQL, HTML5, CSS3</td>
                  </tr>
                  <tr className="border-b border-white/10 print:border-slate-200">
                    <td className="py-2 pr-4 font-bold text-white print:text-slate-900">Frontend Engineering</td>
                    <td className="py-2">React.js, Next.js (App Router), Tailwind CSS, Framer Motion, Redux / React Context</td>
                  </tr>
                  <tr className="border-b border-white/10 print:border-slate-200">
                    <td className="py-2 pr-4 font-bold text-white print:text-slate-900">Backend & Databases</td>
                    <td className="py-2">Node.js, Express.js, Python Flask, RESTful APIs, PostgreSQL, Supabase, Prisma, SQLite</td>
                  </tr>
                  <tr className="border-b border-white/10 print:border-slate-200">
                    <td className="py-2 pr-4 font-bold text-white print:text-slate-900">AppSec & Security</td>
                    <td className="py-2">OWASP Top 10, Auth & RBAC Architecture, Supabase RLS Policies, Static Code Audit, CSRF/XSS Defense</td>
                  </tr>
                  <tr className="border-b border-white/10 print:border-slate-200">
                    <td className="py-2 pr-4 font-bold text-white print:text-slate-900">Data Science & ML</td>
                    <td className="py-2">scikit-learn, Pandas, ElasticNet Regression, NumPy, Feature Engineering, Data Pipelines</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-bold text-white print:text-slate-900">DevOps & Delivery</td>
                    <td className="py-2">Git / GitHub, Vercel Serverless, WebSockets, Docker, Turbopack, Agile / Scrum Workflow</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] font-mono leading-relaxed text-slate-400 print:text-slate-700 bg-white/5 print:bg-slate-100 p-2.5 rounded-xl border border-white/10 print:border-slate-200 mt-2">
              <strong>Core Skills:</strong> Software Engineering, Full-Stack Developer, Next.js, React.js, TypeScript, JavaScript, Python, REST API Development, PostgreSQL, Supabase, Node.js, Express.js, Flask, Application Security (AppSec), OWASP Top 10, Machine Learning, scikit-learn, Pandas, ElasticNet ML, Vercel, CI/CD, Agile/Scrum.
            </p>
          </section>

          {/* Professional Experience */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 print:text-slate-900 border-b border-white/10 print:border-slate-300 pb-1">
              💼 Professional Experience
            </h2>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                <div>
                  <h3 className="text-sm font-bold text-white print:text-slate-900">Full-Stack Developer</h3>
                  <p className="text-indigo-300 print:text-slate-700 font-medium">Independent Client Projects & Open Source Builds</p>
                </div>
                <span className="font-mono text-slate-400 print:text-slate-600">Remote / Karachi, Pakistan • 2024 – Present</span>
              </div>
              <ul className="list-disc list-outside pl-4 text-xs text-slate-300 print:text-slate-800 space-y-1 leading-relaxed">
                <li>Built, optimized, and deployed full-stack web applications using <strong>Next.js 14</strong>, <strong>TypeScript</strong>, and <strong>Supabase REST APIs</strong>, achieving <strong>sub-400ms page load times</strong> and <strong>98+ Lighthouse scores</strong>.</li>
                <li>Architected end-to-end security patterns, implementing <strong>Row-Level Security (RLS)</strong> in PostgreSQL and <strong>Role-Based Access Control (RBAC)</strong> to enforce 100% data isolation across multi-tenant applications.</li>
                <li>Conducted static security code reviews and REST API audits against <strong>OWASP Top 10</strong> vulnerabilities (SQL injection, XSS, broken access control), mitigating data leak risks in production endpoints.</li>
                <li>Built <strong>30 Days 30 AI Projects</strong>, a public monorepo showcasing 6+ live serverless web applications integrated with Gemini 1.5 API, Whisper speech recognition, and custom ML predictors.</li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                <div>
                  <h3 className="text-sm font-bold text-white print:text-slate-900">Software Engineer (Junior Full-Stack)</h3>
                  <p className="text-indigo-300 print:text-slate-700 font-medium">Freelance & Contract Engineering</p>
                </div>
                <span className="font-mono text-slate-400 print:text-slate-600">Remote / Karachi, Pakistan • 2023 – 2024</span>
              </div>
              <ul className="list-disc list-outside pl-4 text-xs text-slate-300 print:text-slate-800 space-y-1 leading-relaxed">
                <li>Engineered responsive React.js & Next.js user interfaces, reducing mobile checkout drop-off rates and improving First Contentful Paint (FCP) to <strong>0.8 seconds</strong>.</li>
                <li>Developed backend REST APIs with Node.js and Python Flask, designing relational database schemas in PostgreSQL and SQLite for high query throughput.</li>
                <li>Collaborated in <strong>Agile / Scrum</strong> environments, delivering clean pull requests, automated unit tests, and comprehensive developer documentation.</li>
              </ul>
            </div>
          </section>

          {/* Featured Projects */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 print:text-slate-900 border-b border-white/10 print:border-slate-300 pb-1">
              🚀 Featured Software Engineering Projects
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h3 className="font-bold text-white print:text-slate-900 text-xs">
                  Pulse Support Chat — <span className="font-normal text-slate-300 print:text-slate-700">React.js, Node.js, Streaming APIs, Edge Runtime</span>
                </h3>
                <span className="font-mono text-indigo-400 print:text-slate-600">pulse-support-chat.vercel.app</span>
              </div>
              <ul className="list-disc list-outside pl-4 text-slate-300 print:text-slate-800 space-y-0.5">
                <li>Architected an embeddable support chat widget featuring real-time token streaming via Server-Sent Events (SSE), reducing Time-to-First-Token (TTFT) to <strong>&lt;150ms</strong>.</li>
                <li>Optimized client bundle size to <strong>&lt;12KB gzipped</strong>, maintaining 60fps UI animations during high-frequency text generation chunks.</li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h3 className="font-bold text-white print:text-slate-900 text-xs">
                  Ops Status Console — <span className="font-normal text-slate-300 print:text-slate-700">Next.js 14, PostgreSQL, Auth, Tailwind CSS</span>
                </h3>
                <span className="font-mono text-indigo-400 print:text-slate-600">ops-status-console.vercel.app</span>
              </div>
              <ul className="list-disc list-outside pl-4 text-slate-300 print:text-slate-800 space-y-0.5">
                <li>Built a deploy health & incident monitoring console for DevOps handoffs, bringing PostgreSQL log indexing query latency down to <strong>&lt;50ms</strong> on 10,000+ records.</li>
                <li>Implemented state-duration polling logic, reducing unnecessary database write operations by <strong>85%</strong> during infrastructure status checks.</li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h3 className="font-bold text-white print:text-slate-900 text-xs">
                  Blood Sugar Tracker (Final Year Project - FYP) — <span className="font-normal text-slate-300 print:text-slate-700">Python Flask, scikit-learn, SQLAlchemy, SQLite</span>
                </h3>
                <span className="font-mono text-indigo-400 print:text-slate-600">github.com/abdulnabii/blood-sugar-tracker-fyp</span>
              </div>
              <ul className="list-disc list-outside pl-4 text-slate-300 print:text-slate-800 space-y-0.5">
                <li>Trained an <strong>ElasticNet regression ML model</strong> on clinical vitals (glucose, BMI, carbs, activity) to forecast daily blood sugar levels with high predictive accuracy.</li>
                <li>Engineered a role-based clinical dashboard with automated high-risk alert flags, accelerating doctor-patient triage workflows by <strong>40%</strong>.</li>
              </ul>
            </div>
          </section>

          {/* Education */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 print:text-slate-900 border-b border-white/10 print:border-slate-300 pb-1">
              🎓 Education
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
              <div>
                <h3 className="font-bold text-white print:text-slate-900">Bachelor of Science in Computer Science (BSCS)</h3>
                <p className="text-indigo-300 print:text-slate-700 font-medium">University of Sindh • Jamshoro / Sindh, Pakistan</p>
              </div>
              <span className="font-mono text-slate-400 print:text-slate-600">2022 – 2026</span>
            </div>
            <p className="text-xs text-slate-300 print:text-slate-800 pt-1">
              <strong>Core Coursework:</strong> Data Structures & Algorithms, Database Systems, Software Engineering, Web Application Security, Artificial Intelligence & Machine Learning.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
