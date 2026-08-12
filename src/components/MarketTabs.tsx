"use client";

import { useState } from "react";
import RecentCalls from "@/components/RecentCalls";
import IHSGChartCard from "@/components/charts/IHSGChartCard";
import WatchlistBox from "@/components/watchlist/WatchlistBox";

type Tab = "calls" | "ihsg" | "watchlist";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "calls", label: "Calls" },
  { id: "ihsg", label: "IHSG" },
  { id: "watchlist", label: "Watchlist" },
];

export default function MarketTabs({
  refreshTick,
  onSelect,
}: {
  refreshTick: number;
  onSelect: (symbol: string) => void;
}) {
  const [active, setActive] = useState<Tab>("calls");

  return (
    <div className="card overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[0_1px_2px_rgba(14,34,48,0.08),0_4px_12px_rgba(14,34,48,0.12)]">
      <div className="flex items-center gap-1 border-b border-[var(--border)] px-3 py-3">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              aria-pressed={isActive}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                isActive
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className={active === "calls" ? "" : "hidden"} aria-hidden={active !== "calls"}>
        <RecentCalls />
      </div>
      <div className={active === "ihsg" ? "" : "hidden"} aria-hidden={active !== "ihsg"}>
        <div className="p-1">
          <IHSGChartCard refreshTick={refreshTick} />
        </div>
      </div>
      <div className={active === "watchlist" ? "" : "hidden"} aria-hidden={active !== "watchlist"}>
        <WatchlistBox refreshTick={refreshTick} onSelect={onSelect} />
      </div>
    </div>
  );
}