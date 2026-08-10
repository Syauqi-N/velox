import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashEntryCode, validateEntryCode } from "@/lib/entry-code";
import { takeRateLimit } from "@/lib/rate-limit";
import { getClientIp, readJsonObject } from "@/lib/request";

const INVALID_CODE = "Kode masuk tidak valid atau sudah kedaluwarsa.";

export async function POST(req: NextRequest) {
  const rateLimit = takeRateLimit(`activate:${getClientIp(req)}`, 15, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ error: "Payload JSON tidak valid." }, { status: 400 });
  }

  const code = validateEntryCode(body.code);
  if (!code) {
    return NextResponse.json({ error: INVALID_CODE }, { status: 400 });
  }

  const entryCodeHash = hashEntryCode(code);
  const user = await prisma.user.findUnique({
    where: { entryCodeHash },
    select: {
      email: true,
      passwordHash: true,
      status: true,
      entryCodeExpiresAt: true,
    },
  });

  if (
    !user ||
    user.passwordHash ||
    user.status !== "PENDING" ||
    !user.entryCodeExpiresAt ||
    user.entryCodeExpiresAt <= new Date()
  ) {
    return NextResponse.json({ error: INVALID_CODE }, { status: 400 });
  }

  return NextResponse.json({ ok: true, email: user.email });
}
