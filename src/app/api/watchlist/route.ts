import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { searchedSymbol } from "@/lib/market";
import { takeRateLimit } from "@/lib/rate-limit";
import { readJsonObject } from "@/lib/request";

export async function GET() {
  const user = await authenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const entries = await prisma.watchlistEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { symbol: true },
  });
  return NextResponse.json({ symbols: entries.map((e) => e.symbol) });
}

export async function POST(req: NextRequest) {
  const user = await authenticatedUser();
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rateLimit = takeRateLimit(`watchlist-write:${user.id}`, 30, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ error: "Payload JSON tidak valid." }, { status: 400 });
  }
  const symbol = searchedSymbol(typeof body.symbol === "string" ? body.symbol : null);
  if (!symbol) {
    return NextResponse.json({ error: "Simbol tidak valid." }, { status: 400 });
  }

  const count = await prisma.watchlistEntry.count({ where: { userId: user.id } });
  if (count >= 50) {
    return NextResponse.json(
      { error: "Watchlist maksimal 50 saham." },
      { status: 400 },
    );
  }

  const entry = await prisma.watchlistEntry.upsert({
    where: { userId_symbol: { userId: user.id, symbol } },
    update: {},
    create: { userId: user.id, symbol },
  });
  return NextResponse.json({ entry }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const user = await authenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const symbol = searchedSymbol(req.nextUrl.searchParams.get("symbol"));
  if (!symbol) {
    return NextResponse.json({ error: "Simbol tidak valid." }, { status: 400 });
  }
  await prisma.watchlistEntry.deleteMany({ where: { userId: user.id, symbol } });
  return NextResponse.json({ ok: true });
}
