import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { AutoBlogPanel } from "@/components/admin/auto-blog-panel";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AutoBlogPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell email={session.email}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Auto Blog</h2>
          <p className="mt-1 text-sm text-slate-400">
            AI-powered daily blog automation — trending AI/ML news → published posts.
          </p>
        </div>
        <AutoBlogPanel />
      </div>
    </AdminShell>
  );
}
