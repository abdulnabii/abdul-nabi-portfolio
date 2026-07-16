import { AdminShell } from "@/components/admin/admin-shell";
import { ProjectForm } from "@/components/admin/project-form";
import { GlassCard } from "@/components/ui/glass-card";
import { getAdminSession } from "@/lib/auth";
import { getProjectById } from "@/lib/project-store";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditProjectPageProps {
  params: { id: string };
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const project = await getProjectById(params.id);
  if (!project) notFound();

  return (
    <AdminShell email={session.email}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Edit project</h2>
          <p className="mt-1 text-sm text-slate-400">/{project.id}</p>
        </div>
        <GlassCard padding="lg" elevated>
          <ProjectForm mode="edit" initial={project} />
        </GlassCard>
      </div>
    </AdminShell>
  );
}
