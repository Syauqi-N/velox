import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import type { Prisma } from "@prisma/client";
import { authenticatedUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { parseImageUpload } from "@/lib/image-upload";
import { searchedSymbol } from "@/lib/market";
import { memberAvatarUrl } from "@/lib/member-profile";
import { takeRateLimit } from "@/lib/rate-limit";
import { readJsonObject } from "@/lib/request";
import { trimmedText } from "@/lib/validation";
import { getQuote } from "@/lib/yahoo";
import { answerTristaMention, createTristaPlaceholder } from "@/lib/trista";
import { mentionsTrista } from "@/lib/trista-core";

const postSelect = {
  id: true,
  content: true,
  symbol: true,
  imageMimeType: true,
  priceSnapshot: true,
  changePercentSnapshot: true,
  priceCapturedAt: true,
  createdAt: true,
  author: { select: { id: true, name: true, memberTags: true, avatarMimeType: true, updatedAt: true, email: true, role: true, isAi: true } },
  comments: {
    orderBy: { createdAt: "asc" },
    take: 100,
    select: {
      id: true,
      content: true,
      imageMimeType: true,
      aiStatus: true,
      createdAt: true,
      author: { select: { id: true, name: true, memberTags: true, avatarMimeType: true, updatedAt: true, email: true, role: true, isAi: true } },
    },
  },
} satisfies Prisma.PostSelect;

function toFeedPost(post: Prisma.PostGetPayload<{ select: typeof postSelect }>) {
  const { avatarMimeType, updatedAt, ...author } = post.author;
  return {
    ...post,
    author: { ...author, avatarUrl: memberAvatarUrl(author.id, avatarMimeType, updatedAt) },
    imageUrl: post.imageMimeType ? `/api/posts/${post.id}/image` : null,
    comments: post.comments.map((comment) => ({
      ...comment,
      author: {
        ...comment.author,
        avatarUrl: memberAvatarUrl(comment.author.id, comment.author.avatarMimeType, comment.author.updatedAt),
      },
      imageUrl: comment.imageMimeType ? `/api/comments/${comment.id}/image` : null,
    })),
  };
}

export async function GET(req: NextRequest) {
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

  const requestedSymbol = req.nextUrl.searchParams.get("symbol");
  const symbol = requestedSymbol === null ? null : searchedSymbol(requestedSymbol);
  if (requestedSymbol !== null && !symbol) {
    return NextResponse.json({ error: "Simbol tidak valid." }, { status: 400 });
  }

  const posts = await prisma.post.findMany({
    take: 50,
    where: symbol ? { symbol } : undefined,
    orderBy: { createdAt: "desc" },
    select: postSelect,
  });
  return NextResponse.json({ posts: posts.map(toFeedPost) });
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

  let content = "";
  let symbolInput: unknown = null;
  let imageData: Uint8Array | null = null;
  let imageMimeType: string | null = null;
  let imageName: string | null = null;
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.startsWith("multipart/form-data")) {
    const form = await req.formData();
    const parsedContent = trimmedText(form.get("content"), 2000);
    if (parsedContent === null) {
      return NextResponse.json({ error: "Konten maksimal 2000 karakter." }, { status: 400 });
    }
    content = parsedContent;
    symbolInput = form.get("symbol");
    const parsedImage = await parseImageUpload(form.get("image"));
    if (parsedImage.error) {
      return NextResponse.json({ error: parsedImage.error }, { status: 400 });
    }
    imageData = parsedImage.image?.data ?? null;
    imageMimeType = parsedImage.image?.mimeType ?? null;
    imageName = parsedImage.image?.name ?? null;
  } else {
    const body = await readJsonObject(req);
    if (!body) {
      return NextResponse.json({ error: "Payload JSON tidak valid." }, { status: 400 });
    }
    const parsedContent = trimmedText(body.content, 2000);
    if (parsedContent === null) {
      return NextResponse.json({ error: "Konten maksimal 2000 karakter." }, { status: 400 });
    }
    content = parsedContent;
    symbolInput = body.symbol;
  }

  if (!content && !imageData) {
    return NextResponse.json({ error: "Tulis konten atau pilih gambar." }, { status: 400 });
  }
  const symbol = symbolInput == null || symbolInput === ""
    ? null
    : searchedSymbol(typeof symbolInput === "string" ? symbolInput : null);
  if (symbolInput != null && symbolInput !== "" && !symbol) {
    return NextResponse.json({ error: "Simbol tidak valid." }, { status: 400 });
  }

  const quote = symbol ? await getQuote(symbol).catch(() => null) : null;
  const post = await prisma.post.create({
    data: {
      content,
      symbol,
      imageData: imageData ? new Uint8Array(imageData) : null,
      imageMimeType,
      imageName,
      priceSnapshot: quote?.price ?? null,
      changePercentSnapshot: quote?.changePercent ?? null,
      priceCapturedAt: quote?.price != null ? new Date() : null,
      authorId: user.id,
    },
    select: postSelect,
  });

  let tristaQueued = false;
  if (mentionsTrista(content)) {
    try {
      const placeholderId = await createTristaPlaceholder(post.id);
      tristaQueued = true;
      after(() => answerTristaMention(post.id, placeholderId));
    } catch (error) {
      console.error("Failed to queue TRISTA post mention", error);
    }
  }

  return NextResponse.json({ post: toFeedPost(post), tristaQueued }, { status: 201 });
}
