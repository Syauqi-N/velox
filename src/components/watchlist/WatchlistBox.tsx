"use client";

import { useEffect, useState } from "react";
import { formatPercent, formatPrice, signClass } from "@/lib/format";

interface QuoteRow {
  symbol: string;
  price: number | null;
  changePercent: number | null;
}

export default function WatchlistBox({
  refreshTick,
  onSelect,
}: {
  refreshTick: number;
  onSelect: (symbol: string) => void;
}) {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [rows, setRows] = useState<QuoteRow[]>([]);
  const [error, setError] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/watchlist")
      .then(async (res) => {
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (!cancelled) setSymbols(data.symbols ?? []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

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
      symbols.slice(0, 20).map(async (symbol) => {
        try {
          const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
          if (!res.ok) throw new Error("fetch failed");
          const data = await res.json();
          return {
            symbol,
            price: data.quote?.price ?? null,
            changePercent: data.quote?.changePercent ?? null,
          } as QuoteRow;
        } catch {
          return { symbol, price: null, changePercent: null } as QuoteRow;
        }
      }),
    ).then((next) => {
      if (!cancelled) setRows(next);
    });
    return () => {
      cancelled = true;
    };
  }, [symbols]);

  async function remove(symbol: string) {
    setRemoving(symbol);
    try {
      await fetch(`/api/watchlist?symbol=${encodeURIComponent(symbol)}`, { method: "DELETE" });
      setSymbols((prev) => prev.filter((s) => s !== symbol));
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="card rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[0_1px_2px_rgba(14,34,48,0.08),0_4px_12px_rgba(14,34,48,0.12)] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Watchlist Saya
        </h2>
        {symbols.length > 0 && (
          <span className="pill bg-[var(--card-hover)] text-[10px]">{symbols.length} saham</span>
        )}
      </div>
      {error ? (
        <div className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">Gagal memuat watchlist.</div>
      ) : symbols.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
          Belum ada saham. Cari dari kolom pencarian di atas.
        </div>
      ) : (
        <ul className="divide-y divide-[var(--border)]/60">
          {rows.map((r) => (
            <li key={r.symbol} className="flex items-center gap-2 px-4 py-2">
              <button
                type="button"
                onClick={() => onSelect(r.symbol)}
                className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left transition-colors hover:text-[var(--accent)]"
              >
                <span className="font-semibold">{r.symbol.replace(".JK", "")}</span>
                <span className="flex items-center gap-2 text-sm">
                  <span className="tabular-nums text-[var(--text-muted)]">{formatPrice(r.price)}</span>
                  <span className={`tabular-nums ${signClass(r.changePercent)}`}>
                    {formatPercent(r.changePercent)}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => remove(r.symbol)}
                disabled={removing === r.symbol}
                aria-label={`Hapus ${r.symbol} dari watchlist`}
                className="text-[var(--text-muted)] transition-colors hover:text-[var(--down)] disabled:opacity-50"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
