import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { allowedMarketSymbols } from "@/lib/market";
import { takeRateLimit } from "@/lib/rate-limit";
import { getQuotes } from "@/lib/yahoo";

export async function GET(req: NextRequest) {
  const user = await authenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = takeRateLimit(`ticker:${user.id}`, 30, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan data pasar." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const symbols = allowedMarketSymbols(req.nextUrl.searchParams.get("symbols"));
  if (symbols === null) {
    return NextResponse.json(
      { error: "Daftar simbol tidak valid." },
      { status: 400 },
    );
  }
  if (!symbols.length) return NextResponse.json({ quotes: [] });

  try {
    const quotes = await getQuotes(symbols);
    return NextResponse.json(
      { quotes },
      {
        headers: {
          "Cache-Control": "private, max-age=10, stale-while-revalidate=20",
        },
      },
    );
  } catch (error) {
    console.error("ticker fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticker data" },
      { status: 502 },
    );
  }
}
