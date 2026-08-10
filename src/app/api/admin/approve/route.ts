import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import {
  createEntryCode,
  entryCodeExpiry,
  hashEntryCode,
} from "@/lib/entry-code";
import { takeRateLimit } from "@/lib/rate-limit";
import { readJsonObject } from "@/lib/request";

export async function POST(req: NextRequest) {
  const admin = await authenticatedUser();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimit = takeRateLimit(`admin-approve:${admin.id}`, 60, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Batas persetujuan tercapai." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ error: "Payload JSON tidak valid." }, { status: 400 });
  }
  const userId = typeof body.userId === "string" ? body.userId : "";
  if (!userId) {
    return NextResponse.json({ error: "userId wajib diisi." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, passwordHash: true, status: true },
  });
  if (!user || user.passwordHash || user.status !== "PENDING") {
    return NextResponse.json(
      { error: "Signup tidak ditemukan atau sudah diproses." },
      { status: 409 },
    );
  }

  const code = createEntryCode();
  const expiresAt = entryCodeExpiry();

  // entryCodeHash is unique; regenerate if it collides with an existing hash.
  let stored: string | null = null;
  for (let attempt = 0; attempt < 3 && stored === null; attempt++) {
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { entryCodeHash: hashEntryCode(code), entryCodeExpiresAt: expiresAt },
      });
      stored = code;
    } catch {
      stored = null;
    }
  }
  if (stored === null) {
    return NextResponse.json({ error: "Gagal membuat kode, coba lagi." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, code, expiresAt: expiresAt.toISOString() });
}
