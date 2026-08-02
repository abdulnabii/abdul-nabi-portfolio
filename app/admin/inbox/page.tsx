import { AdminShell } from "@/components/admin/admin-shell";
import { InboxView } from "@/components/admin/inbox-view";
import { getAdminSession } from "@/lib/auth";
import { getAllInboxItems } from "@/lib/inbox-store";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminInboxPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const items = await getAllInboxItems();

  return (
    <AdminShell email={session.email}>
      <InboxView initialItems={items} />
    </AdminShell>
  );
}
