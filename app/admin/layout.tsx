import { getAdminSession } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page uses this layout too — skip shell + auth for /admin/login
  // We can't read pathname easily in layout without headers; use a nested approach.
  // Instead: separate login outside shell via route groups.
  return <>{children}</>;
}

/** Shared guard helper used by protected admin pages */
async function requireAdminOrRedirect() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

function AdminPageFrame({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  return <AdminShell email={email}>{children}</AdminShell>;
}
