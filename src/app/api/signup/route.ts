import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { takeRateLimit } from "@/lib/rate-limit";
import { getClientIp, readJsonObject } from "@/lib/request";
import { normalizedEmail, trimmedText } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const rateLimit = takeRateLimit(
    `signup:${getClientIp(req)}`,
    10,
    15 * 60 * 1000,
  );
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

  const email = normalizedEmail(body.email);
  const name = trimmedText(body.name, 100);
  if (!email) {
    return NextResponse.json({ error: "Email tidak valid." }, { status: 400 });
  }
  if (name === null) {
    return NextResponse.json({ error: "Nama maksimal 100 karakter." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.passwordHash && existing.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Akun dengan email ini sudah aktif. Silakan masuk." },
        { status: 409 },
      );
    }
    // Pending signup: refresh the name and let the same request stand.
    await prisma.user.update({
      where: { id: existing.id },
      data: { name: name || existing.name },
    });
    return NextResponse.json({ ok: true, status: "pending" });
  }

  await prisma.user.create({
    data: { email, name: name || null, role: "member", status: "PENDING" },
  });

  return NextResponse.json({ ok: true, status: "pending" }, { status: 201 });
}
