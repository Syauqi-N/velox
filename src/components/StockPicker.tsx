"use client";

import { useEffect, useRef, useState } from "react";
import { formatPercent, formatPrice, signClass } from "@/lib/format";

export interface StockOption {
  symbol: string;
  shortName?: string;
  longName?: string;
  price: number | null;
  changePercent: number | null;
}

export default function StockPicker({
  id,
  label,
  hideLabel = false,
  optional = false,
  initialSymbol,
  onChange,
}: {
  id: string;
  label: string;
  hideLabel?: boolean;
  optional?: boolean;
  initialSymbol?: string;
  onChange: (stock: StockOption | null, query: string) => void;
}) {
  const initialTicker = initialSymbol?.replace(".JK", "") ?? "";
  const [query, setQuery] = useState(initialTicker);
  const [selectedStock, setSelectedStock] = useState<StockOption | null>(initialSymbol ? { symbol: initialSymbol, price: null, changePercent: null } : null);
  const [results, setResults] = useState<StockOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();
  }, []);

  function chooseStock(stock: StockOption) {
    const ticker = stock.symbol.replace(".JK", "");
    setQuery(ticker);
    setSelectedStock(stock);
    setResults([]);
    setActiveIndex(-1);
    setSearchError("");
    onChange(stock, ticker);
  }

  function changeQuery(value: string) {
    const nextQuery = value.toUpperCase();
    setQuery(nextQuery);
    setSelectedStock(null);
    setSearchError("");
    setActiveIndex(-1);
    onChange(null, nextQuery);
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();
    if (nextQuery.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(nextQuery.trim())}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Pencarian saham gagal.");
        const nextResults = (data.results ?? []) as StockOption[];
        setResults(nextResults);
        setSearchError(nextResults.length ? "" : "Saham Indonesia tidak ditemukan.");
      } catch (reason) {
        if (reason instanceof Error && reason.name !== "AbortError") setSearchError(reason.message);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 300);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!results.length) {
      if (event.key === "Escape") setResults([]);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      chooseStock(results[activeIndex]);
    }
    if (event.key === "Escape") {
      setResults([]);
      setActiveIndex(-1);
    }
  }

  return (
    <div>
      <label htmlFor={id} className={hideLabel ? "sr-only" : "mb-1.5 block text-sm font-medium"}>
        {label} {optional && <span className="font-normal text-[var(--muted)]">(opsional)</span>}
      </label>
      <div className="relative">
        <input id={id} value={query} onChange={(event) => changeQuery(event.target.value)} onKeyDown={handleKeyDown} autoComplete="off" maxLength={40} className="input py-2.5 text-sm" placeholder="Cari kode atau nama saham, contoh GOTO" role="combobox" aria-autocomplete="list" aria-expanded={results.length > 0} aria-controls={`${id}-results`} aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined} />
        {searching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]">Mencari</span>}
        {results.length > 0 && <ul id={`${id}-results`} role="listbox" className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 shadow-lg">{results.map((stock, index) => <li key={stock.symbol} id={`${id}-option-${index}`} role="option" aria-selected={activeIndex === index}><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => chooseStock(stock)} className={`flex min-h-14 w-full items-center justify-between gap-4 rounded-lg px-3 py-2 text-left ${activeIndex === index ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--card-hover)]"}`}><span className="min-w-0"><strong className="block text-sm">{stock.symbol.replace(".JK", "")}</strong><span className="block truncate text-xs text-[var(--muted)]">{stock.longName ?? stock.shortName ?? "Nama tidak tersedia"}</span></span><span className="shrink-0 text-right"><span className="block text-sm font-semibold tabular-nums">{formatPrice(stock.price)}</span>{stock.changePercent != null && <span className={`block text-xs tabular-nums ${signClass(stock.changePercent)}`}>{formatPercent(stock.changePercent)}</span>}</span></button></li>)}</ul>}
      </div>
      {selectedStock && <div className="mt-2 flex flex-wrap items-center gap-2 text-xs"><span className="rounded-md bg-[var(--accent-soft)] px-2 py-1 font-semibold">{selectedStock.symbol.replace(".JK", "")} dipilih</span>{selectedStock.price != null && <span className="tabular-nums text-[var(--muted)]">Harga terakhir {formatPrice(selectedStock.price)}</span>}<button type="button" onClick={() => changeQuery("")} className="font-medium underline">Hapus</button></div>}
      {searchError && <p role="status" className="mt-2 text-xs text-[var(--muted)]">{searchError}</p>}
    </div>
  );
}
