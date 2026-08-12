"use client";

import { useEffect, useState } from "react";
import type { QuoteResult } from "@/lib/yahoo";
import { formatPrice, formatPercent, signClass } from "@/lib/format";

export default function TickerTape({ symbols }: { symbols: string[] }) {
  const [quotes, setQuotes] = useState<QuoteResult[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchQuotes() {
      try {
        const res = await fetch(`/api/ticker?symbols=${symbols.join(",")}`);
        if (!res.ok) throw new Error("ticker fetch failed");
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
    const interval = setInterval(fetchQuotes, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [symbols]);

  if (error) return <div className="h-9" />;

  return (
    <div className="border-b border-[var(--app-bg-dark)] bg-[#0e2230]">
      <div className="flex items-center overflow-hidden">
        <span className="pill shrink-0 border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
          Delayed
        </span>
        <div className="marquee-track flex items-center gap-6 overflow-x-auto px-4 py-2 text-xs whitespace-nowrap text-[#e8edf6] scrollbar-hide">
          {[...quotes, ...quotes].map((q, i) => (
            <div key={`${q.symbol}-${i}`} className="flex items-center gap-1.5">
              <span className="font-semibold">{q.symbol.replace(".JK", "")}</span>
              <span className="tabular-nums text-[var(--text-muted)]">
                {formatPrice(q.price)}
              </span>
              <span className={`tabular-nums ${signClass(q.changePercent)}`}>
                {formatPercent(q.changePercent)}
              </span>
            </div>
          ))}
          {quotes.length === 0 && (
            <span className="text-[var(--text-muted)]">
              {error ? "Gagal memuat data" : "Memuat data pasar..."}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
