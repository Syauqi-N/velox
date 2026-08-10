import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import {
  chartInterval,
  chartPeriod,
  searchedSymbol,
} from "@/lib/market";
import { takeRateLimit } from "@/lib/rate-limit";
import { getChart } from "@/lib/yahoo";

export async function GET(req: NextRequest) {
  const user = await authenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = takeRateLimit(`chart:${user.id}`, 30, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan chart." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const symbol = searchedSymbol(req.nextUrl.searchParams.get("symbol"));
  const period = chartPeriod(req.nextUrl.searchParams.get("period") ?? "1y");
  const interval = chartInterval(req.nextUrl.searchParams.get("interval") ?? "1d");
  if (!symbol || !period || !interval) {
    return NextResponse.json(
      { error: "Parameter chart tidak valid." },
      { status: 400 },
    );
  }

  try {
    const data = await getChart(symbol, { range: period, interval });
    return NextResponse.json(
      data,
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    console.error("chart fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 502 },
    );
  }
}
