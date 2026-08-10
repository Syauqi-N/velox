"use client";

import { useState } from "react";
import type { FeedPost } from "@/lib/feed";

export default function PostComposer({
  onCreated,
}: {
  onCreated: (post: FeedPost) => void;
}) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const text = content.trim();
    if (!text) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal memposting.");
      onCreated(data.post as FeedPost);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="card rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_1px_2px_rgba(14,34,48,0.08),0_4px_12px_rgba(14,34,48,0.12)]">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={2000}
        rows={3}
        className="input resize-none"
        placeholder="Bagikan analisa, insight, atau pertanyaan ke circle…"
        aria-label="Isi postingan"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className={`text-xs ${content.length >= 2000 ? "text-[var(--down)]" : "text-[var(--text-muted)]"}`}>
          {content.length}/2000
        </span>
        <button
          type="submit"
          disabled={submitting || content.trim().length === 0}
          className="btn-gold px-4 py-2 text-sm"
        >
          {submitting ? "Memposting…" : "Posting"}
        </button>
      </div>
      {error && <div className="mt-2 text-sm text-[var(--down)]">{error}</div>}
    </form>
  );
}
