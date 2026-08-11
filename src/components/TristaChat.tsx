"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import type { TristaMessage } from "@/lib/trista-core";

const welcome: TristaMessage = {
  role: "assistant",
  content: "Halo, gue TRISTA. Mau bahas emiten IDX, tesis investasi, risiko portofolio, atau timing sebuah saham?",
};

const STORAGE_KEY = "trista-chat-history";
const STORAGE_TTL_MS = 24 * 60 * 60 * 1_000; // 24 jam

function loadHistory(): TristaMessage[] {
  if (typeof window === "undefined") return [welcome];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [welcome];
    const parsed = JSON.parse(raw) as { savedAt: number; messages: TristaMessage[] };
    if (Date.now() - parsed.savedAt > STORAGE_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return [welcome];
    }
    const messages = Array.isArray(parsed.messages) ? parsed.messages : [];
    return messages.length > 0 ? messages : [welcome];
  } catch {
    return [welcome];
  }
}

function saveHistory(messages: TristaMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), messages }));
  } catch {
    // localStorage penuh / unavailable — abaikan
  }
}

export default function TristaChat() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<TristaMessage[]>(() => loadHistory());
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open, sending]);

  if (status !== "authenticated") return null;

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    const nextMessages = [...messages, { role: "user" as const, content }].slice(-20);
    setMessages(nextMessages);
    saveHistory(nextMessages);
    setDraft("");
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.filter((message) => message !== welcome) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "TRISTA tidak dapat menjawab.");
      const updated = [...nextMessages, { role: "assistant" as const, content: String(data.message) }].slice(-20);
      setMessages(updated);
      saveHistory(updated);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "TRISTA tidak dapat menjawab.");
    } finally {
      setSending(false);
    }
  }

  function resetChat() {
    saveHistory([welcome]);
    setMessages([welcome]);
    setError("");
    setDraft("");
  }

  return (
    <>
      {open && (
        <section role="dialog" aria-modal="false" aria-label="Chat dengan TRISTA" className="fixed inset-x-3 bottom-20 z-50 flex max-h-[min(42rem,calc(100vh-7rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--card)] shadow-2xl sm:inset-x-auto sm:right-6 sm:w-[25rem] md:bottom-6">
          <header className="flex items-start justify-between gap-3 border-b border-[var(--border)] bg-[var(--brand-navy-deep)] px-4 py-3 text-white">
            <div><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-black text-[var(--brand-navy-deep)]">T</span><div><h2 className="text-sm font-bold">TRISTA</h2><p className="text-[10px] text-white/65">AI analis saham Indonesia</p></div></div></div>
            <div className="flex items-center gap-1"><button type="button" onClick={resetChat} className="rounded-md px-2 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white">Reset</button><button type="button" onClick={() => setOpen(false)} aria-label="Tutup chat TRISTA" className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-white/70 hover:bg-white/10 hover:text-white">×</button></div>
          </header>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[var(--background)] p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${message.role === "user" ? "rounded-br-md bg-[var(--brand-navy-deep)] text-white" : "rounded-bl-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"}`}>{message.content}</div>
              </div>
            ))}
            {sending && <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--card)] px-3.5 py-2.5 text-sm text-[var(--muted)]"><span className="animate-pulse">TRISTA sedang menganalisis…</span></div></div>}
            {error && <div role="alert" className="rounded-lg border border-[var(--down)]/30 bg-[var(--down)]/10 px-3 py-2 text-xs text-[var(--down)]">{error}</div>}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="border-t border-[var(--border)] bg-[var(--card)] p-3">
            <label htmlFor="trista-chat-input" className="sr-only">Pesan untuk TRISTA</label>
            <textarea id="trista-chat-input" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} maxLength={3000} rows={2} className="input resize-none text-sm" placeholder="Tanya TRISTA tentang saham Indonesia…" />
            <div className="mt-2 flex items-center justify-between gap-3"><p className="text-[10px] leading-4 text-[var(--muted)]">AI dapat keliru. Verifikasi data sebelum mengambil keputusan.</p><button type="submit" disabled={sending || !draft.trim()} className="btn-gold min-h-10 shrink-0 px-4 text-xs">{sending ? "…" : "Kirim"}</button></div>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Tutup chat TRISTA" : "Buka chat TRISTA"} className="fixed bottom-20 right-4 z-40 flex min-h-12 items-center gap-2 rounded-full bg-[var(--brand-navy-deep)] px-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] md:bottom-6 md:right-6"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-black text-[var(--brand-navy-deep)]">T</span>TRISTA</button>
    </>
  );
}
