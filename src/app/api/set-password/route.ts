import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { hashEntryCode, validateEntryCode } from "@/lib/entry-code";
import { takeRateLimit } from "@/lib/rate-limit";
import { getClientIp, readJsonObject } from "@/lib/request";
import { trimmedText } from "@/lib/validation";

const INVALID_CODE = "Kode masuk tidak valid atau sudah kedaluwarsa.";

export async function POST(req: NextRequest) {
  const rateLimit = takeRateLimit(`set-password:${getClientIp(req)}`, 15, 15 * 60 * 1000);
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
  const password = typeof body.password === "string" ? body.password : "";
  const name = trimmedText(body.name, 100);

  if (!code) {
    return NextResponse.json({ error: INVALID_CODE }, { status: 400 });
  }
  if (password.length < 12 || password.length > 128) {
    return NextResponse.json(
      { error: "Password harus 12–128 karakter." },
      { status: 400 },
    );
  }
  if (name === null) {
    return NextResponse.json({ error: "Nama maksimal 100 karakter." }, { status: 400 });
  }

  const entryCodeHash = hashEntryCode(code);
  const passwordHash = await bcrypt.hash(password, 12);

  const activated = await prisma.user.updateMany({
    where: {
      entryCodeHash,
      passwordHash: null,
      status: "PENDING",
      entryCodeExpiresAt: { gt: new Date() },
    },
    data: {
      passwordHash,
      name: name || undefined,
      entryCodeHash: null,
      entryCodeExpiresAt: null,
      status: "ACTIVE",
    },
  });

  if (activated.count !== 1) {
    return NextResponse.json({ error: INVALID_CODE }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
