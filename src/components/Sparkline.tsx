import type { ChartBar } from "@/lib/yahoo";

export default function Sparkline({ bars }: { bars: ChartBar[] }) {
  const points = bars.slice(-30).map((bar) => bar.close);
  if (points.length < 2) return <div className="h-9" aria-hidden="true" />;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 120;
  const height = 36;
  const padding = 2;

  const coords = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y =
      height - padding - ((point - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const path = `M ${coords.join(" L ")}`;
  const fillPath = `${path} L ${width},${height} L 0,${height} Z`;
  const up = points.at(-1)! >= points[0];
  const stroke = up ? "var(--up)" : "var(--down)";
  const fill = up ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-9 w-full"
      aria-label="Pergerakan harga satu bulan"
      role="img"
    >
      <path d={fillPath} fill={fill} stroke="none" />
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
