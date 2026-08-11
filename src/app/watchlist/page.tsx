"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import StockPicker from "@/components/StockPicker";
import StockChart from "@/components/calls/CallChart";
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
  const [addQuery, setAddQuery] = useState("");
  const [pickerKey, setPickerKey] = useState(0);
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
    if (!symbol) {
      setAddError(addQuery.trim() ? "Pilih saham dari dropdown agar ticker valid." : "Cari dan pilih saham untuk ditambahkan.");
      return;
    }
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
      setAddQuery("");
      setPickerKey((value) => value + 1);
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

      <form onSubmit={addSymbol} className="mb-4 flex max-w-xl items-start gap-2">
        <div className="min-w-0 flex-1"><StockPicker key={pickerKey} id="watchlist-symbol" label="Tambah saham ke watchlist" hideLabel onChange={(stock, query) => { setAddQ(stock?.symbol ?? ""); setAddQuery(query); setAddError(""); }} /></div>
        <button type="submit" disabled={adding} className="btn-gold min-h-11 shrink-0 px-4 py-2 text-sm">
          {adding ? "…" : "Tambah"}
        </button>
      </form>
      {addError && <p className="mb-3 text-sm text-[var(--down)]">{addError}</p>}

      {loading || (symbols.length > 0 && rows.length === 0) ? (
        <div className="card p-8 text-center text-sm text-[var(--text-muted)]">Memuat watchlist.</div>
      ) : error ? (
        <div className="card p-8 text-center text-sm text-[var(--text-muted)]">Gagal memuat watchlist.</div>
      ) : symbols.length === 0 ? (
        <div className="card p-8 text-center text-sm text-[var(--text-muted)]">
            Watchlist kamu masih kosong.{" "}
            <Link href="/dashboard" className="text-[var(--accent)] hover:underline">
              Cari saham di dashboard
            </Link>{" "}
            atau tambahkan simbol di atas.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rows.map((quote) => (
            <article key={quote.symbol} className="card min-w-0 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link href={`/stock/${quote.symbol}`} className="text-lg font-bold tracking-tight hover:text-[var(--accent)]">{quote.symbol.replace(".JK", "")}</Link>
                  <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{quote.longName ?? "Nama perusahaan tidak tersedia"}</p>
                </div>
                <button type="button" onClick={() => remove(quote.symbol)} className="btn-ghost min-h-11 shrink-0 px-3 text-xs hover:text-[var(--down)]" aria-label={`Hapus ${quote.symbol} dari watchlist`}>Hapus</button>
              </div>
              <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Harga terakhir</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums">{formatPrice(quote.price)}</p>
                </div>
                <div className={`text-right tabular-nums ${signClass(quote.changePercent)}`}>
                  <p className="text-base font-semibold">{formatPercent(quote.changePercent)}</p>
                  <p className="mt-0.5 text-xs">{quote.change != null ? `${quote.change > 0 ? "+" : ""}${quote.change.toLocaleString("id-ID", { maximumFractionDigits: 0 })}` : "Tidak tersedia"}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-y border-[var(--border)] py-2 text-xs"><span className="text-[var(--text-muted)]">Volume</span><span className="font-medium tabular-nums">{quote.volume != null ? formatCompact(quote.volume) : "Tidak tersedia"}</span></div>
              <StockChart symbol={quote.symbol} height={220} />
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default function WatchlistPage() {
  return <WatchlistClient />;
}
