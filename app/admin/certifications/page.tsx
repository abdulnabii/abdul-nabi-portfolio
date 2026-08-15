import { AdminShell } from "@/components/admin/admin-shell";
import { CertificationsManager } from "@/components/admin/certifications-manager";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminCertificationsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell email={session.email}>
      <CertificationsManager />
    </AdminShell>
  );
}
