"use client";

/**
 * AnimatedBackground — statik, "trading" pattern for Velox landing.
 *
 * User wanted something calmer than drifting blobs: a static, premium
 * background reminiscent of a stock chart. This renders three quiet layers:
 *   1. A faint gold radial glow (static, no motion) for warmth on cream.
 *   2. Decorative candlestick bars (navy/gold, low alpha) — on-brand for a
 *      stock-investment community.
 *   3. A fine film-grain (SVG feTurbulence) overlay that kills the "flat"
 *      look without adding visual noise or motion.
 *
 * variant="navy" re-themes the candles to gold so they read on the dark
 * CTA band background.
 */
export default function AnimatedBackground({ variant = "light" }: { variant?: "light" | "navy" }) {
  const onNavy = variant === "navy";
  // Colors are swapped by variant: candles gold on navy bg, navy/gold mix on light.
  const bull = onNavy ? "rgba(226,194,141,0.30)" : "rgba(201,169,97,0.30)";
  const bear = onNavy ? "rgba(226,194,141,0.20)" : "rgba(27,58,82,0.22)";
  const wick = onNavy ? "rgba(238,214,168,0.26)" : "rgba(27,58,82,0.18)";

  // Deterministic candlestick layout in a 1200x420 coordinate space.
  // Each: x = body left edge, bodyY/bodyH = body box, up flag tints it.
  const candles = [
    { x: 90,   bodyY: 310, bodyH: 80,  wickTop: 230, wickBot: 395, up: true  },
    { x: 180,  bodyY: 250, bodyH: 60,  wickTop: 205, wickBot: 330, up: false },
    { x: 270,  bodyY: 350, bodyH: 45,  wickTop: 330, wickBot: 405, up: true  },
    { x: 360,  bodyY: 210, bodyH: 120, wickTop: 150, wickBot: 350, up: false },
    { x: 454,  bodyY: 300, bodyH: 50,  wickTop: 280, wickBot: 360, up: true  },
    { x: 540,  bodyY: 378, bodyH: 30,  wickTop: 366, wickBot: 404, up: true  },
    { x: 632,  bodyY: 240, bodyH: 95,  wickTop: 175, wickBot: 345, up: false },
    { x: 722,  bodyY: 320, bodyH: 70,  wickTop: 270, wickBot: 380, up: true  },
    { x: 812,  bodyY: 200, bodyH: 92,  wickTop: 160, wickBot: 302, up: true  },
    { x: 902,  bodyY: 340, bodyH: 55,  wickTop: 315, wickBot: 388, up: false },
    { x: 992,  bodyY: 260, bodyH: 100, wickTop: 200, wickBot: 372, up: true  },
    { x: 1082, bodyY: 122, bodyH: 62,  wickTop: 92,  wickBot: 200, up: false },
  ];
  const BODY_W = 20;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* 1. Static faint gold glow (no motion) */}
      <div
        className="absolute -left-24 -top-32 h-[560px] w-[560px] rounded-full"
        style={{
          background: onNavy
            ? "radial-gradient(circle at center, rgba(201,169,97,0.16) 0%, rgba(201,169,97,0.05) 45%, transparent 70%)"
            : "radial-gradient(circle at center, rgba(201,169,97,0.38) 0%, rgba(201,169,97,0.12) 45%, transparent 70%)",
        }}
      />

      {/* 2. Decorative candlestick bars */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 420"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {candles.map((c, i) => {
          const cx = c.x + BODY_W / 2;
          return (
            <g key={i}>
              {/* wick */}
              <line x1={cx} y1={c.wickTop} x2={cx} y2={c.wickBot} stroke={wick} strokeWidth={1.5} />
              {/* body */}
              <rect
                x={c.x}
                y={c.bodyY}
                width={BODY_W}
                height={c.bodyH}
                rx={2}
                fill={c.up ? bull : bear}
              />
            </g>
          );
        })}
      </svg>

      {/* 3. Fine film grain */}
      <svg className="absolute inset-0 h-full w-full">
        <filter id="velox-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#velox-noise)" opacity={0.05} />
      </svg>
    </div>
  );
}
