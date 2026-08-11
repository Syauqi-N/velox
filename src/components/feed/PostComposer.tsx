"use client";

import { useState } from "react";
import StockPicker from "@/components/StockPicker";
import type { FeedPost } from "@/lib/feed";

export default function PostComposer({ onCreated, initialSymbol }: { onCreated: (post: FeedPost) => void; initialSymbol?: string }) {
  const initialTicker = initialSymbol?.replace(".JK", "") ?? "";
  const [content, setContent] = useState("");
  const [symbol, setSymbol] = useState(initialSymbol ?? "");
  const [tickerQuery, setTickerQuery] = useState(initialTicker);
  const [pickerKey, setPickerKey] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function insertTristaMention() {
    setContent((value) => /(^|\s)@trista\b/i.test(value) ? value : `${value}${value.trim() ? " " : ""}@TRISTA `);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const text = content.trim();
    if (!text && !image) return;
    if (tickerQuery.trim() && !symbol) { setError("Pilih saham dari dropdown agar ticker valid."); return; }
    setSubmitting(true);
    try {
      const body = new FormData();
      body.set("content", text);
      if (symbol) body.set("symbol", symbol);
      if (image) body.set("image", image);
      const res = await fetch("/api/posts", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal memposting.");
      onCreated(data.post as FeedPost);
      setContent("");
      setImage(null);
      if (!initialSymbol) { setSymbol(""); setTickerQuery(""); setPickerKey((value) => value + 1); }
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Terjadi kesalahan."); }
    finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={submit} className="card p-4">
      <div className="mb-3 max-w-xl"><StockPicker key={pickerKey} id="post-symbol" label="Saham terkait" optional initialSymbol={initialSymbol} onChange={(stock, query) => { setSymbol(stock?.symbol ?? ""); setTickerQuery(query); setError(""); }} /></div>
      <label htmlFor="post-content" className="sr-only">Isi postingan</label>
      <textarea id="post-content" value={content} onChange={(event) => setContent(event.target.value)} maxLength={2000} rows={3} className="input resize-none" placeholder="Bagikan analisa atau mention @TRISTA untuk meminta analisis…" />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="btn-ghost inline-flex min-h-11 cursor-pointer items-center px-3 text-sm">
          Tambah gambar atau GIF
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(event) => setImage(event.target.files?.[0] ?? null)} />
        </label>
        <button type="button" onClick={insertTristaMention} className="btn-ghost min-h-11 px-3 text-sm">@TRISTA</button>
        {image && <><span className="max-w-64 truncate text-xs text-[var(--muted)]">{image.name}</span><button type="button" onClick={() => setImage(null)} className="text-xs font-medium underline">Hapus</button></>}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3"><span className={`text-xs ${content.length >= 2000 ? "text-[var(--down)]" : "text-[var(--muted)]"}`}>{content.length}/2000</span><button type="submit" disabled={submitting || (!content.trim() && !image)} className="btn-gold min-h-11 px-4 text-sm">{submitting ? "Memposting" : "Posting"}</button></div>
      {error && <div role="alert" className="mt-2 text-sm text-[var(--down)]">{error}</div>}
    </form>
  );
}
