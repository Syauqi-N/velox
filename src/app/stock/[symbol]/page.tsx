"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import PriceChart from "@/components/PriceChart";
import { formatPrice, formatPercent, formatCompact, signClass } from "@/lib/format";
import type {
  ChartResult,
  QuoteResult,
  QuoteSummaryResult,
} from "@/lib/yahoo";

interface StockResponse {
  quote: QuoteResult;
  summary: QuoteSummaryResult | null;
  chart: ChartResult | null;
}

function StockDetailClient() {
  const { symbol } = useParams<{ symbol: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [summary, setSummary] = useState<QuoteSummaryResult | null>(null);
  const [chart, setChart] = useState<ChartResult | null>(null);
  const [loadedSymbol, setLoadedSymbol] = useState<string | null>(null);
  const [failedSymbol, setFailedSymbol] = useState<string | null>(null);
  const loading = loadedSymbol !== symbol && failedSymbol !== symbol;
  const error = failedSymbol === symbol;

  useEffect(() => {
    if (!symbol || status !== "authenticated" || !session?.user?.id) return;
    let cancelled = false;
    fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}`)
      .then(async (response) => {
        const data: StockResponse & { error?: string } = await response.json();
        if (!response.ok) throw new Error(data.error ?? "fetch failed");
        return data;
      })
      .then((data: StockResponse) => {
        if (cancelled) return;
        setQuote(data.quote);
        setSummary(data.summary);
        setChart(data.chart);
        setLoadedSymbol(symbol);
        setFailedSymbol(null);
      })
      .catch(() => {
        if (!cancelled) setFailedSymbol(symbol);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, status, symbol]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && !session?.user?.id) {
      void signOut({ callbackUrl: "/login" });
    }
  }, [router, session?.user?.id, status]);

  if (status === "loading") {
    return (
      <AppShell>
        <div className="text-muted">Memuat...</div>
      </AppShell>
    );
  }
  if (status === "unauthenticated") {
    return null;
  }
  if (!session?.user?.id) {
    return null;
  }

  const sumDetail = summary?.summaryDetail;
  const finData = summary?.financialData;
  const profile = summary?.assetProfile;

  return (
    <AppShell userName={session.user.name} userRole={session.user.role}>
      <div className="mb-4">
        <Link
          href="/watchlist"
          className="text-xs text-muted hover:text-[var(--accent)]"
        >
          ← Kembali ke Watchlist
        </Link>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-muted">Memuat data...</div>
      ) : error ? (
        <div className="card p-10 text-center text-muted">
          Gagal memuat data saham.
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {quote?.symbol?.replace(".JK", "")}
                </h1>
                <span className="text-sm text-muted">
                  {quote?.longName ?? quote?.shortName}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-2xl font-bold tabular-nums">
                  {formatPrice(quote?.price)}
                </span>
                <span
                  className={`text-lg font-medium tabular-nums ${signClass(quote?.changePercent)}`}
                >
                  {formatPercent(quote?.changePercent)}
                </span>
              </div>
            </div>
            <div className="text-right text-xs text-muted">
              <div className="pill border border-[var(--border)] bg-[var(--card-hover)]">
                Data delayed (Yahoo Finance)
              </div>
              <div className="mt-2 uppercase tracking-wider">
                {quote?.marketState ?? "—"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Chart */}
            <div className="card p-4 lg:col-span-2">
              {chart?.bars?.length ? (
                <PriceChart data={chart} height={420} />
              ) : (
                <div className="flex h-[420px] items-center justify-center text-muted">
                  Tidak ada data chart
                </div>
              )}
            </div>

            {/* Key stats */}
            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
                  Statistik Kunci
                </h3>
                <dl className="space-y-2.5 text-sm">
                  <StatRow label="Market Cap" value={formatCompact(sumDetail?.marketCap)} />
                  <StatRow label="Volume" value={formatCompact(sumDetail?.volume)} />
                  <StatRow
                    label="52w High"
                    value={formatPrice(sumDetail?.fiftyTwoWeekHigh)}
                  />
                  <StatRow
                    label="52w Low"
                    value={formatPrice(sumDetail?.fiftyTwoWeekLow)}
                  />
                  <StatRow
                    label="Avg Volume"
                    value={formatCompact(sumDetail?.averageVolume)}
                  />
                  <StatRow
                    label="Forward P/E"
                    value={sumDetail?.forwardPE?.toFixed(2)}
                  />
                  <StatRow
                    label="Dividend Yield"
                    value={
                      sumDetail?.dividendYield != null
                        ? `${(sumDetail.dividendYield * 100).toFixed(2)}%`
                        : "—"
                    }
                  />
                </dl>
              </div>

              <div className="card p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
                  Fundamental
                </h3>
                <dl className="space-y-2.5 text-sm">
                  <StatRow
                    label="ROE"
                    value={
                      finData?.returnOnEquity != null
                        ? `${(finData.returnOnEquity * 100).toFixed(1)}%`
                        : "—"
                    }
                  />
                  <StatRow
                    label="ROA"
                    value={
                      finData?.returnOnAssets != null
                        ? `${(finData.returnOnAssets * 100).toFixed(1)}%`
                        : "—"
                    }
                  />
                  <StatRow
                    label="Revenue Growth"
                    value={
                      finData?.revenueGrowth != null
                        ? `${(finData.revenueGrowth * 100).toFixed(1)}%`
                        : "—"
                    }
                  />
                  <StatRow
                    label="Profit Margin"
                    value={
                      finData?.profitMargins != null
                        ? `${(finData.profitMargins * 100).toFixed(1)}%`
                        : "—"
                    }
                  />
                </dl>
              </div>
            </div>
          </div>

          {/* Company profile */}
          {profile && (
            <div className="card mt-6 p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
                Tentang Perusahaan
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                {profile.longBusinessSummary ?? "Informasi perusahaan tidak tersedia."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                {profile.sector && (
                  <span className="rounded-full border border-[var(--border)] px-2.5 py-1">
                    {profile.sector}
                  </span>
                )}
                {profile.industry && (
                  <span className="rounded-full border border-[var(--border)] px-2.5 py-1">
                    {profile.industry}
                  </span>
                )}
                {profile.country && (
                  <span className="rounded-full border border-[var(--border)] px-2.5 py-1">
                    {profile.country}
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

function StatRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium tabular-nums">{value ?? "—"}</dd>
    </div>
  );
}

export default function StockDetailPage() {
  return <StockDetailClient />;
}
