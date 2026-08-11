import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { takeRateLimit } from "@/lib/rate-limit";
import { readJsonObject } from "@/lib/request";
import { normalizedEmail, trimmedText } from "@/lib/validation";

async function requireAdmin() {
  const user = await authenticatedUser();
  return user?.role === "admin" ? user : null;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { isAi: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      passwordHash: true,
      createdAt: true,
    },
  });

  const members = users
    .filter((u) => u.status === "ACTIVE")
    .map(({ passwordHash, ...u }) => ({ ...u, active: Boolean(passwordHash) }));
  const pending = users.filter((u) => u.status === "PENDING");

  return NextResponse.json({ members, pending });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimit = takeRateLimit(`admin-add-member:${admin.id}`, 30, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Batas pendaftaran tercapai." },
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
        { error: "Akun dengan email ini sudah aktif." },
        { status: 409 },
      );
    }
    await prisma.user.update({
      where: { id: existing.id },
      data: { name: name || existing.name },
    });
    return NextResponse.json({ ok: true, member: { id: existing.id, email } }, { status: 200 });
  }

  const created = await prisma.user.create({
    data: { email, name: name || null, role: "member", status: "PENDING" },
  });
  return NextResponse.json(
    { ok: true, member: { id: created.id, email } },
    { status: 201 },
  );
}
