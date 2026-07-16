import { AdminShell } from "@/components/admin/admin-shell";
import { ProjectForm } from "@/components/admin/project-form";
import { GlassCard } from "@/components/ui/glass-card";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell email={session.email}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">New project</h2>
          <p className="mt-1 text-sm text-slate-400">
            Showcase a new build in your portfolio.
          </p>
        </div>
        <GlassCard padding="lg" elevated>
          <ProjectForm mode="create" />
        </GlassCard>
      </div>
    </AdminShell>
  );
}
