"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  publishedAt: string | null;
  source: string;
}

const CLIENT_CACHE_MS = 5 * 60_000;
let clientCache: { items: NewsItem[]; freshUntil: number } | null = null;
let pendingRequest: Promise<NewsItem[]> | null = null;

function loadNews(force = false): Promise<NewsItem[]> {
  if (!force && clientCache && clientCache.freshUntil > Date.now()) {
    return Promise.resolve(clientCache.items);
  }
  if (pendingRequest) return pendingRequest;

  pendingRequest = fetch(force ? "/api/news?refresh=1" : "/api/news", force ? { cache: "no-store" } : undefined)
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal memuat berita.");
      const items = data.items as NewsItem[];
      clientCache = { items, freshUntil: Date.now() + CLIENT_CACHE_MS };
      return items;
    })
    .finally(() => { pendingRequest = null; });

  return pendingRequest;
}

function articleTime(value: string | null): string {
  if (!value) return "Waktu tidak tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Waktu tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export default function NewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<NewsItem[]>(() => clientCache?.items ?? []);
  const [loading, setLoading] = useState(() => !clientCache?.items.length);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && !session?.user?.id) void signOut({ callbackUrl: "/login" });
  }, [router, session?.user?.id, status]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    let cancelled = false;
    const isManualRefresh = reloadKey > 0;
    loadNews(isManualRefresh)
      .then((news) => { if (!cancelled) { setItems(news); setLoading(false); setRefreshing(false); } })
      .catch((reason) => { if (!cancelled) { setError(reason instanceof Error ? reason.message : "Gagal memuat berita."); setLoading(false); setRefreshing(false); } });
    return () => { cancelled = true; };
  }, [reloadKey, session?.user?.id, status]);

  if (status === "loading") return <AppShell><p className="text-sm text-[var(--muted)]">Memuat berita.</p></AppShell>;
  if (status === "unauthenticated" || !session?.user?.id) return null;

  return (
    <AppShell userName={session.user.name} userRole={session.user.role}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Market update</div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">News</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">Headline pasar terbaru. Klik kartu untuk membaca berita lengkap langsung di situs penerbit.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-[var(--border-strong)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium">CNBC Indonesia · Market</div>
          <button
            type="button"
            disabled={loading || refreshing}
            onClick={() => { setRefreshing(true); setError(""); setReloadKey((value) => value + 1); }}
            className="btn-ghost inline-flex min-h-10 items-center gap-2 px-3 text-xs disabled:cursor-wait disabled:opacity-60"
          >
            <span aria-hidden="true" className={refreshing ? "animate-spin" : ""}>↻</span>
            {refreshing ? "Memperbarui" : "Perbarui berita"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((item) => <div key={item} className="card h-56 animate-pulse bg-[var(--card-hover)]" />)}
        </div>
      ) : error ? (
        <div className="card px-5 py-10 text-center">
          <p role="alert" className="text-sm text-[var(--text-muted)]">{error}</p>
          <button type="button" onClick={() => { setLoading(true); setRefreshing(true); setError(""); setReloadKey((value) => value + 1); }} className="btn-ghost mt-4 min-h-11 px-4 text-sm">Coba lagi</button>
        </div>
      ) : items.length === 0 ? (
        <div className="card px-5 py-10 text-center text-sm text-[var(--text-muted)]">Belum ada berita pasar yang tersedia.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item, index) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group card flex min-h-56 flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:p-6 ${index === 0 ? "md:col-span-2 md:min-h-64" : ""}`}
            >
              <div className="flex items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
                <span className="font-semibold uppercase tracking-wider text-[var(--accent)]">{item.source}</span>
                <time dateTime={item.publishedAt ?? undefined}>{articleTime(item.publishedAt)} WIB</time>
              </div>
              <h2 className={`mt-4 font-bold leading-snug tracking-tight group-hover:text-[#9a7426] ${index === 0 ? "text-xl sm:max-w-4xl sm:text-2xl" : "text-lg"}`}>{item.title}</h2>
              <p className={`mt-3 text-sm leading-6 text-[var(--text-muted)] ${index === 0 ? "sm:max-w-4xl" : ""}`}>{item.excerpt}</p>
              <span className="mt-auto pt-5 text-sm font-semibold">Baca artikel asli <span aria-hidden="true">↗</span></span>
            </a>
          ))}
        </div>
      )}

      <p className="mt-5 text-xs leading-5 text-[var(--text-muted)]">Headline dan cuplikan berasal dari feed penerbit. Isi lengkap tetap dibaca di situs sumber.</p>
    </AppShell>
  );
}
