"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, LayoutDashboard, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface AdminShellProps {
  email: string;
  children: React.ReactNode;
}

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
  { href: "/admin/blogs/new", label: "New post", icon: Plus },
];

export function AdminShell({ email, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#050814] text-white">
      <div className="pointer-events-none fixed inset-0 bg-ambient opacity-80" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Admin panel
            </p>
            <h1 className="text-lg font-semibold text-white">Blog management</h1>
            <p className="mt-1 text-xs text-slate-400">{email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              View site
            </Link>
            <Button variant="secondary" size="sm" onClick={logout}>
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </Button>
          </div>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[220px_1fr]">
          <nav className="h-fit rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur-xl">
            <ul className="space-y-1">
              {nav.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition",
                        active
                          ? "bg-accent/20 text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
