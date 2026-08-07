import { AdminShell } from "@/components/admin/admin-shell";
import { AnalyticsDashboardOverview } from "@/components/admin/analytics-dashboard-overview";
import { GlassCard } from "@/components/ui/glass-card";
import { AnalyticsSummary, getAnalyticsSummary } from "@/lib/analytics-store";
import { getAdminSession } from "@/lib/auth";
import { getAllBlogs } from "@/lib/blog-store";
import { getAllProjects } from "@/lib/project-store";
import { Bot, FileText, FolderGit2, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  let posts: any[] = [];
  try {
    posts = await getAllBlogs();
  } catch (err) {
    console.error("[AdminDashboardPage] Error fetching blogs:", err);
  }

  const published = posts.filter((p) => p.published).length;
  const drafts = posts.length - published;

  let projects: any[] = [];
  try {
    projects = await getAllProjects();
  } catch (err) {
    console.error("[AdminDashboardPage] Error fetching projects:", err);
  }

  const featuredProjects = projects.filter((p) => p.featured).length;
  const totalLikes = projects.reduce(
    (sum, p) => sum + (p.appreciations ?? 0),
    0
  );

  let analyticsSummary: AnalyticsSummary = {
    totalViews: 0,
    viewsThisWeek: 0,
    topBlogs: [],
    topProjects: [],
    topCtas: [],
  };

  try {
    analyticsSummary = await getAnalyticsSummary();
  } catch (err) {
    console.error("[AdminDashboardPage] Error fetching analytics summary:", err);
  }

  return (
    <AdminShell email={session.email}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-400">
            Overview of your portfolio content.
          </p>
        </div>

        {/* Analytics Section */}
        <AnalyticsDashboardOverview initialSummary={analyticsSummary} />

        {/* Blog Content Stats */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Blog Analytics
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <GlassCard>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Total posts
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {posts.length}
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Published
              </p>
              <p className="mt-2 text-3xl font-semibold text-emerald-300">
                {published}
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Drafts
              </p>
              <p className="mt-2 text-3xl font-semibold text-amber-200/90">
                {drafts}
              </p>
            </GlassCard>
          </div>
        </div>

        {/* Project Content Stats */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Project Showcase Stats
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <GlassCard>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Total Projects
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {projects.length}
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Featured Case Studies
              </p>
              <p className="mt-2 text-3xl font-semibold text-indigo-300">
                {featuredProjects}
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Total Appreciations
              </p>
              <p className="mt-2 text-3xl font-semibold text-rose-300">
                {totalLikes}
              </p>
            </GlassCard>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/90 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent hover:shadow-glow-sm"
          >
            <Plus className="h-4 w-4" />
            New blog post
          </Link>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/20 px-4 py-2.5 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/30"
          >
            <Sparkles className="h-4 w-4" />
            New project
          </Link>
          <Link
            href="/admin/blogs"
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-600/30 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600/50 hover:shadow-glow-sm"
          >
            <Bot className="h-4 w-4 text-indigo-400" />
            Blogs & AI Automation
          </Link>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <FolderGit2 className="h-4 w-4" />
            Manage projects
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
