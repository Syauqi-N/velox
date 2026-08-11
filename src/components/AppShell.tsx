"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import SignOutButton from "@/components/SignOutButton";
import TristaChat from "@/components/TristaChat";

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/charts", label: "Saham" },
  { href: "/news", label: "News" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/profile", label: "Profil" },
];

export default function AppShell({ children, userName, userRole }: { children: React.ReactNode; userName?: string | null; userRole?: string }) {
  const pathname = usePathname();
  const linkClass = (href: string) => `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${pathname === href ? "bg-[var(--accent-soft)] text-[var(--foreground)]" : "text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"}`;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo href="/" />
          <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={linkClass(item.href)}>{item.label}</Link>)}
            {userRole === "admin" && <Link href="/admin/members" aria-current={pathname === "/admin/members" ? "page" : undefined} className={linkClass("/admin/members")}>Anggota</Link>}
          </nav>
          <div className="flex items-center gap-3">
            {userName && <div className="hidden items-center gap-2 sm:flex"><div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--card-hover)] text-xs font-semibold text-[var(--foreground)]">{userName.trim().charAt(0).toUpperCase()}</div><span className="text-sm text-[var(--muted)]">{userName}</span></div>}
            {userRole === "admin" && <span className="hidden rounded-md border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2 py-1 text-xs font-medium text-[var(--foreground)] sm:inline">Admin</span>}
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 md:pb-6">{children}</main>
      <nav aria-label="Navigasi mobile" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[var(--border)] bg-[var(--card)] px-2 py-2 md:hidden">
        {navItems.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={`flex min-h-11 items-center justify-center rounded-lg px-1 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:px-2 sm:text-sm ${pathname === item.href ? "bg-[var(--accent-soft)] text-[var(--foreground)]" : "text-[var(--muted)]"}`}>{item.label}</Link>)}
      </nav>
      <footer className="hidden border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted)] md:block">Velox, komunitas investasi privat.</footer>
      <TristaChat />
    </div>
  );
}
