"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { formatDateTime } from "@/lib/format";

interface Member {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "member";
  status: "PENDING" | "ACTIVE";
  active: boolean;
  createdAt: string;
}

function MembersClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [pending, setPending] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [codeResult, setCodeResult] = useState<{ id: string; code: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [promotedEmail, setPromotedEmail] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated" && session?.user?.role !== "admin") {
      void signOut({ callbackUrl: "/login" });
      return;
    }
    if (status !== "authenticated") return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/members");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (!cancelled) {
          setMembers(data.members ?? []);
          setPending(data.pending ?? []);
          setError("");
        }
      } catch {
        if (!cancelled) setError("Gagal memuat data anggota.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.role, router, refreshTick]);

  async function approve(id: string) {
    setBusyId(id);
    setCodeResult(null);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyetujui.");
      setCodeResult({ id, code: data.code, expiresAt: data.expiresAt });
      setRefreshTick((t) => t + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setBusyId(null);
    }
  }

  async function copyCode() {
    if (!codeResult) return;
    try {
      await navigator.clipboard.writeText(codeResult.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Browser tidak mengizinkan akses clipboard.");
    }
  }

  async function promote(member: Member) {
    if (!window.confirm(`Jadikan ${member.email} sebagai admin? Member ini akan dapat mengelola anggota dan trading calls.`)) return;
    setBusyId(member.id);
    setPromotedEmail("");
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "admin" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Peran tidak dapat diperbarui.");
      setPromotedEmail(member.email);
      setRefreshTick((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Peran tidak dapat diperbarui.");
    } finally {
      setBusyId(null);
    }
  }

  if (status === "loading") {
    return (
      <AppShell>
        <div className="text-[var(--text-muted)]">Memuat…</div>
      </AppShell>
    );
  }
  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return null;
  }

  return (
    <AppShell userName={session.user.name} userRole={session.user.role}>
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Kelola Anggota</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Setujui signup baru dan berikan kode masuk untuk mengaktifkan akun member.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-[var(--down)]/30 bg-[var(--down)]/10 px-3 py-2 text-sm text-[var(--down)]">
          {error}
        </div>
      )}
      {promotedEmail && <div role="status" className="mb-4 rounded-lg border border-[var(--up)]/30 bg-[var(--up)]/10 px-3 py-2 text-sm text-[var(--up)]">{promotedEmail} sekarang admin. Minta member tersebut login ulang agar aksesnya diperbarui.</div>}

      {/* Approval */}
      <div className="card mb-5 overflow-hidden">
        <div className="border-b border-[var(--border)] px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Persetujuan Signup ({pending.length})
          </h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">Memuat…</div>
        ) : pending.length === 0 ? (
          <div className="p-6 text-center text-sm text-[var(--text-muted)]">
            Tidak ada permintaan signup baru.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]/50">
            {pending.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{m.name || m.email}</div>
                  <div className="text-xs text-[var(--text-muted)]">{m.email}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Didaftarkan {formatDateTime(new Date(m.createdAt).getTime() / 1000)}
                  </div>
                </div>
                {codeResult && codeResult.id === m.id ? (
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2">
                      <code className="rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-3 py-1.5 font-mono text-base font-bold tracking-[0.15em] text-[var(--accent)]">
                        {codeResult.code}
                      </code>
                      <button
                        type="button"
                        onClick={copyCode}
                        className="btn-ghost px-3 py-1.5 text-xs"
                      >
                        {copied ? "✓ Tersalin" : "Salin"}
                      </button>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Berlaku sampai{" "}
                      {new Date(codeResult.expiresAt).toLocaleString("id-ID")}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => approve(m.id)}
                    disabled={busyId === m.id}
                    className="btn-gold px-4 py-2 text-sm"
                  >
                    {busyId === m.id ? "Memproses…" : "Setujui & Buat Kode"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Members */}
      <div className="card overflow-hidden">
        <div className="border-b border-[var(--border)] px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Anggota ({members.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wider text-[var(--text-muted)]">
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Nama</th>
                <th className="px-5 py-3 font-medium">Peran</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Didaftarkan</th>
                <th className="px-5 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-[var(--border)]/50 transition-colors last:border-0 hover:bg-[var(--card-hover)]"
                >
                  <td className="px-5 py-3">{m.email}</td>
                  <td className="px-5 py-3 text-[var(--text-muted)]">{m.name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={m.role === "admin" ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {m.active ? (
                      <span className="inline-flex items-center gap-1.5 text-[var(--up)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--up)] shadow-[0_0_6px_var(--up)]" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted" />
                        Menunggu aktivasi
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-muted)]">
                    {formatDateTime(new Date(m.createdAt).getTime() / 1000)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {m.role === "member" && <button type="button" onClick={() => void promote(m)} disabled={busyId === m.id} className="btn-ghost min-h-11 px-3 text-sm">{busyId === m.id ? "Memperbarui" : "Jadikan admin"}</button>}
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[var(--text-muted)]">
                    Belum ada anggota.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

export default function AdminMembersPage() {
  return <MembersClient />;
}
