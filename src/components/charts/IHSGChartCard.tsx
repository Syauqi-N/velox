"use client";

import { useEffect, useState } from "react";
import PriceChart from "@/components/PriceChart";
import { formatPercent, formatPrice, signClass } from "@/lib/format";
import type { ChartResult, QuoteResult } from "@/lib/yahoo";

export default function IHSGChartCard({ refreshTick = 0 }: { refreshTick?: number }) {
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [chart, setChart] = useState<ChartResult | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/stock?symbol=${encodeURIComponent("^JKSE")}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (!cancelled) {
          setQuote(data.quote ?? null);
          setChart(data.chart ?? null);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  return (
    <div className="card rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[0_1px_2px_rgba(14,34,48,0.08),0_4px_12px_rgba(14,34,48,0.12)] overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-2 px-4 py-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
            Indeks Harga Saham Gabungan
          </div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-xl font-bold tabular-nums tracking-tight">
              {formatPrice(quote?.price)}
            </span>
            <span className={`text-sm font-medium tabular-nums ${signClass(quote?.changePercent)}`}>
              {formatPercent(quote?.changePercent)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="pill border border-[var(--border)] bg-[var(--card-hover)] text-[10px]">
            Yahoo · delayed
          </span>
        </div>
      </div>
      {error ? (
        <div className="p-6 text-center text-sm text-[var(--text-muted)]">Gagal memuat data IHSG.</div>
      ) : chart && chart.bars.length ? (
        <PriceChart data={chart} variant="light" height={220} />
      ) : (
        <div className="flex h-[220px] items-center justify-center text-sm text-[var(--text-muted)]">
          Memuat…
        </div>
      )}
    </div>
  );
}
