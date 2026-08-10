"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { formatCompact, formatPercent, formatPrice, signClass } from "@/lib/format";

interface QuoteRow {
  symbol: string;
  longName?: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
}

function WatchlistClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [symbols, setSymbols] = useState<string[]>([]);
  const [rows, setRows] = useState<QuoteRow[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addQ, setAddQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/watchlist");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (!cancelled) {
          setSymbols(data.symbols ?? []);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  useEffect(() => {
    let cancelled = false;
    if (!symbols.length) {
      void Promise.resolve().then(() => {
        if (!cancelled) setRows([]);
      });
      return () => {
        cancelled = true;
      };
    }
    Promise.all(
      symbols.slice(0, 50).map(async (symbol) => {
        try {
          const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
          if (!res.ok) throw new Error("fetch failed");
          const data = await res.json();
          return {
            symbol,
            longName: data.quote?.longName,
            price: data.quote?.price ?? null,
            change: data.quote?.change ?? null,
            changePercent: data.quote?.changePercent ?? null,
            volume: data.quote?.volume ?? null,
          } as QuoteRow;
        } catch {
          return { symbol, price: null, change: null, changePercent: null, volume: null } as QuoteRow;
        }
      }),
    ).then((next) => {
      if (!cancelled) setRows(next);
    });
    return () => {
      cancelled = true;
    };
  }, [symbols]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && !session?.user?.id) {
      void signOut({ callbackUrl: "/login" });
    }
  }, [router, session?.user?.id, status]);

  async function addSymbol(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    const symbol = addQ.trim().toUpperCase();
    if (!symbol) return;
    setAdding(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menambahkan saham.");
      setAddQ("");
      setTick((t) => t + 1);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setAdding(false);
    }
  }

  async function remove(symbol: string) {
    await fetch(`/api/watchlist?symbol=${encodeURIComponent(symbol)}`, { method: "DELETE" });
    setTick((t) => t + 1);
  }

  if (status === "loading") {
    return (
      <AppShell>
        <div className="text-[var(--text-muted)]">Memuat…</div>
      </AppShell>
    );
  }
  if (status === "unauthenticated") {
    return null;
  }
  if (!session?.user?.id) {
    return null;
  }

  return (
    <AppShell userName={session.user.name} userRole={session.user.role}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Polling</div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Watchlist Saya</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Saham favoritmu, terpisah per akun. Tambah dari pencarian atau kolom di bawah.
          </p>
        </div>
      </div>

      <form onSubmit={addSymbol} className="mb-4 flex max-w-md gap-2">
        <input
          value={addQ}
          onChange={(e) => setAddQ(e.target.value)}
          className="input"
          placeholder="Tambahkan simbol (contoh: BBCA.JK)"
          aria-label="Simbol saham"
        />
        <button type="submit" disabled={adding} className="btn-gold shrink-0 px-4 py-2 text-sm">
          {adding ? "…" : "Tambah"}
        </button>
      </form>
      {addError && <p className="mb-3 text-sm text-[var(--down)]">{addError}</p>}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">Memuat…</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">Gagal memuat watchlist.</div>
        ) : symbols.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">
            Watchlist kamu masih kosong.{" "}
            <Link href="/dashboard" className="text-[var(--accent)] hover:underline">
              Cari saham di dashboard
            </Link>{" "}
            atau tambahkan simbol di atas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="px-5 py-3 font-medium">Saham</th>
                  <th className="px-5 py-3 text-right font-medium">Harga</th>
                  <th className="px-5 py-3 text-right font-medium">Perubahan</th>
                  <th className="px-5 py-3 text-right font-medium">%</th>
                  <th className="px-5 py-3 text-right font-medium">Volume</th>
                  <th className="px-5 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((q) => (
                  <tr
                    key={q.symbol}
                    className="border-b border-[var(--border)]/50 transition-colors last:border-0 hover:bg-[var(--card-hover)]"
                  >
                    <td className="px-5 py-2.5">
                      <Link
                        href={`/stock/${q.symbol}`}
                        className="font-medium hover:text-[var(--accent)]"
                      >
                        {q.symbol.replace(".JK", "")}
                      </Link>
                      {q.longName && (
                        <div className="text-xs text-[var(--text-muted)]">{q.longName}</div>
                      )}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums">
                      {formatPrice(q.price)}
                    </td>
                    <td
                      className={`px-5 py-2.5 text-right tabular-nums ${signClass(q.change)}`}
                    >
                      {q.change != null
                        ? `${(q.change > 0 ? "+" : "") + q.change.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`
                        : "—"}
                    </td>
                    <td
                      className={`px-5 py-2.5 text-right tabular-nums ${signClass(q.changePercent)}`}
                    >
                      {formatPercent(q.changePercent)}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-[var(--text-muted)]">
                      {q.volume != null ? formatCompact(q.volume) : "—"}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => remove(q.symbol)}
                        className="text-[var(--text-muted)] transition-colors hover:text-[var(--down)]"
                        aria-label={`Hapus ${q.symbol}`}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function WatchlistPage() {
  return <WatchlistClient />;
}
