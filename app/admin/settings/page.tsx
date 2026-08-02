import { AdminShell } from "@/components/admin/admin-shell";
import { SettingsForm } from "@/components/admin/settings-form";
import { getAdminSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings-store";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const settings = await getSiteSettings();

  return (
    <AdminShell email={session.email}>
      <SettingsForm initialSettings={settings} />
    </AdminShell>
  );
}
