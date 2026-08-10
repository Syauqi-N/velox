"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AnimatedCandles — a LIVE candlestick feed.
 * Every interval a fresh candle pops in from the right while the oldest
 * slides off to the left — like a real scrolling market chart.
 *
 * Deterministic pseudo-random data so it renders identically on server/client
 * (no hydration mismatch). Colors: bull gold, bear navy.
 */
// Deterministic generator (infinite) so the feed never runs out of candles.
function gen(i: number): { up: boolean } {
  return { up: (i * 7 + 3) % 5 !== 0 };
}

const W = 560;
const H = 300;
const BODY_W = 22;
const STEP = 35;
const MIN_Y = 52;
const MAX_Y = 248;
const START_X = 30;
const MAX_VISIBLE = 10;

function hMetrics(i: number) {
  const seed = (i * 37 + 11) % 29;
  const bodyH = 34 + seed * 3;
  const bodyTop = MIN_Y + ((seed * 9) % (MAX_Y - MIN_Y - bodyH));
  const wickTop = Math.max(MIN_Y, bodyTop - 12);
  const wickBot = Math.min(MAX_Y, bodyTop + bodyH + 12);
  return { bodyTop, bodyH, wickTop, wickBot };
}

export default function AnimatedCandles({ variant = "light" }: { variant?: "light" | "navy" }) {
  const onNavy = variant === "navy";
  const [count, setCount] = useState(MAX_VISIBLE);

  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + 1), 900);
    return () => clearInterval(id);
  }, []);

  const from = Math.max(0, count - MAX_VISIBLE);
  const visible = Array.from({ length: count - from }, (_, i) => {
    const globalI = from + i;
    return { globalI, m: hMetrics(globalI), c: gen(globalI) };
  });

  return (
    <div className="relative h-[300px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#12263A] p-4">
      {/* gridlines */}
      <div className="pointer-events-none absolute inset-4 flex flex-col justify-between opacity-[0.12]">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-px w-full bg-white" />
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
        <AnimatePresence initial={false}>
          {visible.map(({ globalI, m, c }) => {
            const x = START_X + (globalI - from) * STEP;
            return (
              <motion.g
                key={globalI}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <line
                  x1={x}
                  y1={m.wickTop}
                  x2={x}
                  y2={m.wickBot}
                  stroke={c.up ? "rgba(201,169,97,0.5)" : onNavy ? "rgba(255,255,255,0.5)" : "rgba(27,58,82,0.5)"}
                  strokeWidth={1.5}
                />
                <rect
                  x={x - BODY_W / 2}
                  y={m.bodyTop}
                  width={BODY_W}
                  height={m.bodyH}
                  rx={2.5}
                  fill={c.up ? "rgba(201,169,97,0.7)" : onNavy ? "rgba(226,194,141,0.5)" : "rgba(27,58,82,0.55)"}
                />
              </motion.g>
            );
          })}
        </AnimatePresence>
      </svg>
    </div>
  );
}
