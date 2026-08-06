import { AdminShell } from "@/components/admin/admin-shell";
import { BlogEditClient } from "@/components/admin/blog-edit-client";
import { getAdminSession } from "@/lib/auth";
import { getBlogBySlug } from "@/lib/blog-store";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditBlogPageProps {
  params: { slug: string };
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const post = await getBlogBySlug(params.slug, { includeDrafts: true });

  return (
    <AdminShell email={session.email}>
      <BlogEditClient slug={params.slug} initialPost={post} />
    </AdminShell>
  );
}
