import { AdminShell } from "@/components/admin/admin-shell";
import { MiniProjectsManager } from "@/components/admin/mini-projects-manager";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminMiniProjectsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell email={session.email}>
      <MiniProjectsManager />
    </AdminShell>
  );
}
