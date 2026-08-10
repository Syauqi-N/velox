import { getChart, getQuote, IHSG_SYMBOL } from "@/lib/yahoo";
import { formatPrice, formatPercent, signClass } from "@/lib/format";
import PriceChart from "@/components/PriceChart";

export default async function IHSGOverview() {
  let chart;
  let quote;

  try {
    [chart, quote] = await Promise.all([
      getChart(IHSG_SYMBOL, { range: "1y", interval: "1d" }),
      getQuote(IHSG_SYMBOL),
    ]);
  } catch (e) {
    console.error("IHSG data error:", e);
    return (
      <div className="card p-5 text-center text-muted">
        Gagal memuat data IHSG.
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted">
            Indeks Harga Saham Gabungan
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-3xl font-bold tabular-nums tracking-tight">
              {formatPrice(quote?.price)}
            </span>
            <span
              className={`text-lg font-medium tabular-nums ${signClass(quote?.changePercent)}`}
            >
              {formatPercent(quote?.changePercent)}
            </span>
          </div>
        </div>
        <div className="text-right text-xs text-muted">
          <div className="pill border border-[var(--border)] bg-[var(--card-hover)]">
            Yahoo Finance · delayed
          </div>
          <div className="mt-2 uppercase tracking-wider">
            {quote?.marketState ?? "—"}
          </div>
        </div>
      </div>
      {chart && <PriceChart data={chart} height={320} />}
    </div>
  );
}