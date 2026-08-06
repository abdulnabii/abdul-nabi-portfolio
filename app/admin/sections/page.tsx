import { AdminShell } from "@/components/admin/admin-shell";
import { SectionsManager } from "@/components/admin/sections-manager";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSectionsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell email={session.email}>
      <SectionsManager />
    </AdminShell>
  );
}
