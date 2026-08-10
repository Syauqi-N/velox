"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import PriceChart from "@/components/PriceChart";
import { IDX_WATCHLIST, IHSG_SYMBOL } from "@/lib/constants";
import type { ChartResult } from "@/lib/yahoo";

const periods = [
  { label: "1B", value: "1mo", interval: "1d" },
  { label: "3B", value: "3mo", interval: "1d" },
  { label: "6B", value: "6mo", interval: "1d" },
  { label: "1T", value: "1y", interval: "1d" },
  { label: "5T", value: "5y", interval: "1wk" },
];

const allSymbols = [
  { symbol: IHSG_SYMBOL, label: "IHSG" },
  ...IDX_WATCHLIST.map((s) => ({
    symbol: s,
    label: s.replace(".JK", ""),
  })),
];

function ChartsClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [symbol, setSymbol] = useState(IHSG_SYMBOL);
  const [periodIdx, setPeriodIdx] = useState(3); // default 1y
  const [chart, setChart] = useState<ChartResult | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const requestKey = `${symbol}:${periodIdx}`;
  const loading = loadedKey !== requestKey && errorKey !== requestKey;
  const error = errorKey === requestKey;

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    let cancelled = false;

    async function loadChart() {
      try {
        const p = periods[periodIdx];
        const res = await fetch(
          `/api/chart?symbol=${encodeURIComponent(symbol)}&period=${p.value}&interval=${p.interval}`,
        );
        if (!res.ok) throw new Error("fetch failed");
        const data: ChartResult = await res.json();
        if (!cancelled) {
          setChart(data);
          setLoadedKey(requestKey);
          setErrorKey(null);
        }
      } catch {
        if (!cancelled) {
          setErrorKey(requestKey);
          setChart(null);
        }
      }
    }

    void loadChart();
    return () => {
      cancelled = true;
    };
  }, [periodIdx, requestKey, session?.user?.id, status, symbol]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && !session?.user?.id) {
      void signOut({ callbackUrl: "/login" });
    }
  }, [router, session?.user?.id, status]);

  if (status === "loading") {
    return (
      <AppShell>
        <div className="text-[var(--text-muted)]">Memuat...</div>
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
      <div className="mb-6">
        <div className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
          Market Data
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Market Charts</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Chart IHSG dan saham individual. Data delayed dari Yahoo Finance.
        </p>
      </div>

      {/* Symbol selector */}
      <div className="mb-4 flex flex-wrap gap-2">
        {allSymbols.map((s) => (
          <button
            key={s.symbol}
            onClick={() => setSymbol(s.symbol)}
            className={`rounded-lg px-3.5 py-2 text-sm transition-all ${
              symbol === s.symbol
                ? "bg-[var(--accent)] font-semibold text-[#0a0e14] shadow-[0_0_20px_rgba(255,215,0,0.25)]"
                : "border border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Period selector */}
      <div className="mb-4 flex gap-1">
        {periods.map((p, i) => (
          <button
            key={p.value}
            onClick={() => setPeriodIdx(i)}
            className={`rounded-lg px-3.5 py-1.5 text-xs transition-all ${
              periodIdx === i
                ? "border border-[var(--border-strong)] bg-[var(--card-hover)] text-[var(--foreground)]"
                : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="card p-4">
        {loading ? (
          <div className="flex h-[420px] items-center justify-center text-[var(--text-muted)]">
            Memuat chart...
          </div>
        ) : error ? (
          <div className="flex h-[420px] items-center justify-center text-[var(--text-muted)]">
            Gagal memuat data chart.
          </div>
        ) : chart ? (
          <PriceChart data={chart} height={420} />
        ) : null}
      </div>
    </AppShell>
  );
}

export default function ChartsPage() {
  return <ChartsClient />;
}
