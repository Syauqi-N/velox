import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { takeRateLimit } from "@/lib/rate-limit";
import { readJsonObject } from "@/lib/request";
import { trimmedText } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const user = await authenticatedUser();
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = takeRateLimit(`comments-write:${user.id}`, 30, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Batas komentar tercapai." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ error: "Payload JSON tidak valid." }, { status: 400 });
  }

  const postId = typeof body.postId === "string" ? body.postId.trim() : "";
  const content = trimmedText(body.content, 500, true);
  if (!postId) {
    return NextResponse.json({ error: "postId wajib diisi." }, { status: 400 });
  }
  if (content === null) {
    return NextResponse.json(
      { error: "Komentar harus 1–500 karakter." },
      { status: 400 },
    );
  }

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    return NextResponse.json({ error: "Postingan tidak ditemukan." }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: { postId, content, authorId: user.id },
    include: { author: { select: { id: true, name: true, email: true, role: true } } },
  });
  return NextResponse.json({ comment }, { status: 201 });
}
