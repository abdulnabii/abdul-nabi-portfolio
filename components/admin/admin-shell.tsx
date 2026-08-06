"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, LayoutDashboard, LogOut, FolderGit2, Inbox, Settings, User, Layers, Briefcase, LayoutTemplate, Trophy, Monitor } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminShellProps {
  email: string;
  children: React.ReactNode;
}

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
  { href: "/admin/projects", label: "Projects", icon: FolderGit2 },
  { href: "/admin/about", label: "About Bio", icon: User },
  { href: "/admin/stack", label: "Tech Stack", icon: Layers },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/achievements", label: "Achievements", icon: Trophy },
  { href: "/admin/sections", label: "Sections", icon: LayoutTemplate },
  { href: "/admin/background-theme", label: "Background", icon: Monitor },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ email, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function checkInbox() {
      try {
        const res = await fetch("/api/admin/inbox");
        if (res.ok) {
          const data = (await res.json()) as { unreadCount: number };
          setUnreadCount(data.unreadCount ?? 0);
        }
      } catch (err) {
        console.error("Failed to fetch inbox count", err);
      }
    }

    checkInbox();

    function handleInboxUpdate(e: Event) {
      const customEvent = e as CustomEvent<{ unreadCount?: number }>;
      if (typeof customEvent.detail?.unreadCount === "number") {
        setUnreadCount(customEvent.detail.unreadCount);
      } else {
        checkInbox();
      }
    }

    window.addEventListener("inbox-updated", handleInboxUpdate);
    // Poll every 30 seconds for new messages/reactions
    const interval = setInterval(checkInbox, 30000);
    return () => {
      window.removeEventListener("inbox-updated", handleInboxUpdate);
      clearInterval(interval);
    };
  }, [pathname]); // Refresh when navigating

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
            <h1 className="text-lg font-semibold text-white">Portfolio Management</h1>
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
                        "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition",
                        active
                          ? "bg-accent/25 text-white border border-accent/40 shadow-sm font-medium"
                          : "border border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.label === "Inbox" && unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(129,140,248,0.5)]">
                          {unreadCount}
                        </span>
                      )}
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
