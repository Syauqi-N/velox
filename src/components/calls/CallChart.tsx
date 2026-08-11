"use client";

import { useEffect, useRef, useState } from "react";
import PriceChart from "@/components/PriceChart";
import { formatPrice } from "@/lib/format";
import type { ChartResult } from "@/lib/yahoo";

const chartRequests = new Map<string, Promise<ChartResult>>();

function requestChart(symbol: string) {
  const existing = chartRequests.get(symbol);
  if (existing) return existing;
  const request = fetch(`/api/chart?symbol=${encodeURIComponent(symbol)}&period=3mo&interval=1d`)
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Chart tidak tersedia.");
      return data as ChartResult;
    })
    .catch((error) => {
      chartRequests.delete(symbol);
      throw error;
    });
  chartRequests.set(symbol, request);
  return request;
}

export default function CallChart({ symbol, height = 180 }: { symbol: string; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<ChartResult | null>(null);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "240px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    requestChart(symbol)
      .then((result) => { if (!cancelled) setData(result); })
      .catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Chart tidak tersedia."); });
    return () => { cancelled = true; };
  }, [requestKey, symbol, visible]);

  function retry() {
    chartRequests.delete(symbol);
    setData(null);
    setError("");
    setRequestKey((value) => value + 1);
  }

  return (
    <div ref={containerRef} className="mt-3 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2 text-[11px] text-[var(--muted)]"><span>Chart 3 bulan</span>{data?.meta.regularMarketPrice != null && <span className="font-semibold tabular-nums text-[var(--foreground)]">Terkini {formatPrice(data.meta.regularMarketPrice)}</span>}</div>
      {!visible || (!data && !error) ? <div className="flex items-center justify-center text-xs text-[var(--muted)]" style={{ height }}>Memuat chart.</div> : error ? <div className="flex flex-col items-center justify-center px-3 text-center text-xs text-[var(--muted)]" style={{ height }}><p>{error}</p><button type="button" onClick={retry} className="mt-2 font-medium text-[var(--foreground)] underline">Coba lagi</button></div> : data ? <PriceChart data={data} height={height} /> : null}
    </div>
  );
}
