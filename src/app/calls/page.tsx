"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { formatDateTime } from "@/lib/format";

interface Call {
  id: string;
  ticker: string;
  action: string;
  targetPrice: number | null;
  entryPrice: number | null;
  reason: string | null;
  createdAt: string;
  author: { name: string | null; email: string };
}

const actionStyles: Record<string, { label: string; cls: string }> = {
  BUY: {
    label: "BUY",
    cls: "bg-[var(--up)]/15 text-[var(--up)] border border-[var(--up)]/30",
  },
  SELL: {
    label: "SELL",
    cls: "bg-[var(--down)]/15 text-[var(--down)] border border-[var(--down)]/30",
  },
  HOLD: {
    label: "HOLD",
    cls: "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30",
  },
};

function CallsClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // compose form
  const [ticker, setTicker] = useState("");
  const [action, setAction] = useState("BUY");
  const [targetPrice, setTargetPrice] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = session?.user?.role === "admin";

  async function loadCalls() {
    try {
      const res = await fetch("/api/calls");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setCalls(data.calls ?? []);
      setLoadError("");
    } catch {
      setLoadError("Gagal memuat trading calls.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    let cancelled = false;
    fetch("/api/calls")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setCalls(data.calls ?? []);
          setLoadError("");
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError("Gagal memuat trading calls.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, status]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && !session?.user?.id) {
      void signOut({ callbackUrl: "/login" });
    }
  }, [router, session?.user?.id, status]);

  if (status === "loading") {
    return (
      <AppShell>
        <div className="text-[var(--text-muted)]">Memuat...</div>
      </AppShell>
    );
  }
  if (status === "unauthenticated") {
    return null;
  }
  if (!session?.user?.id) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          action,
          targetPrice: targetPrice ? Number(targetPrice) : null,
          entryPrice: entryPrice ? Number(entryPrice) : null,
          reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Gagal membuat call.");
        return;
      }
      setTicker("");
      setAction("BUY");
      setTargetPrice("");
      setEntryPrice("");
      setReason("");
      await loadCalls();
    } catch {
      setFormError("Tidak dapat terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell userName={session.user.name} userRole={session.user.role}>
      <div className="mb-6">
        <div className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
          Circle Intel
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Trading Calls</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Rekomendasi dan analisis dari tim Velox.
        </p>
      </div>

      {/* Admin compose form */}
      {isAdmin && (
        <div className="card mb-6 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Buat call baru
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-sm text-[var(--text-muted)]">Ticker</label>
                <input
                  maxLength={16}
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  className="input"
                  placeholder="BBCA"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-[var(--text-muted)]">Action</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="input"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                  <option value="HOLD">HOLD</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-[var(--text-muted)]">
                  Target Price
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="input"
                  placeholder="Opsional"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-[var(--text-muted)]">
                  Entry Price
                </label>
                <input
                  type="number"
                  min="1"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="input"
                  placeholder="Opsional"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[var(--text-muted)]">Alasan</label>
              <textarea
                maxLength={1000}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input min-h-[80px]"
                placeholder="Jelaskan alasan call ini..."
              />
            </div>
            {formError && (
              <div className="text-sm text-[var(--down)]">{formError}</div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn-gold px-5 py-2.5 text-sm"
            >
              {submitting ? "Memposting..." : "Post Call"}
            </button>
          </form>
        </div>
      )}

      {/* Calls feed */}
      <div className="space-y-3">
        {loadError ? (
          <div className="card p-8 text-center text-[var(--down)]">
            {loadError}
          </div>
        ) : loading ? (
          <div className="card p-8 text-center text-[var(--text-muted)]">Memuat...</div>
        ) : calls.length === 0 ? (
          <div className="card p-8 text-center text-[var(--text-muted)]">
            Belum ada calls.
          </div>
        ) : (
          calls.map((c) => {
            const style = actionStyles[c.action] ?? actionStyles.HOLD;
            return (
              <div
                key={c.id}
                className="card card-hover p-5"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded px-2.5 py-1 text-xs font-bold ${style.cls}`}
                  >
                    {style.label}
                  </span>
                  <span className="text-lg font-semibold">
                    {c.ticker.replace(".JK", "")}
                  </span>
                  <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
                    {c.entryPrice != null && (
                      <span>
                        Entry:{" "}
                        <span className="tabular-nums">
                          {c.entryPrice.toLocaleString("id-ID")}
                        </span>
                      </span>
                    )}
                    {c.targetPrice != null && (
                      <span>
                        Target:{" "}
                        <span className="tabular-nums">
                          {c.targetPrice.toLocaleString("id-ID")}
                        </span>
                      </span>
                    )}
                  </div>
                  <span className="ml-auto text-xs text-[var(--text-muted)]">
                    {formatDateTime(new Date(c.createdAt).getTime() / 1000)}
                  </span>
                </div>
                {c.reason && (
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                    {c.reason}
                  </p>
                )}
                <div className="mt-3 text-xs text-[var(--text-muted)]">
                  oleh {c.author?.name ?? c.author?.email}
                </div>
              </div>
            );
          })
        )}
      </div>
    </AppShell>
  );
}

export default function CallsPage() {
  return <CallsClient />;
}
