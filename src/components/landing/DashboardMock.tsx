"use client";

import Image from "next/image";
import AnimatedCandles from "./AnimatedCandles";

/**
 * DashboardMock — a rich, self-contained UI mockup of the Velox dashboard.
 * Rendered inline (no image) so it stays crisp and fills the hero's right
 * column, replacing the flat placeholder that looked empty.
 *
 * All figures are illustrative UI placeholders (not real portfolio data) and
 * are clearly generic so they read as a design mock, not a claim.
 */
export default function DashboardMock() {
  const assets = [
    { sym: "BBCA", name: "Bank Central Asia", price: "9.875", chg: "+1.4%", up: true },
    { sym: "TLKM", name: "Telkom Indonesia", price: "3.580", chg: "-0.8%", up: false },
    { sym: "GOTO", name: "GoTo Group", price: "1.020", chg: "+2.1%", up: true },
  ];

  return (
    <div className="overflow-hidden rounded-[1rem] border border-white/10 bg-[linear-gradient(145deg,#163b52_0%,#0c2233_58%,#091824_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-black/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-[11px] font-semibold tracking-wide text-white/65">
          Velox Dashboard
        </span>
        <span className="ml-auto rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[9px] font-medium text-white/55">
          Member view
        </span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-40 shrink-0 flex-col gap-1 border-r border-white/10 bg-black/[0.08] p-3 text-[12px] sm:flex">
          <div className="mb-3 flex items-center gap-2">
            <Image
              src="/logos/velox-shield-icon.png"
              alt="Velox"
              width={28}
              height={28}
              className="h-7 w-7 rounded object-contain"
              priority
            />
            <span className="font-semibold text-white/90">Velox</span>
          </div>
          {[
            { label: "Ringkasan", active: true },
            { label: "Watchlist" },
            { label: "Trading Call" },
            { label: "Komunitas" },
            { label: "Riset" },
          ].map((it) => (
            <div
              key={it.label}
              className={
                "rounded-md px-2 py-1.5 " +
                (it.active ? "bg-[var(--brand-gold)] font-bold text-[#1B3A52] shadow-[0_4px_12px_rgba(201,169,97,0.16)]" : "text-white/70")
              }
            >
              {it.label}
            </div>
          ))}
        </div>

        {/* Main panel */}
        <div className="flex-1 space-y-3 p-4">
          {/* Top stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.07] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="text-[10px] text-white/65">Total Portofolio</div>
              <div className="mt-1 text-lg font-bold">Rp 8,4 jt</div>
              <div className="text-[10px] font-medium text-emerald-400">+12,4% bln ini</div>
            </div>
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.07] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="text-[10px] text-white/65">Untung Kotor</div>
              <div className="mt-1 text-lg font-bold">Rp 927 rb</div>
              <div className="text-[10px] font-medium text-emerald-400">+3,1% hari ini</div>
            </div>
          </div>

          {/* Live candlestick chart */}
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.07] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/65">Watchlist Live</span>
              <span className="text-[10px] font-semibold text-[var(--brand-gold)]">▲ +8,7%</span>
            </div>
            <AnimatedCandles />
          </div>

          {/* Assets list */}
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.07] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="mb-2 text-[10px] text-white/65">Posisi Teratas</div>
            <div className="space-y-2">
              {assets.map((a) => (
                <div key={a.sym} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-[9px] font-bold text-[var(--brand-gold)]">
                      {a.sym.slice(0, 2)}
                    </span>
                    <div>
                      <div className="font-semibold leading-none">{a.sym}</div>
                      <div className="mt-0.5 text-[9px] text-white/55">{a.name}</div>
                    </div>
                  </div>
                  <div className="text-right leading-none">
                    <div className="font-semibold">{a.price}</div>
                    <div
                      className={
                        "mt-0.5 text-[10px] font-medium " +
                        (a.up ? "text-emerald-400" : "text-rose-400")
                      }
                    >
                      {a.chg}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
