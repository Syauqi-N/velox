"use client";

import { useEffect, useRef, useState } from "react";
import PriceChart from "@/components/PriceChart";
import { formatPercent, formatPrice, signClass } from "@/lib/format";
import type { ChartResult, QuoteResult } from "@/lib/yahoo";

interface SearchItem {
  symbol: string;
  shortName?: string;
  longName?: string;
  exchange?: string;
}

interface LoadedStock {
  symbol: string;
  quote: QuoteResult | null;
  chart: ChartResult | null;
}

export default function SearchPane({
  selectedSymbol,
  onSelect,
  onWatchlistChanged,
}: {
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  onWatchlistChanged: () => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [loaded, setLoaded] = useState<LoadedStock>({ symbol: "", quote: null, chart: null });
  const [failed, setFailed] = useState("");
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current !== undefined) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!selectedSymbol) return;
    let cancelled = false;
    fetch(`/api/stock?symbol=${encodeURIComponent(selectedSymbol)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (!cancelled) {
          setLoaded({ symbol: selectedSymbol, quote: data.quote ?? null, chart: data.chart ?? null });
          setFailed("");
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(selectedSymbol);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedSymbol]);

  const loading = loaded.symbol !== selectedSymbol && failed !== selectedSymbol;
  const stockError = failed === selectedSymbol;
  const { quote, chart } = loaded.symbol === selectedSymbol ? loaded : { quote: null, chart: null };

  function handleSearch(value: string) {
    setQ(value);
    if (timerRef.current !== undefined) clearTimeout(timerRef.current);
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      setSearching(true);
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("fetch failed");
          const data = await res.json();
          setResults(data.results ?? []);
        })
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 350) as unknown as ReturnType<typeof setTimeout>;
  }

  async function addToWatchlist() {
    if (!selectedSymbol) return;
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: selectedSymbol }),
    });
    if (res.ok) {
      setAdded(true);
      onWatchlistChanged();
    }
  }

  return (
    <div className="card rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[0_1px_2px_rgba(14,34,48,0.08),0_4px_12px_rgba(14,34,48,0.12)] overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Cari Saham
        </h2>
        <input
          value={q}
          onChange={(e) => handleSearch(e.target.value)}
          className="input mt-2"
          placeholder="Contoh: BBCA, GOTO, BMRI…"
          aria-label="Cari saham"
        />
        {searching && <div className="mt-1 text-xs text-[var(--text-muted)]">Mencari…</div>}
        {results.length > 0 && (
          <ul className="mt-2 divide-y divide-[var(--border)]/60">
            {results.map((r) => (
              <li key={r.symbol}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(r.symbol);
                    setAdded(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-1 py-1.5 text-left transition-colors hover:bg-[var(--card-hover)]"
                >
                  <span className="font-semibold">{r.symbol}</span>
                  <span className="truncate text-right text-xs text-[var(--text-muted)]">
                    {r.longName ?? r.shortName}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedSymbol && (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold">{selectedSymbol}</span>
              <span className={`text-sm font-medium tabular-nums ${signClass(quote?.changePercent)}`}>
                {formatPercent(quote?.changePercent)}
              </span>
            </div>
            <span className="text-lg font-bold tabular-nums">{formatPrice(quote?.price)}</span>
          </div>
          {stockError ? (
            <div className="mt-3 text-sm text-[var(--text-muted)]">Gagal memuat chart.</div>
          ) : chart && chart.bars.length ? (
            <div className="mt-2">
              <PriceChart data={chart} variant="light" height={240} />
            </div>
          ) : (
            <div className="mt-3 flex h-[240px] items-center justify-center text-sm text-[var(--text-muted)]">
              {loading ? "Memuat chart…" : "Tidak ada data chart."}
            </div>
          )}
          <button
            type="button"
            onClick={addToWatchlist}
            disabled={added}
            className={`mt-3 w-full rounded-lg border py-2 text-sm font-medium transition-colors ${
              added
                ? "cursor-default border-[var(--up)]/40 bg-[var(--up)]/10 text-[var(--up)]"
                : "btn-ghost"
            }`}
          >
            {added ? "✓ Sudah di watchlist" : "+ Tambahkan ke watchlist"}
          </button>
        </div>
      )}
    </div>
  );
}
