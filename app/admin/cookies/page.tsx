import { AdminShell } from "@/components/admin/admin-shell";
import { CookieInspector } from "@/components/cookies/cookie-inspector";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminCookiesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell email={session.email}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cookie & Telemetry Inspector</h1>
          <p className="text-sm text-slate-400">
            Admin console for inspecting runtime cookies, server HTTP headers, and client consent states.
          </p>
        </div>
        <CookieInspector />
      </div>
    </AdminShell>
  );
}
