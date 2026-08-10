import Link from "next/link";
import Logo from "@/components/Logo";
import TickerTape from "@/components/TickerTape";
import { IDX_WATCHLIST } from "@/lib/constants";
import SignOutButton from "@/components/SignOutButton";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "◉" },
  { href: "/charts", label: "Markets", icon: "◯" },
  { href: "/watchlist", label: "Watchlist", icon: "☰" },
  { href: "/calls", label: "Calls", icon: "✦" },
];

const adminNavItems = [
  { href: "/admin/members", label: "Anggota", icon: "◈" },
];

export default function AppShell({
  children,
  userName,
  userRole,
}: {
  children: React.ReactNode;
  userName?: string | null;
  userRole?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top ticker tape */}
      <TickerTape symbols={IDX_WATCHLIST.slice(0, 7)} />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo href="/dashboard" />
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--card-hover)] hover:text-[var(--brand-navy-deep)]"
              >
                {item.label}
              </Link>
            ))}
            {userRole === "admin" &&
              adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--card-hover)] hover:text-[var(--brand-navy-deep)]"
                >
                  {item.label}
                </Link>
              ))}
          </nav>
          <div className="flex items-center gap-3">
            {userName && (
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--card-hover)] text-xs font-semibold uppercase text-[var(--accent)]">
                  {userName.trim().charAt(0)}
                </div>
                <span className="text-sm text-[var(--text-muted)]">{userName}</span>
              </div>
            )}
            {userRole === "admin" && (
              <span className="pill border border-[var(--accent)]/40 bg-[var(--accent-soft)] uppercase tracking-wider text-[var(--brand-navy-deep)]">
                Admin
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="flex gap-1 overflow-x-auto border-b border-[var(--border)] bg-white px-4 py-2 md:hidden [scrollbar-width:none]">
        {[...navItems, ...(userRole === "admin" ? adminNavItems : [])].map(
          (item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--card-hover)] hover:text-[var(--brand-navy-deep)]"
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 bg-[var(--background)]">{children}</main>

      <footer className="border-t border-[var(--border)] bg-white py-4 text-center text-xs text-[var(--text-muted)]">
        Velox Capital © {new Date().getFullYear()} — Private investment circle
      </footer>
    </div>
  );
}
