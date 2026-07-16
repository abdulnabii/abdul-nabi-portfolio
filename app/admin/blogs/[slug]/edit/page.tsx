import { AdminShell } from "@/components/admin/admin-shell";
import { BlogForm } from "@/components/admin/blog-form";
import { GlassCard } from "@/components/ui/glass-card";
import { getAdminSession } from "@/lib/auth";
import { getBlogBySlug } from "@/lib/blog-store";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditBlogPageProps {
  params: { slug: string };
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const post = await getBlogBySlug(params.slug, { includeDrafts: true });
  if (!post) notFound();

  return (
    <AdminShell email={session.email}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Edit post</h2>
          <p className="mt-1 text-sm text-slate-400">/{post.slug}</p>
        </div>
        <GlassCard padding="lg" elevated>
          <BlogForm mode="edit" initial={post} />
        </GlassCard>
      </div>
    </AdminShell>
  );
}
