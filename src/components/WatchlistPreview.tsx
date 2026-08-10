"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { QuoteResult } from "@/lib/yahoo";
import { IDX_WATCHLIST } from "@/lib/constants";
import { formatPrice, formatPercent, signClass } from "@/lib/format";

export default function WatchlistPreview() {
  const [quotes, setQuotes] = useState<QuoteResult[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchQuotes() {
      try {
        const res = await fetch(
          `/api/ticker?symbols=${IDX_WATCHLIST.join(",")}`,
        );
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (!cancelled) {
          setQuotes(data.quotes);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--up)] shadow-[0_0_8px_var(--up)]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Watchlist
          </h2>
        </div>
        <Link
          href="/watchlist"
          className="text-xs text-[var(--accent)] hover:underline"
        >
          Lihat semua →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-6 py-2.5 font-medium">Saham</th>
              <th className="px-6 py-2.5 text-right font-medium">Harga</th>
              <th className="px-6 py-2.5 text-right font-medium">Perubahan</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr
                key={q.symbol}
                className="border-b border-[var(--border)]/50 transition-colors last:border-0 hover:bg-[var(--card-hover)]"
              >
                <td className="px-5 py-2">
                  <Link
                    href={`/stock/${q.symbol}`}
                    className="font-medium hover:text-[var(--accent)]"
                  >
                    {q.symbol.replace(".JK", "")}
                  </Link>
                </td>
                <td className="px-5 py-2 text-right tabular-nums">
                  {formatPrice(q.price)}
                </td>
                <td
                  className={`px-6 py-2.5 text-right tabular-nums ${signClass(q.changePercent)}`}
                >
                  {formatPercent(q.changePercent)}
                </td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-6 text-center text-muted"
                >
                  {error ? "Gagal memuat data" : "Memuat..."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
