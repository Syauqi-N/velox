import { IDX_WATCHLIST, IHSG_SYMBOL } from "@/lib/constants";

const allowedSymbols = new Set([IHSG_SYMBOL, ...IDX_WATCHLIST]);

export const CHART_PERIODS = ["1mo", "3mo", "6mo", "1y", "5y"] as const;
export const CHART_INTERVALS = ["1d", "1wk"] as const;

export type ChartPeriod = (typeof CHART_PERIODS)[number];
export type AllowedChartInterval = (typeof CHART_INTERVALS)[number];

export function allowedMarketSymbol(value: string | null): string | null {
  if (!value) return null;
  const symbol = value.trim().toUpperCase();
  return allowedSymbols.has(symbol) ? symbol : null;
}

export function allowedMarketSymbols(value: string | null): string[] | null {
  if (!value) return [];
  const symbols = [...new Set(value.split(",").map((item) => item.trim().toUpperCase()))];
  if (symbols.length > 20 || symbols.some((symbol) => !allowedSymbols.has(symbol))) {
    return null;
  }
  return symbols;
}

export function chartPeriod(value: string | null): ChartPeriod | null {
  return CHART_PERIODS.includes(value as ChartPeriod) ? (value as ChartPeriod) : null;
}

export function chartInterval(value: string | null): AllowedChartInterval | null {
  return CHART_INTERVALS.includes(value as AllowedChartInterval)
    ? (value as AllowedChartInterval)
    : null;
}

// Permissive symbol check for member search/chart/watchlist — format only.
// The watchlist/call whitelist above still applies to trading calls.
export function searchedSymbol(value: string | null): string | null {
  if (!value) return null;
  const input = value.trim().toUpperCase();
  const symbol = input && !input.startsWith("^") && !input.includes(".") ? `${input}.JK` : input;
  return /^[A-Z0-9^.-]{1,15}$/.test(symbol) ? symbol : null;
}
