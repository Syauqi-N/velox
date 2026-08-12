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
  targetPrice: number | null;
  entryPrice: number | null;
  reason: string | null;
};

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
  const [entryPrice, setEntryPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
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
        body: JSON.stringify({ ticker, action, entryPrice: entryPrice ? Number(entryPrice) : null, targetPrice: targetPrice ? Number(targetPrice) : null, reason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTicker("");
      setTickerQuery("");
      setPickerKey((value) => value + 1);
      setEntryPrice("");
      setTargetPrice("");
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
      {openForm && <form onSubmit={createCall} className="space-y-3 border-b border-[var(--border)] p-4"><StockPicker key={pickerKey} id="call-symbol" label="Saham" onChange={(stock, query) => { setTicker(stock?.symbol ?? ""); setTickerQuery(query); setMessage(""); }} /><label className="block text-sm font-medium"><span className="mb-1.5 block">Aksi</span><select value={action} onChange={(event) => setAction(event.target.value as Call["action"])} className="input"><option>BUY</option><option>SELL</option><option>HOLD</option></select></label><input type="number" min="1" value={entryPrice} onChange={(event) => setEntryPrice(event.target.value)} className="input" placeholder="Entry, opsional" aria-label="Harga entry opsional" /><input type="number" min="1" value={targetPrice} onChange={(event) => setTargetPrice(event.target.value)} className="input" placeholder="Target, opsional" aria-label="Harga target opsional" /><textarea value={reason} maxLength={1000} onChange={(event) => setReason(event.target.value)} className="input min-h-20" placeholder="Alasan, opsional" aria-label="Alasan call opsional" /><button disabled={busy} className="btn-gold min-h-11 w-full text-sm">{busy ? "Membuat" : "Buat Call"}</button></form>}
      {message && <p role="alert" className="px-4 pt-3 text-xs text-[var(--down)]">{message}</p>}
      {state === "loading" ? <p className="px-4 py-5 text-sm text-[var(--muted)]">Memuat call.</p> : state === "error" ? <div className="px-4 py-5 text-sm"><p className="text-[var(--down)]">Call tidak dapat dimuat.</p><button type="button" onClick={() => void load()} className="mt-2 font-medium underline">Coba lagi</button></div> : calls.length === 0 ? <p className="px-4 py-5 text-sm text-[var(--muted)]">Belum ada call.</p> : (
        <ul className="flex gap-2 overflow-x-auto p-3 scrollbar-hide">
          {calls.map((call) => <li key={call.id} className="w-64 shrink-0 rounded-xl border border-[var(--border)] bg-[var(--card-hover)] p-3"><div className="flex items-center justify-between gap-2"><Link href={`/stock/${call.ticker}`} className="font-semibold hover:text-[var(--accent)]">{call.ticker.replace(".JK", "")}</Link><span className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-xs">{call.action} · {call.status === "OPEN" ? "Aktif" : "Selesai"}</span></div><p className="mt-1 text-xs tabular-nums text-[var(--muted)]">Entry {formatPrice(call.entryPrice)} · Target {formatPrice(call.targetPrice)}</p>{call.reason && <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">{call.reason}</p>}<CallChart symbol={call.ticker} height={120} />{isAdmin && call.status === "OPEN" && <button type="button" disabled={busy} onClick={() => void closeCall(call)} className="mt-2 text-xs font-medium underline">Tutup Call</button>}</li>)}
        </ul>
      )}
    </section>
  );
}
