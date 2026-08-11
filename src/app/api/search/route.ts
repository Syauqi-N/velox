import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { takeRateLimit } from "@/lib/rate-limit";
import { getQuotes, searchSymbols } from "@/lib/yahoo";

interface SearchItem {
  symbol: string;
  shortName?: string;
  longName?: string;
  exchange?: string;
  index?: string;
  price: number | null;
  changePercent: number | null;
}

export async function GET(req: NextRequest) {
  const user = await authenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rateLimit = takeRateLimit(`search:${user.id}`, 30, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan pencarian." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (!q || q.length > 40) {
    return NextResponse.json({ error: "Kata kunci tidak valid." }, { status: 400 });
  }

  try {
    const raw = await searchSymbols(q);
    const rawQuotes = (Array.isArray(raw) ? raw : (raw as { quotes?: unknown[] }).quotes ?? []) as unknown[];
    const matches = rawQuotes
      .map((item) => {
        const r = item as Record<string, unknown>;
        return {
          symbol: typeof r.symbol === "string" ? r.symbol.toUpperCase() : "",
          shortName: typeof r.shortname === "string" ? r.shortname : undefined,
          longName: typeof r.longname === "string" ? r.longname : undefined,
          exchange: typeof r.exchange === "string" ? r.exchange : undefined,
          index: typeof r.index === "string" ? r.index : undefined,
        };
      })
      .filter((r) => /^[A-Z0-9^.-]{1,15}$/.test(r.symbol) && r.symbol.endsWith(".JK"))
      .slice(0, 12);
    const quotes = await getQuotes(matches.map((result) => result.symbol)).catch(() => []);
    const quoteBySymbol = new Map(quotes.map((quote) => [quote.symbol.toUpperCase(), quote]));
    const results: SearchItem[] = matches.map((result) => {
      const quote = quoteBySymbol.get(result.symbol);
      return { ...result, price: quote?.price ?? null, changePercent: quote?.changePercent ?? null };
    });
    return NextResponse.json({ results });
  } catch (error) {
    console.error("search error:", error);
    return NextResponse.json({ error: "Failed to search symbols" }, { status: 502 });
  }
}
