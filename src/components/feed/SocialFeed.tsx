"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MemberAvatar from "@/components/MemberAvatar";
import StockbitLink from "@/components/StockbitLink";
import { formatPercent, formatPrice, signClass } from "@/lib/format";
import {
  authorLabel,
  timeAgo,
  type FeedPost,
} from "@/lib/feed";

function CommentThread({ post, onChanged }: { post: FeedPost; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function insertTristaMention() {
    setText((value) => /(^|\s)@trista\b/i.test(value) ? value : `${value}${value.trim() ? " " : ""}@TRISTA `);
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const content = text.trim();
    if (!content && !image) return;
    setSending(true);
    try {
      const body = new FormData();
      body.set("postId", post.id);
      body.set("content", content);
      if (image) body.set("image", image);
      const res = await fetch("/api/comments", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim komentar.");
      setText("");
      setImage(null);
      setOpen(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-2 border-t border-[var(--border)]/50 pt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
      >
        {post.comments.length > 0 ? `${post.comments.length} balasan` : "Balas"}
      </button>
      {post.comments.length > 0 && (
        <ul className="mt-2 space-y-2">
          {post.comments.map((c) => (
            <li key={c.id} className={`flex gap-2 ${c.author.isAi ? "rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)]/40 p-3" : ""}`}>
              <Link href={`/members/${c.author.id}`} aria-label={`Lihat profil ${authorLabel(c.author)}`}><MemberAvatar author={c.author} size="sm" /></Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start gap-x-2 gap-y-0.5">
                  <div>
                    <div className="flex flex-wrap items-center gap-1">
                      <Link href={`/members/${c.author.id}`} className="text-xs font-semibold hover:text-[var(--accent)]">{authorLabel(c.author)}</Link>
                    {c.author.isAi && (
                      <span className="rounded bg-[var(--brand-navy-deep)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                        AI
                      </span>
                    )}
                    {c.author.role === "admin" && (
                      <span className="pill border border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[9px] uppercase tracking-wide">
                        Admin
                      </span>
                    )}
                    </div>
                    {c.author.memberTags.length > 0 && <div className="mt-0.5 flex flex-wrap gap-1">{c.author.memberTags.map((tag) => <span key={tag} className="inline-flex rounded border border-[var(--border-strong)] bg-[var(--card-hover)] px-1.5 py-0.5 text-[10px] font-medium leading-none text-[var(--muted)]">{tag}</span>)}</div>}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(c.createdAt)}</span>
                </div>
                {c.content && <p className={`whitespace-pre-wrap break-words text-sm leading-6 text-foreground ${c.aiStatus === "PENDING" ? "animate-pulse text-[var(--muted)]" : ""}`}>{c.content}</p>}
                {c.aiStatus === "FAILED" && <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[var(--down)]">Jawaban gagal dibuat</p>}
                {c.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- Private authenticated endpoint cannot use the image proxy.
                  <img src={c.imageUrl} alt="Gambar dalam komentar" className="mt-2 max-h-80 max-w-full rounded-lg border border-[var(--border)] object-contain" />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {open && (
        <form onSubmit={submit} className="mt-2 space-y-2">
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} className="input" placeholder="Tulis komentar atau mention @TRISTA…" aria-label={`Komentar untuk ${post.id}`} />
          <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap gap-2"><label className="btn-ghost inline-flex min-h-11 cursor-pointer items-center px-3 text-sm">Pilih gambar atau GIF<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(event) => setImage(event.target.files?.[0] ?? null)} /></label><button type="button" onClick={insertTristaMention} className="btn-ghost min-h-11 px-3 text-sm">@TRISTA</button></div>{image && <span className="max-w-52 truncate text-xs text-[var(--muted)]">{image.name}</span>}<button type="submit" disabled={sending || (!text.trim() && !image)} className="btn-gold min-h-11 px-3 text-sm">{sending ? "Mengirim" : "Kirim"}</button></div>
        </form>
      )}
      {error && <div className="mt-1 text-xs text-[var(--down)]">{error}</div>}
    </div>
  );
}

export default function SocialFeed({
  refreshTick,
  onCountChange,
  symbol,
}: {
  refreshTick: number;
  onCountChange?: (count: number) => void;
  symbol?: string;
}) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const [hasFocus, setHasFocus] = useState(true);
  const hasPendingTrista = posts.some((post) => post.comments.some((comment) => comment.aiStatus === "PENDING"));

  useEffect(() => {
    if (!hasPendingTrista) return;
    const timer = window.setTimeout(() => setTick((value) => value + 1), 1_500);
    return () => window.clearTimeout(timer);
  }, [hasPendingTrista, tick]);

  // Auto-refresh feed every 8s while the tab is visible, so new posts/
  // comments from other members appear without a manual reload.
  useEffect(() => {
    const onFocus = () => setHasFocus(document.visibilityState === "visible");
    onFocus();
    document.addEventListener("visibilitychange", onFocus);
    return () => document.removeEventListener("visibilitychange", onFocus);
  }, []);

  useEffect(() => {
    if (!hasFocus) return;
    const timer = window.setInterval(() => setTick((value) => value + 1), 8_000);
    return () => window.clearInterval(timer);
  }, [hasFocus]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const query = symbol ? `?symbol=${encodeURIComponent(symbol)}` : "";
        const res = await fetch(`/api/posts${query}`);
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        const next = (data.posts ?? []) as FeedPost[];
        if (!cancelled) {
          setPosts(next);
          setError("");
          onCountChange?.(next.length);
        }
      } catch {
        if (!cancelled) setError("Gagal memuat postingan.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tick, refreshTick, onCountChange, symbol]);

  if (loading) {
    return <div className="card p-8 text-center text-sm text-[var(--text-muted)]">Memuat postingan…</div>;
  }

  return (
    <div className="space-y-4">
      {error && <div className="card p-6 text-center text-sm text-[var(--down)]"><p>{error}</p><button type="button" onClick={() => setTick((value) => value + 1)} className="mt-3 font-medium text-[var(--foreground)] underline">Coba lagi</button></div>}
      {posts.length === 0 && !error && (
        <div className="card p-8 text-center text-sm text-[var(--text-muted)]">
          {symbol ? `Belum ada diskusi untuk ${symbol.replace(".JK", "")}. Mulai percakapannya.` : "Belum ada postingan. Jadilah yang pertama menulis untuk circle."}
        </div>
      )}
      {posts.map((post) => (
        <article key={post.id} className="card p-4">
          <div className="flex items-start gap-3">
            <Link href={`/members/${post.author.id}`} aria-label={`Lihat profil ${authorLabel(post.author)}`}><MemberAvatar author={post.author} /></Link>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start gap-x-2 gap-y-0.5">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link href={`/members/${post.author.id}`} className="text-sm font-semibold hover:text-[var(--accent)]">{authorLabel(post.author)}</Link>
                    {post.author.role === "admin" && (
                      <span className="pill border border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[9px] uppercase tracking-wide">
                        Admin
                      </span>
                    )}
                  </div>
                  {post.author.memberTags.length > 0 && <div className="mt-0.5 flex flex-wrap gap-1">{post.author.memberTags.map((tag) => <span key={tag} className="inline-flex rounded border border-[var(--border-strong)] bg-[var(--card-hover)] px-1.5 py-0.5 text-[10px] font-medium leading-none text-[var(--muted)]">{tag}</span>)}</div>}
                </div>
                <span className="text-xs text-[var(--text-muted)]">{timeAgo(post.createdAt)}</span>
              </div>
              {post.content && <p className="mt-1.5 whitespace-pre-wrap break-words text-[15px] leading-relaxed">{post.content}</p>}
              {post.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- Private authenticated endpoint cannot use the image proxy.
                <img src={post.imageUrl} alt="Gambar dalam postingan" className="mt-3 max-h-[30rem] max-w-full rounded-xl border border-[var(--border)] object-contain" />
              )}
              {post.symbol && <div className="mt-3 flex flex-wrap items-center gap-2"><Link href={`/stock/${post.symbol}`} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[var(--border-strong)] bg-[var(--card-hover)] px-2 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--accent)]"><span>{post.symbol.replace(".JK", "")}</span>{post.priceSnapshot != null && <span className="border-l border-[var(--border-strong)] pl-2 tabular-nums">{formatPrice(post.priceSnapshot)}</span>}{post.changePercentSnapshot != null && <span className={`tabular-nums ${signClass(post.changePercentSnapshot)}`}>{formatPercent(post.changePercentSnapshot)}</span>}</Link><StockbitLink symbol={post.symbol} className="min-h-9 text-xs" /></div>}
              <CommentThread post={post} onChanged={() => setTick((t) => t + 1)} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
