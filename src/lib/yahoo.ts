import YahooFinance from "yahoo-finance2";
import type { Quote } from "yahoo-finance2/modules/quote";
import type { QuoteSummaryResult } from "yahoo-finance2/modules/quoteSummary";
import { unstable_cache } from "next/cache";

// Singleton instance (required by yahoo-finance2 v4)
const yahoo = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

// Re-export constants (defined in constants.ts so client components can use
// them without pulling in the server-only yahoo-finance2 library)
export { IHSG_SYMBOL, IDX_WATCHLIST } from "@/lib/constants";

export interface QuoteResult {
  symbol: string;
  displayName?: string;
  longName?: string;
  shortName?: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
  currency?: string;
  marketState?: string;
  regularMarketTime?: number | null;
}

// Normalize a raw Yahoo quote into a clean shape
export function normalizeQuote(q: Quote): QuoteResult {
  const price = q?.regularMarketPrice;
  const prevClose = q?.regularMarketPreviousClose;
  const change = price != null && prevClose != null ? price - prevClose : null;
  const changePercent =
    change != null && prevClose != null && prevClose !== 0
      ? (change / prevClose) * 100
      : null;
  return {
    symbol: q?.symbol ?? "",
    displayName: q?.displayName,
    longName: q?.longName,
    shortName: q?.shortName,
    price,
    change,
    changePercent,
    volume: q?.regularMarketVolume ?? null,
    currency: q?.currency,
    marketState: q?.marketState,
    regularMarketTime: q.regularMarketTime
      ? Math.floor(q.regularMarketTime.getTime() / 1000)
      : null,
  };
}

export interface ChartBar {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartResult {
  symbol: string;
  bars: ChartBar[];
  meta: {
    currency?: string;
    exchangeName?: string;
    instrumentType?: string;
    previousClose?: number;
    regularMarketPrice?: number;
    scale?: number;
  };
}

export type ChartInterval =
  | "1m"
  | "2m"
  | "5m"
  | "15m"
  | "30m"
  | "60m"
  | "90m"
  | "1h"
  | "1d"
  | "5d"
  | "1wk"
  | "1mo"
  | "3mo";

// Map a human range string to a period1 date for the yahoo chart API.
// (yahoo-finance2's chart schema requires period1 and rejects `range` when
// combined with it, so we compute the start date ourselves.)
function rangeToPeriod1(range: string, now = new Date()): Date {
  const start = new Date(now);
  switch (range) {
    case "1d":
      start.setDate(start.getDate() - 1);
      break;
    case "5d":
      start.setDate(start.getDate() - 5);
      break;
    case "1mo":
      start.setMonth(start.getMonth() - 1);
      break;
    case "3mo":
      start.setMonth(start.getMonth() - 3);
      break;
    case "6mo":
      start.setMonth(start.getMonth() - 6);
      break;
    case "5y":
      start.setFullYear(start.getFullYear() - 5);
      break;
    case "ytd":
      start.setMonth(0, 1);
      break;
    case "max":
      start.setFullYear(start.getFullYear() - 50);
      break;
    case "1y":
    default:
      start.setFullYear(start.getFullYear() - 1);
      break;
  }
  return start;
}

// Fetch OHLCV chart data for a symbol
async function fetchChart(
  symbol: string,
  range: string,
  interval: ChartInterval,
): Promise<ChartResult> {
  const result = await yahoo.chart(symbol, {
    period1: rangeToPeriod1(range),
    interval,
  });
  const meta = result.meta;
  const bars: ChartBar[] = (result.quotes ?? []).flatMap((quote) => {
    if (
      quote.close == null ||
      quote.high == null ||
      quote.low == null ||
      quote.open == null
    ) {
      return [];
    }
    return [
      {
        time: Math.floor(quote.date.getTime() / 1000),
        open: quote.open,
        high: quote.high,
        low: quote.low,
        close: quote.close,
        volume: quote.volume ?? 0,
      },
    ];
  });
  return {
    symbol,
    bars,
    meta: {
      currency: meta.currency,
      exchangeName: meta.exchangeName,
      instrumentType: meta.instrumentType,
      previousClose: meta.previousClose,
      regularMarketPrice: meta.regularMarketPrice,
      scale: meta.scale,
    },
  };
}

const cachedChart = unstable_cache(fetchChart, ["yahoo-chart"], {
  revalidate: 60,
});

export async function getChart(
  symbol: string,
  opts: { range?: string; interval?: ChartInterval } = {},
): Promise<ChartResult> {
  return cachedChart(symbol, opts.range ?? "1y", opts.interval ?? "1d");
}

// Fetch a single quote
async function fetchQuote(symbol: string): Promise<QuoteResult> {
  const q = await yahoo.quote(symbol);
  return normalizeQuote(q);
}

const cachedQuote = unstable_cache(fetchQuote, ["yahoo-quote"], {
  revalidate: 15,
});

export async function getQuote(symbol: string): Promise<QuoteResult> {
  return cachedQuote(symbol);
}

// Fetch multiple quotes in one call
async function fetchQuotes(symbols: string[]): Promise<QuoteResult[]> {
  if (!symbols.length) return [];
  const results = await yahoo.quote(symbols);
  const arr = Array.isArray(results) ? results : [results];
  return arr.map(normalizeQuote);
}

const cachedQuotes = unstable_cache(fetchQuotes, ["yahoo-quotes"], {
  revalidate: 15,
});

export async function getQuotes(symbols: string[]): Promise<QuoteResult[]> {
  return cachedQuotes(symbols);
}

// Fetch a stock summary (profile + fundamentals) for the stock info page
async function fetchStockSummary(symbol: string): Promise<QuoteSummaryResult> {
  const summary = await yahoo.quoteSummary(symbol, {
    modules: [
      "summaryDetail",
      "price",
      "financialData",
      "defaultKeyStatistics",
      "assetProfile",
    ],
  });
  return summary;
}

const cachedStockSummary = unstable_cache(
  fetchStockSummary,
  ["yahoo-stock-summary"],
  { revalidate: 300 },
);

export async function getStockSummary(symbol: string): Promise<QuoteSummaryResult> {
  return cachedStockSummary(symbol);
}

export type { QuoteSummaryResult } from "yahoo-finance2/modules/quoteSummary";

// Search for a symbol
export async function searchSymbols(query: string) {
  const results = await yahoo.search(query);
  return results;
}

export { yahoo };
