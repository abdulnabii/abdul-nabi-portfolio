import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { SocialBotManager } from "@/components/admin/social-bot-manager";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Social Bot Automation · Admin Panel",
};

export const dynamic = "force-dynamic";

export default async function AdminSocialBotPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <AdminShell email={session.email}>
      <SocialBotManager />
    </AdminShell>
  );
}
