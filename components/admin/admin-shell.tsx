"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, LayoutDashboard, LogOut, FolderGit2, Inbox, Settings, User, Layers, Briefcase, LayoutTemplate, Trophy, Monitor, Sun, Moon, Rocket } from "lucide-react";
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
  { href: "/admin/mini-projects", label: "Mini Projects", icon: Rocket },
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
  const [adminTheme, setAdminTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_theme") as "dark" | "light" | null;
      if (saved === "light" || saved === "dark") {
        setAdminTheme(saved);
      }
    } catch {}
  }, []);

  const toggleAdminTheme = () => {
    const next = adminTheme === "dark" ? "light" : "dark";
    setAdminTheme(next);
    try {
      localStorage.setItem("admin_theme", next);
    } catch {}
  };

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
    const interval = setInterval(checkInbox, 30000);
    return () => {
      window.removeEventListener("inbox-updated", handleInboxUpdate);
      clearInterval(interval);
    };
  }, [pathname]);

  useEffect(() => {
    // Synchronize HTML root class for admin theme without altering saved public site theme
    const root = document.documentElement;
    if (adminTheme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }

    return () => {
      // Restore public theme mode when leaving admin
      try {
        const savedTheme = localStorage.getItem("app_theme");
        if (savedTheme === "light") {
          root.classList.add("light");
          root.classList.remove("dark");
        } else {
          root.classList.add("dark");
          root.classList.remove("light");
        }
      } catch {}
    };
  }, [adminTheme]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const isLight = adminTheme === "light";

  return (
    <div className={cn("admin-shell min-h-screen transition-colors duration-300", isLight ? "light bg-[#f8fafc] text-slate-900" : "dark bg-[#050814] text-white")}>
      <div className="pointer-events-none fixed inset-0 bg-ambient opacity-80" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className={cn("mb-8 flex flex-col gap-4 rounded-2xl border p-4 transition-all duration-300 sm:flex-row sm:items-center sm:justify-between", isLight ? "border-slate-200 bg-white shadow-sm" : "border-white/10 bg-white/[0.05] backdrop-blur-xl")}>
          <div>
            <p className={cn("text-xs uppercase tracking-[0.18em]", isLight ? "text-slate-500 font-medium" : "text-slate-500")}>
              Admin panel
            </p>
            <h1 className={cn("text-lg font-semibold", isLight ? "text-slate-900" : "text-white")}>Portfolio Management</h1>
            <p className={cn("mt-1 text-xs", isLight ? "text-slate-600" : "text-slate-400")}>{email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Admin Day/Night Theme Toggle */}
            <button
              type="button"
              onClick={toggleAdminTheme}
              aria-label={isLight ? "Switch Admin to Night Mode" : "Switch Admin to Day Mode"}
              title={isLight ? "Switch Admin to Night Mode" : "Switch Admin to Day Mode"}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 select-none",
                isLight
                  ? "border-slate-300 bg-slate-100 text-indigo-600 hover:bg-slate-200 shadow-sm"
                  : "border-white/10 bg-white/5 text-amber-300 hover:bg-white/10"
              )}
            >
              {isLight ? <Moon className="h-3.5 w-3.5 text-indigo-600" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
              <span>{isLight ? "Night Admin" : "Day Admin"}</span>
            </button>

            <Link
              href="/"
              className={cn("rounded-xl border px-3 py-2 text-xs transition-all duration-200", isLight ? "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 shadow-sm" : "border-white/10 text-slate-300 hover:bg-white/5 hover:text-white")}
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
          <nav className={cn("h-fit rounded-2xl border p-2 transition-all duration-300", isLight ? "border-slate-200 bg-white shadow-sm" : "border-white/10 bg-white/[0.04] backdrop-blur-xl")}>
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
                          ? isLight
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm font-semibold"
                            : "bg-accent/25 text-white border border-accent/40 shadow-sm font-medium"
                          : isLight
                            ? "border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
