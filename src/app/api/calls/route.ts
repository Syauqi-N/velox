import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { searchedSymbol } from "@/lib/market";
import { takeRateLimit } from "@/lib/rate-limit";
import { readJsonObject } from "@/lib/request";
import { optionalPositiveNumber, trimmedText } from "@/lib/validation";
import { getQuote } from "@/lib/yahoo";

const actions = ["BUY", "SELL", "HOLD"] as const;
type Action = (typeof actions)[number];

export async function GET(req: NextRequest) {
  const user = await authenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = takeRateLimit(`calls-read:${user.id}`, 60, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const rawStatus = req.nextUrl.searchParams.get("status");
  const status = rawStatus === null ? undefined : rawStatus === "OPEN" || rawStatus === "CLOSED" ? rawStatus : null;
  if (status === null) {
    return NextResponse.json({ error: "Status call tidak valid." }, { status: 400 });
  }
  const rawLimit = req.nextUrl.searchParams.get("limit");
  const limit = rawLimit === null ? 50 : Number(rawLimit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    return NextResponse.json({ error: "Limit call tidak valid." }, { status: 400 });
  }
  const calls = await prisma.call.findMany({
    take: limit,
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });
  return NextResponse.json({ calls });
}

export async function POST(req: NextRequest) {
  const user = await authenticatedUser();
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimit = takeRateLimit(`calls-write:${user.id}`, 20, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Batas posting call tercapai." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ error: "Payload JSON tidak valid." }, { status: 400 });
  }

  const tickerInput = trimmedText(body.ticker, 16, true);
  const actionInput = trimmedText(body.action, 4, true)?.toUpperCase();
  const reason = trimmedText(body.reason, 1_000);
  const targetPrice = optionalPositiveNumber(body.targetPrice);
  const entryPrice = optionalPositiveNumber(body.entryPrice);
  const fullTicker = tickerInput ? searchedSymbol(tickerInput) : null;

  if (!fullTicker || !fullTicker.endsWith(".JK")) {
    return NextResponse.json(
      { error: "Pilih saham Indonesia yang valid." },
      { status: 400 },
    );
  }
  if (!actionInput || !actions.includes(actionInput as Action)) {
    return NextResponse.json(
      { error: "Action harus BUY, SELL, atau HOLD." },
      { status: 400 },
    );
  }
  if (reason === null || targetPrice === undefined || entryPrice === undefined) {
    return NextResponse.json(
      { error: "Harga atau alasan tidak valid." },
      { status: 400 },
    );
  }

  const quote = await getQuote(fullTicker).catch(() => null);
  if (!quote?.symbol.endsWith(".JK") || quote.price == null) {
    return NextResponse.json({ error: "Data saham tidak ditemukan." }, { status: 400 });
  }

  const call = await prisma.call.create({
    data: {
      ticker: fullTicker,
      action: actionInput as Action,
      targetPrice,
      entryPrice,
      reason: reason || null,
      authorId: user.id,
    },
  });

  return NextResponse.json({ ok: true, call }, { status: 201 });
}
