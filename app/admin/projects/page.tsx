import { AdminShell } from "@/components/admin/admin-shell";
import { ProjectList } from "@/components/admin/project-list";
import { getAdminSession } from "@/lib/auth";
import { getAllProjects } from "@/lib/project-store";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const projects = await getAllProjects();

  return (
    <AdminShell email={session.email}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">All projects</h2>
            <p className="mt-1 text-sm text-slate-400">
              Create, edit, or delete portfolio projects.
            </p>
          </div>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/90 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
            New project
          </Link>
        </div>

        <ProjectList projects={projects} />
      </div>
    </AdminShell>
  );
}
