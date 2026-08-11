import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { takeRateLimit } from "@/lib/rate-limit";
import { readJsonObject } from "@/lib/request";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await authenticatedUser();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rateLimit = takeRateLimit(`admin-role:${admin.id}`, 20, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Batas perubahan peran tercapai." }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } });
  }

  const body = await readJsonObject(req);
  if (!body || body.role !== "admin") {
    return NextResponse.json({ error: "Peran yang didukung hanya admin." }, { status: 400 });
  }
  const { id } = await params;
  const member = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, status: true, isAi: true } });
  if (!member) return NextResponse.json({ error: "Anggota tidak ditemukan." }, { status: 404 });
  if (member.isAi) return NextResponse.json({ error: "Akun sistem AI tidak dapat diubah." }, { status: 409 });
  if (member.status !== "ACTIVE") return NextResponse.json({ error: "Anggota harus aktif sebelum menjadi admin." }, { status: 409 });
  if (member.role === "admin") return NextResponse.json({ error: "Anggota ini sudah admin." }, { status: 409 });

  const updated = await prisma.user.update({ where: { id }, data: { role: "admin" }, select: { id: true, email: true, role: true } });
  return NextResponse.json({ ok: true, member: updated });
}
