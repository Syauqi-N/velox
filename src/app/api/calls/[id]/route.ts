import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { takeRateLimit } from "@/lib/rate-limit";
import { readJsonObject } from "@/lib/request";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticatedUser();
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const rateLimit = takeRateLimit(`calls-close:${user.id}`, 20, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Batas perubahan call tercapai." }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } });
  }
  const body = await readJsonObject(req);
  if (!body || body.status !== "CLOSED") {
    return NextResponse.json({ error: "Status harus CLOSED." }, { status: 400 });
  }
  const { id } = await params;
  const call = await prisma.call.findUnique({ where: { id } });
  if (!call) return NextResponse.json({ error: "Call tidak ditemukan." }, { status: 404 });
  if (call.status === "CLOSED") {
    return NextResponse.json({ error: "Call sudah ditutup." }, { status: 409 });
  }
  const updated = await prisma.call.update({ where: { id }, data: { status: "CLOSED", closedAt: new Date() } });
  return NextResponse.json({ ok: true, call: updated });
}
