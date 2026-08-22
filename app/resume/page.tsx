import React from "react";
import Link from "next/link";
import { ArrowLeft, Globe, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { Metadata } from "next";
import { ResumePrintButton } from "@/components/resume-print-button";

export const metadata: Metadata = {
  title: "Resume · Abdul Nabi — Full-Stack Software Engineer",
  description: "Official Professional Resume of Abdul Nabi — Full-Stack Software Engineer specializing in Next.js, TypeScript, Python ML, and Application Security.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ResumePage() {
  return (
    <div id="resume-printable-area" className="min-h-screen bg-slate-950 text-slate-100 section-padding pt-24 pb-20 print:bg-white print:text-black print:p-0 print:pt-0">
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
        <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 sm:p-12 shadow-2xl space-y-7 font-sans print:border-none print:bg-white print:p-0 print:shadow-none print:text-black print:space-y-5">
          {/* Header Block */}
          <div className="border-b border-white/10 print:border-slate-300 pb-5 text-center space-y-2.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white print:text-black tracking-tight uppercase">
              Abdul Nabi
            </h1>
            <p className="text-xs sm:text-sm font-bold text-indigo-400 print:text-slate-800 tracking-wider uppercase">
              Full-Stack Software Engineer | Next.js · TypeScript · Python · AppSec
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-300 print:text-slate-700 font-mono pt-1">
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
              <a href="tel:03337597315" className="hover:underline flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-indigo-400 print:hidden" />
                +92 309 3751434 / 0333 7597315
              </a>
              <span>•</span>
              <a href="https://www.aiwithab.site" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-indigo-400 print:hidden" />
                aiwithab.site
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
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-400 print:text-slate-900 border-b border-white/10 print:border-slate-300 pb-1 flex items-center gap-1.5">
              <span>📌</span> Professional Summary
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300 print:text-slate-800">
              Security-minded <strong>Full-Stack Software Engineer</strong> with <strong>2+ years of hands-on experience</strong> architecting high-performance web applications, scalable <strong>REST APIs</strong>, and applied machine learning pipelines. Highly skilled in <strong>Next.js 14</strong>, <strong>React</strong>, <strong>TypeScript</strong>, <strong>Node.js</strong>, <strong>Python</strong>, and <strong>PostgreSQL</strong>. Active practitioner of <strong>Application Security (AppSec)</strong> best practices—including <strong>OWASP Top 10</strong> mitigation, Row-Level Security (RLS) tenant isolation, and secure RBAC auth. Creator of the <strong>30-Days 30-AI-Projects Challenge</strong> suite and developer of clinical ML diagnostic predictors.
            </p>
          </section>

          {/* Technical Competencies Matrix */}
          <section className="space-y-2.5">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-400 print:text-slate-900 border-b border-white/10 print:border-slate-300 pb-1 flex items-center gap-1.5">
              <span>🛠️</span> Technical Competencies
            </h2>
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-xs text-slate-300 print:text-slate-800 border-collapse">
                <tbody>
                  <tr className="border-b border-white/10 print:border-slate-200">
                    <td className="py-1.5 pr-4 font-bold text-white print:text-slate-900 w-36 shrink-0">Languages</td>
                    <td className="py-1.5">TypeScript, JavaScript (ES6+), Python 3.11, SQL (PostgreSQL, SQLite), HTML5, CSS3</td>
                  </tr>
                  <tr className="border-b border-white/10 print:border-slate-200">
                    <td className="py-1.5 pr-4 font-bold text-white print:text-slate-900">Frontend Architecture</td>
                    <td className="py-1.5">React.js, Next.js (App Router, Server Actions), Tailwind CSS, Framer Motion, Redux Toolkit, Responsive UI</td>
                  </tr>
                  <tr className="border-b border-white/10 print:border-slate-200">
                    <td className="py-1.5 pr-4 font-bold text-white print:text-slate-900">Backend & APIs</td>
                    <td className="py-1.5">Node.js, Express.js, Python Flask, RESTful APIs, Server-Sent Events (SSE), WebSockets, Middleware Auth</td>
                  </tr>
                  <tr className="border-b border-white/10 print:border-slate-200">
                    <td className="py-1.5 pr-4 font-bold text-white print:text-slate-900">Databases & Storage</td>
                    <td className="py-1.5">PostgreSQL, Supabase (RLS & Realtime), Prisma ORM, SQLite, Query & Index Optimization</td>
                  </tr>
                  <tr className="border-b border-white/10 print:border-slate-200">
                    <td className="py-1.5 pr-4 font-bold text-white print:text-slate-900">AppSec & Security</td>
                    <td className="py-1.5">OWASP Top 10, Supabase RLS Policies, RBAC Multi-Tenant Auth, HMAC Token Signing, CSRF/XSS Defense</td>
                  </tr>
                  <tr className="border-b border-white/10 print:border-slate-200">
                    <td className="py-1.5 pr-4 font-bold text-white print:text-slate-900">AI & Machine Learning</td>
                    <td className="py-1.5">Gemini 1.5 API, Whisper Audio STT, scikit-learn, ElasticNet Regression, Pandas, NumPy, OCR (Tesseract)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 pr-4 font-bold text-white print:text-slate-900">DevOps & Tooling</td>
                    <td className="py-1.5">Git / GitHub, Vercel Serverless, Docker, Turbopack, CI/CD Pipelines, Agile / Scrum Methodology</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Professional Experience */}
          <section className="space-y-4">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-400 print:text-slate-900 border-b border-white/10 print:border-slate-300 pb-1 flex items-center gap-1.5">
              <span>💼</span> Professional Experience
            </h2>

            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                <div>
                  <h3 className="text-sm font-bold text-white print:text-slate-900">Full-Stack Software Engineer</h3>
                  <p className="text-indigo-300 print:text-slate-700 font-medium">Independent Client Projects & Open-Source Engineering</p>
                </div>
                <span className="font-mono text-slate-400 print:text-slate-600">Remote / Karachi, Pakistan • 2024 – Present</span>
              </div>
              <ul className="list-disc list-outside pl-4 text-xs text-slate-300 print:text-slate-800 space-y-1 leading-relaxed">
                <li>Built, optimized, and deployed 10+ full-stack web applications using <strong>Next.js 14</strong>, <strong>TypeScript</strong>, and <strong>Supabase REST APIs</strong>, achieving <strong>sub-400ms page load times</strong> and <strong>98+ Lighthouse performance scores</strong>.</li>
                <li>Architected production security patterns, implementing <strong>Row-Level Security (RLS)</strong> policies in PostgreSQL and <strong>HMAC token authentication</strong> to enforce 100% tenant data isolation across multi-user environments.</li>
                <li>Conducted static code audits and API endpoint reviews against <strong>OWASP Top 10 vulnerabilities</strong> (SQL injection, XSS, broken access control), mitigating data leak exposure in production routes.</li>
                <li>Engineered the <strong>30-Days 30-AI-Projects Challenge</strong>, developing and deploying 30 live micro-applications integrated with Gemini 1.5 API, Whisper speech recognition, and custom ML predictive models.</li>
              </ul>
            </div>

            <div className="space-y-2.5 pt-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                <div>
                  <h3 className="text-sm font-bold text-white print:text-slate-900">Software Engineer (Junior Full-Stack)</h3>
                  <p className="text-indigo-300 print:text-slate-700 font-medium">Freelance & Contract Engineering</p>
                </div>
                <span className="font-mono text-slate-400 print:text-slate-600">Remote / Karachi, Pakistan • 2023 – 2024</span>
              </div>
              <ul className="list-disc list-outside pl-4 text-xs text-slate-300 print:text-slate-800 space-y-1 leading-relaxed">
                <li>Engineered responsive React.js & Next.js user interfaces with reusable component architectures, reducing mobile checkout drop-off and improving First Contentful Paint (FCP) to <strong>0.8 seconds</strong>.</li>
                <li>Developed backend RESTful APIs with Node.js and Python Flask, designing normalized relational schemas in PostgreSQL and SQLite for high query throughput.</li>
                <li>Collaborated in <strong>Agile / Scrum</strong> sprints, delivering thoroughly tested pull requests, automated unit test suites, and clear API documentation.</li>
              </ul>
            </div>
          </section>

          {/* Key Featured Engineering Projects */}
          <section className="space-y-3.5">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-400 print:text-slate-900 border-b border-white/10 print:border-slate-300 pb-1 flex items-center gap-1.5">
              <span>🚀</span> Key Software Engineering Projects
            </h2>

            <div className="space-y-1.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h3 className="font-bold text-white print:text-slate-900 text-xs">
                  30-Days 30-AI-Projects Suite — <span className="font-normal text-slate-300 print:text-slate-700">Next.js 14, TypeScript, Supabase, Gemini AI, Tailwind CSS</span>
                </h3>
                <span className="font-mono text-indigo-400 print:text-slate-600">aiwithab.site/mini-projects</span>
              </div>
              <ul className="list-disc list-outside pl-4 text-slate-300 print:text-slate-800 space-y-0.5 leading-relaxed">
                <li>Engineered and deployed 30 production micro-applications spanning Healthcare ML, Developer Tools, FinTech, LegalTech, and IoT.</li>
                <li>Integrated real-time streaming AI APIs, OCR receipt extraction, and client-side TensorFlow.js diagnostic models.</li>
              </ul>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h3 className="font-bold text-white print:text-slate-900 text-xs">
                  Pulse Support Chat — <span className="font-normal text-slate-300 print:text-slate-700">React.js, Node.js, Streaming APIs, Edge Runtime</span>
                </h3>
                <span className="font-mono text-indigo-400 print:text-slate-600">pulse-support-chat.vercel.app</span>
              </div>
              <ul className="list-disc list-outside pl-4 text-slate-300 print:text-slate-800 space-y-0.5 leading-relaxed">
                <li>Architected an embeddable support chat widget featuring real-time token streaming via Server-Sent Events (SSE), reducing Time-to-First-Token (TTFT) to <strong>&lt;150ms</strong>.</li>
                <li>Optimized client bundle size to <strong>&lt;12KB gzipped</strong>, maintaining smooth 60fps UI animations during high-frequency text generation chunks.</li>
              </ul>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h3 className="font-bold text-white print:text-slate-900 text-xs">
                  Ops Status Console — <span className="font-normal text-slate-300 print:text-slate-700">Next.js 14, PostgreSQL, Auth, Tailwind CSS</span>
                </h3>
                <span className="font-mono text-indigo-400 print:text-slate-600">ops-status-console.vercel.app</span>
              </div>
              <ul className="list-disc list-outside pl-4 text-slate-300 print:text-slate-800 space-y-0.5 leading-relaxed">
                <li>Built a telemetry & incident monitoring console for DevOps handoffs, bringing PostgreSQL log indexing query latency down to <strong>&lt;50ms</strong> on 10,000+ records.</li>
                <li>Implemented state-duration polling logic, reducing unnecessary database write operations by <strong>85%</strong> during infrastructure status checks.</li>
              </ul>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h3 className="font-bold text-white print:text-slate-900 text-xs">
                  Blood Sugar Tracker (Final Year Project - FYP) — <span className="font-normal text-slate-300 print:text-slate-700">Python Flask, scikit-learn, SQLAlchemy, SQLite</span>
                </h3>
                <span className="font-mono text-indigo-400 print:text-slate-600">github.com/abdulnabii/blood-sugar-tracker-fyp</span>
              </div>
              <ul className="list-disc list-outside pl-4 text-slate-300 print:text-slate-800 space-y-0.5 leading-relaxed">
                <li>Trained an <strong>ElasticNet regression ML model</strong> on clinical vitals (glucose, BMI, carbs, activity) to forecast daily blood sugar levels with high predictive accuracy.</li>
                <li>Engineered a role-based clinical dashboard with automated high-risk alert flags, accelerating doctor-patient triage workflows by <strong>40%</strong>.</li>
              </ul>
            </div>
          </section>

          {/* Education & Core Coursework */}
          <section className="space-y-2">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-400 print:text-slate-900 border-b border-white/10 print:border-slate-300 pb-1 flex items-center gap-1.5">
              <span>🎓</span> Education & Academic Background
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
              <div>
                <h3 className="font-bold text-white print:text-slate-900">Bachelor of Science in Computer Science (BSCS)</h3>
                <p className="text-indigo-300 print:text-slate-700 font-medium">University of Sindh • Jamshoro / Sindh, Pakistan</p>
              </div>
              <span className="font-mono text-slate-400 print:text-slate-600">2022 – 2026</span>
            </div>
            <p className="text-xs text-slate-300 print:text-slate-800 pt-1">
              <strong>Core Coursework:</strong> Data Structures & Algorithms, Database Management Systems, Software Engineering, Web Application Security, Artificial Intelligence & Machine Learning, Computer Networks.
            </p>
          </section>

          {/* Professional Certifications & Verified Credentials */}
          <section className="space-y-2.5">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-400 print:text-slate-900 border-b border-white/10 print:border-slate-300 pb-1 flex items-center gap-1.5">
              <span>📜</span> Professional Certifications & Verified Credentials
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-white/5 print:border-slate-300 bg-white/[0.02] print:bg-transparent p-2 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white print:text-slate-900">IT Security: Defense against digital dark arts</span>
                  <span className="font-mono text-[11px] text-indigo-300 print:text-slate-600">Google • Nov 2024</span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-slate-600">
                  <a href="https://www.coursera.org/account/accomplishments/records/UKH04RM2CIFP" target="_blank" rel="noreferrer" className="text-indigo-400 print:text-indigo-700 hover:underline">
                    View Verification (Coursera) ↗
                  </a>
                </p>
              </div>

              <div className="rounded-lg border border-white/5 print:border-slate-300 bg-white/[0.02] print:bg-transparent p-2 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white print:text-slate-900">Google AI Essentials</span>
                  <span className="font-mono text-[11px] text-indigo-300 print:text-slate-600">Google • Oct 2024</span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-slate-600">
                  <a href="https://www.coursera.org/account/accomplishments/records/XGUVFK784XZ6" target="_blank" rel="noreferrer" className="text-indigo-400 print:text-indigo-700 hover:underline">
                    View Verification (Coursera) ↗
                  </a>
                </p>
              </div>

              <div className="rounded-lg border border-white/5 print:border-slate-300 bg-white/[0.02] print:bg-transparent p-2 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white print:text-slate-900">Google Business Intelligence Professional</span>
                  <span className="font-mono text-[11px] text-indigo-300 print:text-slate-600">Google • Nov 2024</span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-slate-600">
                  <a href="https://www.coursera.org/account/accomplishments/professional-cert/certificate/LCZNQDANGYKB" target="_blank" rel="noreferrer" className="text-indigo-400 print:text-indigo-700 hover:underline">
                    View Verification (Coursera) ↗
                  </a>
                </p>
              </div>

              <div className="rounded-lg border border-white/5 print:border-slate-300 bg-white/[0.02] print:bg-transparent p-2 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white print:text-slate-900">Decisions, Decisions: Dashboards & Reports</span>
                  <span className="font-mono text-[11px] text-indigo-300 print:text-slate-600">Google • Nov 2024</span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-slate-600">
                  <a href="https://www.coursera.org/account/accomplishments/records/WPERMOPPEDJU" target="_blank" rel="noreferrer" className="text-indigo-400 print:text-indigo-700 hover:underline">
                    View Verification (Coursera) ↗
                  </a>
                </p>
              </div>

              <div className="rounded-lg border border-white/5 print:border-slate-300 bg-white/[0.02] print:bg-transparent p-2 space-y-0.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white print:text-slate-900">System Administration and IT Infrastructure Services</span>
                  <span className="font-mono text-[11px] text-indigo-300 print:text-slate-600">Google • Nov 2024</span>
                </div>
                <p className="text-[11px] text-slate-400 print:text-slate-600">
                  <a href="https://www.coursera.org/account/accomplishments/records/CFT0KUT95A6L" target="_blank" rel="noreferrer" className="text-indigo-400 print:text-indigo-700 hover:underline">
                    View Verification (Coursera) ↗
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
