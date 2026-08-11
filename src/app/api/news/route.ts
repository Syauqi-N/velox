import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { CNBC_MARKET_RSS, getMarketNews } from "@/lib/news";
import { takeRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const user = await authenticatedUser();
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = takeRateLimit(`news-read:${user.id}`, 60, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi sebentar." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1";
  if (forceRefresh) {
    const refreshLimit = takeRateLimit(`news-refresh:${user.id}`, 10, 60_000);
    if (!refreshLimit.allowed) {
      return NextResponse.json(
        { error: "Terlalu sering memperbarui berita. Tunggu sebentar." },
        { status: 429, headers: { "Retry-After": String(refreshLimit.retryAfterSeconds) } },
      );
    }
  }

  try {
    const items = await getMarketNews(forceRefresh);
    return NextResponse.json(
      { items, sourceUrl: CNBC_MARKET_RSS, updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "private, max-age=120, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("Failed to load market news", error);
    return NextResponse.json(
      { error: "Berita belum dapat dimuat dari sumber. Coba lagi sebentar." },
      { status: 502 },
    );
  }
}
