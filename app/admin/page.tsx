import { AdminShell } from "@/components/admin/admin-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { getAdminSession } from "@/lib/auth";
import { getAllBlogs } from "@/lib/blog-store";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const posts = await getAllBlogs();
  const published = posts.filter((p) => p.published).length;
  const drafts = posts.length - published;

  return (
    <AdminShell email={session.email}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-400">
            Overview of your blog content.
          </p>
        </div>

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

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/90 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
            New blog post
          </Link>
          <Link
            href="/admin/blogs"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <FileText className="h-4 w-4" />
            Manage blogs
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
