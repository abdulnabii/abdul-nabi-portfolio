import { AdminShell } from "@/components/admin/admin-shell";
import { TestimonialsManager } from "@/components/admin/testimonials-manager";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell email={session.email}>
      <TestimonialsManager />
    </AdminShell>
  );
}
