import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { takeRateLimit } from "@/lib/rate-limit";
import { readJsonObject } from "@/lib/request";
import { trimmedText } from "@/lib/validation";

export async function GET() {
  const user = await authenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rateLimit = takeRateLimit(`posts-read:${user.id}`, 60, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const posts = await prisma.post.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        take: 100,
        include: { author: { select: { id: true, name: true, email: true, role: true } } },
      },
    },
  });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const user = await authenticatedUser();
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = takeRateLimit(`posts-write:${user.id}`, 20, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Batas posting tercapai." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ error: "Payload JSON tidak valid." }, { status: 400 });
  }

  const content = trimmedText(body.content, 2000, true);
  if (content === null) {
    return NextResponse.json(
      { error: "Konten harus 1–2000 karakter." },
      { status: 400 },
    );
  }

  const post = await prisma.post.create({
    data: { content, authorId: user.id },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, email: true, role: true } } },
      },
    },
  });
  return NextResponse.json({ post }, { status: 201 });
}
