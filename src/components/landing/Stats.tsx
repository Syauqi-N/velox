"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "./motion";

// Placeholder stats — replace with real numbers when available.
const STATS = [
  { value: "1", suffix: "", label: "Indeks", sub: "Market coverage" },
  { value: "10", suffix: "+", label: "Ticker", sub: "Tracked tickers" },
  { value: "1", suffix: "/day", label: "Trading Call", sub: "Dari tim circle" },
  { value: "100", suffix: "%", label: "Privat", sub: "Circle eksklusif" },
];

function useCountUp(target: number, start: boolean, duration = 1200) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [start, target, duration]);
  return val;
}

function StatItem({ value, suffix, label, sub, start }: (typeof STATS)[number] & { start: boolean }) {
  const num = useCountUp(parseFloat(value), start);
  const display = /\./.test(value) ? num : num;
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-4xl font-extrabold tracking-tight text-[var(--brand-navy)] sm:text-5xl">
        {display}
        {suffix}
      </div>
      <div className="mt-2 text-sm font-semibold text-[var(--text)]">{label}</div>
      <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{sub}</div>
    </div>
  );
}

export default function Stats({ start = true }: { start?: boolean }) {
  return (
    <section className="border-y border-[var(--border-light)] bg-white py-14">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.1}>
            <StatItem {...s} start={start} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}