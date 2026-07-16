import { AdminShell } from "@/components/admin/admin-shell";
import { BlogForm } from "@/components/admin/blog-form";
import { GlassCard } from "@/components/ui/glass-card";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewBlogPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell email={session.email}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">New post</h2>
          <p className="mt-1 text-sm text-slate-400">
            Write a new article for the public blog.
          </p>
        </div>
        <GlassCard padding="lg" elevated>
          <BlogForm mode="create" />
        </GlassCard>
      </div>
    </AdminShell>
  );
}
