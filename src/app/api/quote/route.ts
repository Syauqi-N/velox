import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { searchedSymbol } from "@/lib/market";
import { takeRateLimit } from "@/lib/rate-limit";
import { getQuote } from "@/lib/yahoo";

export async function GET(req: NextRequest) {
  const user = await authenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rateLimit = takeRateLimit(`quote:${user.id}`, 30, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan data pasar." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const symbol = searchedSymbol(req.nextUrl.searchParams.get("symbol"));
  if (!symbol) {
    return NextResponse.json({ error: "Simbol tidak valid." }, { status: 400 });
  }

  try {
    const quote = await getQuote(symbol);
    return NextResponse.json(
      { quote },
      { headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=20" } },
    );
  } catch (error) {
    console.error("quote fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch quote data" }, { status: 502 });
  }
}
