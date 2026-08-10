"use client";

import { useEffect, useState } from "react";
import {
  authorInitial,
  authorLabel,
  timeAgo,
  type FeedPost,
} from "@/lib/feed";

function CommentThread({ post, onChanged }: { post: FeedPost; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const content = text.trim();
    if (!content) return;
    setSending(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim komentar.");
      setText("");
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
            <li key={c.id} className="flex gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--card-hover)] text-[11px] font-bold uppercase text-[var(--accent)]">
                {authorInitial(c.author)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-xs font-semibold">
                    {authorLabel(c.author)}
                    {c.author.role === "admin" && (
                      <span className="ml-1 pill border border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[9px] uppercase tracking-wide">
                        Admin
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm text-foreground">
                  {c.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {open && (
        <form onSubmit={submit} className="mt-2 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            className="input"
            placeholder="Tulis komentar…"
            aria-label={`Komentar untuk ${post.id}`}
          />
          <button
            type="submit"
            disabled={sending || text.trim().length === 0}
            className="btn-gold shrink-0 px-3 py-2 text-sm"
          >
            {sending ? "…" : "Kirim"}
          </button>
        </form>
      )}
      {error && <div className="mt-1 text-xs text-[var(--down)]">{error}</div>}
    </div>
  );
}

export default function SocialFeed({
  refreshTick,
  onCountChange,
}: {
  refreshTick: number;
  onCountChange?: (count: number) => void;
}) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/posts");
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
  }, [tick, refreshTick, onCountChange]);

  if (loading) {
    return <div className="card p-8 text-center text-sm text-[var(--text-muted)]">Memuat postingan…</div>;
  }

  return (
    <div className="space-y-4">
      {error && <div className="card p-6 text-center text-sm text-[var(--down)]">{error}</div>}
      {posts.length === 0 && !error && (
        <div className="card p-8 text-center text-sm text-[var(--text-muted)]">
          Belum ada postingan. Jadilah yang pertama menulis untuk circle. ✍️
        </div>
      )}
      {posts.map((post) => (
        <article key={post.id} className="card rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[0_1px_2px_rgba(14,34,48,0.08),0_4px_12px_rgba(14,34,48,0.12)] hover:-translate-y-0.5 transition-transform">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--card-hover)] text-sm font-bold uppercase text-[var(--accent)]">
              {authorInitial(post.author)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-sm font-semibold">{authorLabel(post.author)}</span>
                {post.author.role === "admin" && (
                  <span className="pill border border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[9px] uppercase tracking-wide">
                    Admin
                  </span>
                )}
                <span className="text-xs text-[var(--text-muted)]">{timeAgo(post.createdAt)}</span>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                {post.content}
              </p>
              <CommentThread post={post} onChanged={() => setTick((t) => t + 1)} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
