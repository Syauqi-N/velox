"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import StockPicker from "@/components/StockPicker";
import CallChart from "@/components/calls/CallChart";
import { formatDateTime, formatPrice } from "@/lib/format";

type CallStatus = "OPEN" | "CLOSED";
interface Call { id: string; ticker: string; action: "BUY" | "SELL" | "HOLD"; status: CallStatus; entryLow: number | null; entryHigh: number | null; targetLow: number | null; targetHigh: number | null; reason: string | null; createdAt: string; closedAt: string | null; author: { name: string | null; email: string } }
const styles = { BUY: "border-[var(--up)]/30 bg-[var(--up)]/10 text-[var(--up)]", SELL: "border-[var(--down)]/30 bg-[var(--down)]/10 text-[var(--down)]", HOLD: "border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--foreground)]" };

export default function CallsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | CallStatus>("ALL");
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [ticker, setTicker] = useState(""); const [tickerQuery, setTickerQuery] = useState(""); const [pickerKey, setPickerKey] = useState(0); const [action, setAction] = useState<Call["action"]>("BUY"); const [entryLow, setEntryLow] = useState(""); const [entryHigh, setEntryHigh] = useState(""); const [targetLow, setTargetLow] = useState(""); const [targetHigh, setTargetHigh] = useState(""); const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false); const [formError, setFormError] = useState(""); const [closing, setClosing] = useState<string | null>(null);
  const isAdmin = session?.user?.role === "admin";

  async function loadCalls() { setLoading(true); setLoadError(""); try { const query = filter === "ALL" ? "" : `?status=${filter}`; const res = await fetch(`/api/calls${query}`); const data = await res.json(); if (!res.ok) throw new Error(data.error ?? "Trading calls tidak tersedia."); setCalls(data.calls ?? []); } catch (error) { setLoadError(error instanceof Error ? error.message : "Trading calls tidak tersedia."); } finally { setLoading(false); } }
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    let cancelled = false;
    const query = filter === "ALL" ? "" : `?status=${filter}`;
    fetch(`/api/calls${query}`).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Trading calls tidak tersedia.");
      return data;
    }).then((data) => { if (!cancelled) { setCalls(data.calls ?? []); setLoadError(""); } }).catch((error: unknown) => { if (!cancelled) setLoadError(error instanceof Error ? error.message : "Trading calls tidak tersedia."); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filter, session?.user?.id, status]);
  useEffect(() => { if (status === "unauthenticated") router.replace("/login"); if (status === "authenticated" && !session?.user?.id) void signOut({ callbackUrl: "/login" }); }, [router, session?.user?.id, status]);

  async function submit(event: React.FormEvent) { event.preventDefault(); setFormError(""); if (!ticker) { setFormError(tickerQuery.trim() ? "Pilih saham dari dropdown agar ticker valid." : "Pilih saham untuk call."); return; } setSubmitting(true); try { const res = await fetch("/api/calls", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticker, action, entryLow: entryLow ? Number(entryLow) : null, entryHigh: entryHigh ? Number(entryHigh) : null, targetLow: targetLow ? Number(targetLow) : null, targetHigh: targetHigh ? Number(targetHigh) : null, reason }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error ?? "Call tidak dapat dibuat."); setTicker(""); setTickerQuery(""); setPickerKey((value) => value + 1); setAction("BUY"); setEntryLow(""); setEntryHigh(""); setTargetLow(""); setTargetHigh(""); setReason(""); await loadCalls(); } catch (error) { setFormError(error instanceof Error ? error.message : "Call tidak dapat dibuat."); } finally { setSubmitting(false); } }
  async function closeCall(call: Call) { if (!window.confirm(`Tutup call ${call.ticker.replace(".JK", "")} ini?`)) return; setClosing(call.id); try { const res = await fetch(`/api/calls/${call.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CLOSED" }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error ?? "Call tidak dapat ditutup."); await loadCalls(); } catch (error) { setLoadError(error instanceof Error ? error.message : "Call tidak dapat ditutup."); } finally { setClosing(null); } }

  if (status === "loading" || status === "unauthenticated" || !session?.user?.id) return status === "loading" ? <AppShell><p className="text-[var(--muted)]">Memuat akun.</p></AppShell> : null;
  return <AppShell userName={session.user.name} userRole={session.user.role}>
    <header className="mb-6"><h1 className="text-2xl font-bold">Calls</h1><p className="mt-1 text-sm text-[var(--muted)]">Call dari admin Velox. Konten komunitas bukan instruksi transaksi.</p></header>
    {isAdmin && <section className="card mb-6 p-5"><h2 className="text-base font-semibold">Buat call</h2><form onSubmit={submit} className="mt-4 space-y-4"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="sm:col-span-2"><StockPicker key={pickerKey} id="calls-page-symbol" label="Saham" onChange={(stock, query) => { setTicker(stock?.symbol ?? ""); setTickerQuery(query); setFormError(""); }} /></div><Field label="Aksi"><select value={action} onChange={(event) => setAction(event.target.value as Call["action"])} className="input"><option>BUY</option><option>SELL</option><option>HOLD</option></select></Field></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Field label="Entry bawah"><input type="number" min="1" value={entryLow} onChange={(event) => setEntryLow(event.target.value)} className="input" /></Field><Field label="Entry atas"><input type="number" min="1" value={entryHigh} onChange={(event) => setEntryHigh(event.target.value)} className="input" /></Field><Field label="Target bawah"><input type="number" min="1" value={targetLow} onChange={(event) => setTargetLow(event.target.value)} className="input" /></Field><Field label="Target atas"><input type="number" min="1" value={targetHigh} onChange={(event) => setTargetHigh(event.target.value)} className="input" /></Field></div><Field label="Alasan, opsional"><textarea maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} className="input min-h-24" placeholder="Alasan spesifik untuk call ini." /></Field>{formError && <p role="alert" className="text-sm text-[var(--down)]">{formError}</p>}<button disabled={submitting} className="btn-gold min-h-11 px-4 text-sm">{submitting ? "Membuat call" : "Buat Call"}</button></form></section>}
    <div className="mb-4 flex gap-2" aria-label="Filter status call">{(["ALL", "OPEN", "CLOSED"] as const).map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={`min-h-11 rounded-lg border px-3 text-sm font-medium ${filter === value ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--foreground)]" : "border-[var(--border)] text-[var(--muted)]"}`}>{value === "ALL" ? "Semua" : value === "OPEN" ? "Aktif" : "Selesai"}</button>)}</div>
    {loading ? <div className="card p-8 text-center text-[var(--muted)]">Memuat calls.</div> : loadError ? <div className="card p-8 text-center"><p className="text-[var(--down)]">{loadError}</p><button type="button" onClick={() => void loadCalls()} className="mt-3 font-medium underline">Coba lagi</button></div> : calls.length === 0 ? <div className="card p-8 text-center text-[var(--muted)]">Belum ada call untuk filter ini.</div> : <div className="space-y-3">{calls.map((call) => <article key={call.id} className="card p-5"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-md border px-2 py-1 text-xs font-bold ${styles[call.action]}`}>{call.action}</span><Link href={`/stock/${call.ticker}`} className="text-lg font-semibold hover:text-[var(--accent)]">{call.ticker.replace(".JK", "")}</Link><span className={`rounded-md px-2 py-1 text-xs font-medium ${call.status === "OPEN" ? "bg-[var(--accent-soft)] text-[var(--foreground)]" : "bg-[var(--card-hover)] text-[var(--muted)]"}`}>{call.status === "OPEN" ? "Aktif" : "Selesai"}</span><time className="ml-auto text-xs text-[var(--muted)]">{formatDateTime(call.createdAt)}</time></div><dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm"><div><dt className="inline text-[var(--muted)]">Entry: </dt><dd className="inline font-medium tabular-nums">{formatPriceRange(call.entryLow, call.entryHigh)}</dd></div><div><dt className="inline text-[var(--muted)]">Target: </dt><dd className="inline font-medium tabular-nums">{formatPriceRange(call.targetLow, call.targetHigh)}</dd></div></dl>{call.reason && <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{call.reason}</p>}<CallChart symbol={call.ticker} height={220} /><div className="mt-4 flex items-center justify-between gap-3 text-xs text-[var(--muted)]"><span>oleh {call.author.name ?? call.author.email}{call.closedAt ? `, ditutup ${formatDateTime(call.closedAt)}` : ""}</span>{isAdmin && call.status === "OPEN" && <button type="button" onClick={() => void closeCall(call)} disabled={closing === call.id} className="btn-ghost min-h-11 px-3 text-sm">{closing === call.id ? "Menutup" : "Tutup Call"}</button>}</div></article>)}</div>}
  </AppShell>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-[var(--foreground)]"><span className="mb-1.5 block">{label}</span>{children}</label>; }

function formatPriceRange(low: number | null, high: number | null): string {
  if (low == null && high == null) return "—";
  if (low != null && (high == null || Math.abs(high - low) < 0.005)) return formatPrice(low);
  if (low != null && high != null) return `${formatPrice(low)} - ${formatPrice(high)}`;
  return high != null ? `≤ ${formatPrice(high)}` : formatPrice(low as number);
}
