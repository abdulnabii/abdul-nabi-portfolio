import { AdminShell } from "@/components/admin/admin-shell";
import { AutoBlogPanel } from "@/components/admin/auto-blog-panel";
import { BlogList } from "@/components/admin/blog-list";
import { getAdminSession } from "@/lib/auth";
import { getAllBlogs, getTrashedBlogs } from "@/lib/blog-store";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [posts, trashedPosts] = await Promise.all([
    getAllBlogs(),
    getTrashedBlogs(),
  ]);

  return (
    <AdminShell email={session.email}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Blog Management</h2>
            <p className="mt-1 text-sm text-slate-400">
              Manage manually written posts and configure AI daily auto-blog posting.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/blogs/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/90 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent"
            >
              <Plus className="h-4 w-4" />
              New post
            </Link>
          </div>
        </div>

        {/* Auto Blog Control Panel in Blog Section */}
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.03] p-5 backdrop-blur-xl">
          <AutoBlogPanel />
        </div>

        {/* All Blogs List */}
        <div className="pt-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Articles & Content Archive
          </h3>
          <BlogList posts={posts} initialTrash={trashedPosts} />
        </div>
      </div>
    </AdminShell>
  );
}
