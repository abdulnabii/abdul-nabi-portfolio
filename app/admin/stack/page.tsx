import { AdminShell } from "@/components/admin/admin-shell";
import { StackManager } from "@/components/admin/stack-manager";
import { getAdminSession } from "@/lib/auth";
import { getSkillsData } from "@/lib/settings-store";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminStackPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const skills = await getSkillsData();

  return (
    <AdminShell email={session.email}>
      <StackManager initialSkills={skills} />
    </AdminShell>
  );
}
