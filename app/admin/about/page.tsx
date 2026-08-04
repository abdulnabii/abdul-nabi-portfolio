import { AdminShell } from "@/components/admin/admin-shell";
import { AboutManager } from "@/components/admin/about-manager";
import { getAdminSession } from "@/lib/auth";
import { getAboutData } from "@/lib/settings-store";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const about = await getAboutData();

  return (
    <AdminShell email={session.email}>
      <AboutManager initialAbout={about} />
    </AdminShell>
  );
}
