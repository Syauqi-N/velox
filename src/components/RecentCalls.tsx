"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import StockPicker from "@/components/StockPicker";
import CallChart from "@/components/calls/CallChart";
import { formatPrice } from "@/lib/format";

type Call = {
  id: string;
  ticker: string;
  action: "BUY" | "SELL" | "HOLD";
  status: "OPEN" | "CLOSED";
  entryLow: number | null;
  entryHigh: number | null;
  targetLow: number | null;
  targetHigh: number | null;
  reason: string | null;
};

// Render a low-high range as "X - Y", "X" when tight, or "—" when empty.
function formatRange(low: number | null, high: number | null): string {
  if (low == null && high == null) return "—";
  if (low != null && (high == null || Math.abs(high - low) < 0.005)) {
    return formatPrice(low);
  }
  if (low != null && high != null) return `${formatPrice(low)} - ${formatPrice(high)}`;
  return high != null ? `≤ ${formatPrice(high)}` : formatPrice(low as number);
}

export default function RecentCalls() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [calls, setCalls] = useState<Call[]>([]);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [openForm, setOpenForm] = useState(false);
  const [ticker, setTicker] = useState("");
  const [tickerQuery, setTickerQuery] = useState("");
  const [pickerKey, setPickerKey] = useState(0);
  const [action, setAction] = useState<Call["action"]>("BUY");
  const [entryLow, setEntryLow] = useState("");
  const [entryHigh, setEntryHigh] = useState("");
  const [targetLow, setTargetLow] = useState("");
  const [targetHigh, setTargetHigh] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setState("loading");
    try {
      const response = await fetch("/api/calls?limit=5");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCalls(data.calls ?? []);
      setState("ready");
    } catch {
      setState("error");
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/calls?limit=5")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data;
      })
      .then((data) => { if (!cancelled) { setCalls(data.calls ?? []); setState("ready"); } })
      .catch(() => { if (!cancelled) setState("error"); });
    return () => { cancelled = true; };
  }, []);

  async function createCall(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    if (!ticker) {
      setMessage(tickerQuery.trim() ? "Pilih saham dari dropdown agar ticker valid." : "Pilih saham untuk call.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, action, entryLow: entryLow ? Number(entryLow) : null, entryHigh: entryHigh ? Number(entryHigh) : null, targetLow: targetLow ? Number(targetLow) : null, targetHigh: targetHigh ? Number(targetHigh) : null, reason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTicker("");
      setTickerQuery("");
      setPickerKey((value) => value + 1);
      setEntryLow("");
      setEntryHigh("");
      setTargetLow("");
      setTargetHigh("");
      setReason("");
      setOpenForm(false);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Call tidak dapat dibuat.");
    } finally {
      setBusy(false);
    }
  }

  async function closeCall(call: Call) {
    if (!window.confirm(`Tutup call ${call.ticker.replace(".JK", "")} ini?`)) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/calls/${call.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Call tidak dapat ditutup.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3"><h2 className="text-sm font-semibold">Calls</h2>{isAdmin && <button type="button" onClick={() => setOpenForm((value) => !value)} className="btn-ghost min-h-11 px-3 text-sm">{openForm ? "Batal" : "Buat Call"}</button>}</div>
      {openForm && <form onSubmit={createCall} className="space-y-3 border-b border-[var(--border)] p-4"><StockPicker key={pickerKey} id="call-symbol" label="Saham" onChange={(stock, query) => { setTicker(stock?.symbol ?? ""); setTickerQuery(query); setMessage(""); }} /><label className="block text-sm font-medium"><span className="mb-1.5 block">Aksi</span><select value={action} onChange={(event) => setAction(event.target.value as Call["action"])} className="input"><option>BUY</option><option>SELL</option><option>HOLD</option></select></label><div className="grid grid-cols-2 gap-2"><label className="block text-sm font-medium"><span className="mb-1.5 block">Entry bawah, opsional</span><input type="number" min="1" value={entryLow} onChange={(event) => setEntryLow(event.target.value)} className="input" placeholder="Contoh 2500" aria-label="Harga entry bawah" /></label><label className="block text-sm font-medium"><span className="mb-1.5 block">Entry atas, opsional</span><input type="number" min="1" value={entryHigh} onChange={(event) => setEntryHigh(event.target.value)} className="input" placeholder="Contoh 2700" aria-label="Harga entry atas" /></label><label className="block text-sm font-medium"><span className="mb-1.5 block">Target bawah, opsional</span><input type="number" min="1" value={targetLow} onChange={(event) => setTargetLow(event.target.value)} className="input" placeholder="Contoh 3000" aria-label="Harga target bawah" /></label><label className="block text-sm font-medium"><span className="mb-1.5 block">Target atas, opsional</span><input type="number" min="1" value={targetHigh} onChange={(event) => setTargetHigh(event.target.value)} className="input" placeholder="Contoh 3200" aria-label="Harga target atas" /></label></div><textarea value={reason} maxLength={1000} onChange={(event) => setReason(event.target.value)} className="input min-h-20" placeholder="Alasan, opsional" aria-label="Alasan call opsional" /><button disabled={busy} className="btn-gold min-h-11 w-full text-sm">{busy ? "Membuat" : "Buat Call"}</button></form>}
      {message && <p role="alert" className="px-4 pt-3 text-xs text-[var(--down)]">{message}</p>}
      {state === "loading" ? <p className="px-4 py-5 text-sm text-[var(--muted)]">Memuat call.</p> : state === "error" ? <div className="px-4 py-5 text-sm"><p className="text-[var(--down)]">Call tidak dapat dimuat.</p><button type="button" onClick={() => void load()} className="mt-2 font-medium underline">Coba lagi</button></div> : calls.length === 0 ? <p className="px-4 py-5 text-sm text-[var(--muted)]">Belum ada call.</p> : (
        <ul className="flex gap-2 overflow-x-auto p-3 scrollbar-hide">
          {calls.map((call) => <li key={call.id} className="w-64 shrink-0 rounded-xl border border-[var(--border)] bg-[var(--card-hover)] p-3"><div className="flex items-center justify-between gap-2"><Link href={`/stock/${call.ticker}`} className="font-semibold hover:text-[var(--accent)]">{call.ticker.replace(".JK", "")}</Link><span className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-xs">{call.action} · {call.status === "OPEN" ? "Aktif" : "Selesai"}</span></div><p className="mt-1 text-xs tabular-nums text-[var(--muted)]">Entry {formatRange(call.entryLow, call.entryHigh)} · Target {formatRange(call.targetLow, call.targetHigh)}</p>{call.reason && <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">{call.reason}</p>}<CallChart symbol={call.ticker} height={120} />{isAdmin && call.status === "OPEN" && <button type="button" disabled={busy} onClick={() => void closeCall(call)} className="mt-2 text-xs font-medium underline">Tutup Call</button>}</li>)}
        </ul>
      )}
    </section>
  );
}
