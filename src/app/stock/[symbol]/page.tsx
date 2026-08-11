"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import PriceChart from "@/components/PriceChart";
import PostComposer from "@/components/feed/PostComposer";
import SocialFeed from "@/components/feed/SocialFeed";
import StockbitLink from "@/components/StockbitLink";
import { formatCompact, formatPercent, formatPrice, signClass } from "@/lib/format";
import type { ChartResult, QuoteResult, QuoteSummaryResult } from "@/lib/yahoo";

interface StockResponse { quote: QuoteResult; summary: QuoteSummaryResult | null; chart: ChartResult | null }

export default function StockDetailPage() {
  const { symbol: rawSymbol } = useParams<{ symbol: string }>();
  const symbol = rawSymbol.toUpperCase();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stock, setStock] = useState<StockResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"summary" | "discussion">("summary");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [feedRefresh, setFeedRefresh] = useState(0);

  async function load() {
    setLoading(true); setError("");
    try {
      const [stockRes, watchlistRes] = await Promise.all([fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}`), fetch("/api/watchlist")]);
      const payload = await stockRes.json();
      if (!stockRes.ok) throw new Error(payload.error ?? "Data saham tidak tersedia.");
      setStock(payload as StockResponse);
      if (watchlistRes.ok) { const list = await watchlistRes.json(); setSaved((list.symbols ?? []).includes(symbol)); }
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Data saham tidak tersedia."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    let cancelled = false;
    Promise.all([fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}`), fetch("/api/watchlist")]).then(async ([stockRes, watchlistRes]) => {
      const payload = await stockRes.json();
      if (!stockRes.ok) throw new Error(payload.error ?? "Data saham tidak tersedia.");
      const list = watchlistRes.ok ? await watchlistRes.json() : { symbols: [] };
      return { payload, list };
    }).then(({ payload, list }) => { if (!cancelled) { setStock(payload as StockResponse); setSaved((list.symbols ?? []).includes(symbol)); } }).catch((reason: unknown) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Data saham tidak tersedia."); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [session?.user?.id, status, symbol]);
  useEffect(() => { if (status === "unauthenticated") router.replace("/login"); if (status === "authenticated" && !session?.user?.id) void signOut({ callbackUrl: "/login" }); }, [router, session?.user?.id, status]);

  async function toggleWatchlist() {
    setSaving(true); setSaveError("");
    try {
      const res = await fetch(saved ? `/api/watchlist?symbol=${encodeURIComponent(symbol)}` : "/api/watchlist", saved ? { method: "DELETE" } : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ symbol }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Watchlist tidak dapat diperbarui.");
      setSaved(!saved);
    } catch (reason) { setSaveError(reason instanceof Error ? reason.message : "Watchlist tidak dapat diperbarui."); }
    finally { setSaving(false); }
  }

  if (status === "loading" || status === "unauthenticated" || !session?.user?.id) return status === "loading" ? <AppShell><p className="text-[var(--muted)]">Memuat akun.</p></AppShell> : null;
  const quote = stock?.quote;
  const details = stock?.summary?.summaryDetail;
  const financial = stock?.summary?.financialData;
  const profile = stock?.summary?.assetProfile;
  const tabs = [{ id: "summary", label: "Ringkasan" }, { id: "discussion", label: "Diskusi" }] as const;

  return <AppShell userName={session.user.name} userRole={session.user.role}>
    <Link href="/charts" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">Kembali ke Saham</Link>
    {loading ? <div className="card mt-4 p-8 text-center text-[var(--muted)]">Memuat data saham.</div> : error ? <div className="card mt-4 p-8 text-center"><p className="text-[var(--down)]">{error}</p><button type="button" onClick={() => void load()} className="mt-3 font-medium text-[var(--foreground)] underline">Coba lagi</button></div> : <>
      <header className="mt-5 border-b border-[var(--border)] pb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><h1 className="text-3xl font-bold tabular-nums">{quote?.symbol?.replace(".JK", "")}</h1><p className="text-sm text-[var(--muted)]">{quote?.longName ?? quote?.shortName ?? "Nama tidak tersedia"}</p></div><div className="mt-2 flex items-baseline gap-3"><strong className="text-2xl tabular-nums">{formatPrice(quote?.price)}</strong><span className={`font-medium tabular-nums ${signClass(quote?.changePercent)}`}>{formatPercent(quote?.changePercent)}</span></div></div>
          <div className="flex flex-col items-end gap-2"><span className="rounded-md border border-[var(--border)] bg-[var(--card-hover)] px-2 py-1 text-xs text-[var(--muted)]">Data delayed, Yahoo Finance</span><div className="flex flex-wrap justify-end gap-2"><StockbitLink symbol={symbol} /><button type="button" onClick={() => void toggleWatchlist()} disabled={saving} className={saved ? "btn-ghost min-h-11 px-4 text-sm" : "btn-gold min-h-11 px-4 text-sm"}>{saving ? "Menyimpan" : saved ? "Hapus Watchlist" : "Tambah Watchlist"}</button></div>{saveError && <p role="alert" className="text-xs text-[var(--down)]">{saveError}</p>}</div>
        </div>
      </header>
      <div role="tablist" aria-label="Konten saham" className="mt-5 flex gap-1 border-b border-[var(--border)]">
        {tabs.map((item) => <button key={item.id} id={`${item.id}-tab`} type="button" role="tab" aria-selected={tab === item.id} aria-controls={`${item.id}-panel`} onClick={() => setTab(item.id)} className={`min-h-11 border-b-2 px-4 text-sm font-medium ${tab === item.id ? "border-[var(--accent)] text-[var(--foreground)]" : "border-transparent text-[var(--muted)]"}`}>{item.label}</button>)}
      </div>
      {tab === "summary" ? <section id="summary-panel" role="tabpanel" aria-labelledby="summary-tab" className="mt-5"><div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]"><div className="card p-4">{stock?.chart?.bars?.length ? <PriceChart data={stock.chart} height={420} /> : <div className="flex h-[420px] items-center justify-center text-sm text-[var(--muted)]">Chart tidak tersedia untuk periode ini.</div>}</div><div className="card p-5"><h2 className="text-base font-semibold">Statistik dasar</h2><dl className="mt-4 divide-y divide-[var(--border)]"><Stat label="Market cap" value={formatCompact(details?.marketCap ?? 0)} empty={details?.marketCap == null}/><Stat label="Volume" value={formatCompact(details?.volume ?? 0)} empty={details?.volume == null}/><Stat label="52 minggu tertinggi" value={formatPrice(details?.fiftyTwoWeekHigh)} /><Stat label="52 minggu terendah" value={formatPrice(details?.fiftyTwoWeekLow)} /><Stat label="Forward P/E" value={details?.forwardPE?.toFixed(2) ?? "Tidak tersedia"}/></dl></div></div>{profile && <div className="card mt-4 p-5"><h2 className="text-base font-semibold">Tentang perusahaan</h2><p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{profile.longBusinessSummary ?? "Profil perusahaan tidak tersedia."}</p>{financial?.revenueGrowth != null && <p className="mt-3 text-sm text-[var(--muted)]">Pertumbuhan pendapatan: <span className="font-medium tabular-nums text-[var(--foreground)]">{formatPercent(financial.revenueGrowth * 100)}</span></p>}</div>}</section> : <section id="discussion-panel" role="tabpanel" aria-labelledby="discussion-tab" className="mt-5 space-y-4"><div><h2 className="text-lg font-semibold">Diskusi {symbol.replace(".JK", "")}</h2><p className="mt-1 text-sm text-[var(--muted)]">Bagikan riset atau pertanyaan yang relevan dengan ticker ini.</p></div><PostComposer initialSymbol={symbol} onCreated={() => setFeedRefresh((value) => value + 1)} /><SocialFeed symbol={symbol} refreshTick={feedRefresh} /></section>}
    </>}
  </AppShell>;
}

function Stat({ label, value, empty = false }: { label: string; value: string; empty?: boolean }) { return <div className="flex items-center justify-between gap-4 py-2.5 text-sm"><dt className="text-[var(--muted)]">{label}</dt><dd className="font-medium tabular-nums">{empty ? "Tidak tersedia" : value}</dd></div>; }
