import { AdminShell } from "@/components/admin/admin-shell";
import { ProjectEditClient } from "@/components/admin/project-edit-client";
import { getAdminSession } from "@/lib/auth";
import { getProjectById } from "@/lib/project-store";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditProjectPageProps {
  params: { id: string };
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const project = await getProjectById(params.id);

  return (
    <AdminShell email={session.email}>
      <ProjectEditClient id={params.id} initialProject={project} />
    </AdminShell>
  );
}
