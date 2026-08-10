import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import type { Call, User } from "@prisma/client";

type CallWithAuthor = Call & {
  author: Pick<User, "name" | "email">;
};

const actionStyles: Record<string, { label: string; cls: string }> = {
  BUY: { label: "BUY", cls: "bg-[var(--up)]/15 text-[var(--up)] border border-[var(--up)]/30" },
  SELL: { label: "SELL", cls: "bg-[var(--down)]/15 text-[var(--down)] border border-[var(--down)]/30" },
  HOLD: { label: "HOLD", cls: "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30" },
};

export default async function RecentCalls() {
  let calls: CallWithAuthor[] = [];
  try {
    calls = await prisma.call.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true, email: true } } },
    });
  } catch (e) {
    console.error("recent calls error:", e);
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Calls Terbaru
          </h2>
        </div>
        <Link
          href="/calls"
          className="text-xs text-[var(--accent)] hover:underline"
        >
          Lihat semua →
        </Link>
      </div>
      <div className="divide-y divide-[var(--border)]/50">
        {calls.map((c) => {
          const style = actionStyles[c.action] ?? actionStyles.HOLD;
          return (
            <div key={c.id} className="px-6 py-3.5 transition-colors hover:bg-[var(--card-hover)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-bold ${style.cls}`}
                  >
                    {style.label}
                  </span>
                  <span className="font-semibold">
                    {c.ticker.replace(".JK", "")}
                  </span>
                  {c.targetPrice != null && (
                    <span className="text-xs text-muted">
                      Target: {c.targetPrice.toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted">
                  {formatDateTime(c.createdAt.getTime() / 1000)}
                </span>
              </div>
              {c.reason && (
                <p className="mt-1.5 text-sm text-muted">{c.reason}</p>
              )}
              <div className="mt-1 text-xs text-muted">
                oleh {c.author?.name ?? c.author?.email}
              </div>
            </div>
          );
        })}
        {calls.length === 0 && (
          <div className="px-6 py-8 text-center text-muted">
            Belum ada calls.{" "}
            <Link href="/calls" className="text-[var(--accent)]">
              Buat yang pertama →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
