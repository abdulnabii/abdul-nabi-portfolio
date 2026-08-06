import { AdminShell } from "@/components/admin/admin-shell";
import { AchievementsManager } from "@/components/admin/achievements-manager";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminAchievementsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell email={session.email}>
      <AchievementsManager />
    </AdminShell>
  );
}
