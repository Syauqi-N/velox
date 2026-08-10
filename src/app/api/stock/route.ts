import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { searchedSymbol } from "@/lib/market";
import { takeRateLimit } from "@/lib/rate-limit";
import { getChart, getQuote, getStockSummary } from "@/lib/yahoo";

export async function GET(req: NextRequest) {
  const user = await authenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = takeRateLimit(`stock:${user.id}`, 15, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan detail saham." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const symbol = searchedSymbol(req.nextUrl.searchParams.get("symbol"));
  if (!symbol) {
    return NextResponse.json({ error: "Simbol tidak valid." }, { status: 400 });
  }

  try {
    const [quote, summary, chart] = await Promise.all([
      getQuote(symbol),
      getStockSummary(symbol).catch(() => null),
      getChart(symbol, { range: "1y", interval: "1d" }).catch(() => null),
    ]);
    return NextResponse.json(
      { quote, summary, chart },
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    console.error("stock fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 502 },
    );
  }
}
