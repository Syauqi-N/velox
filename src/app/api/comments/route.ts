import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { takeRateLimit } from "@/lib/rate-limit";
import { readJsonObject } from "@/lib/request";
import { trimmedText } from "@/lib/validation";
import { parseImageUpload } from "@/lib/image-upload";
import { memberAvatarUrl } from "@/lib/member-profile";
import { answerTristaMention, createTristaPlaceholder } from "@/lib/trista";
import { mentionsTrista } from "@/lib/trista-core";

export async function POST(req: NextRequest) {
  const user = await authenticatedUser();
  if (!user || user.status !== "ACTIVE") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rateLimit = takeRateLimit(`comments-write:${user.id}`, 30, 60 * 60 * 1000);
  if (!rateLimit.allowed) return NextResponse.json({ error: "Batas komentar tercapai." }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } });

  let postId = "";
  let content = "";
  let imageData: Uint8Array | null = null;
  let imageMimeType: string | null = null;
  let imageName: string | null = null;
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.startsWith("multipart/form-data")) {
    const form = await req.formData();
    postId = typeof form.get("postId") === "string" ? String(form.get("postId")).trim() : "";
    const parsedContent = trimmedText(form.get("content"), 500);
    if (parsedContent === null) return NextResponse.json({ error: "Komentar maksimal 500 karakter." }, { status: 400 });
    content = parsedContent;
    const parsedImage = await parseImageUpload(form.get("image"));
    if (parsedImage.error) return NextResponse.json({ error: parsedImage.error }, { status: 400 });
    imageData = parsedImage.image?.data ?? null;
    imageMimeType = parsedImage.image?.mimeType ?? null;
    imageName = parsedImage.image?.name ?? null;
  } else {
    const body = await readJsonObject(req);
    if (!body) return NextResponse.json({ error: "Payload JSON tidak valid." }, { status: 400 });
    postId = typeof body.postId === "string" ? body.postId.trim() : "";
    const parsedContent = trimmedText(body.content, 500);
    if (parsedContent === null) return NextResponse.json({ error: "Komentar maksimal 500 karakter." }, { status: 400 });
    content = parsedContent;
  }

  if (!postId) return NextResponse.json({ error: "postId wajib diisi." }, { status: 400 });
  if (!content && !imageData) return NextResponse.json({ error: "Tulis komentar atau pilih gambar." }, { status: 400 });
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "Postingan tidak ditemukan." }, { status: 404 });

  const comment = await prisma.comment.create({
    data: { postId, content, imageData: imageData ? new Uint8Array(imageData) : null, imageMimeType, imageName, authorId: user.id },
    select: { id: true, content: true, imageMimeType: true, aiStatus: true, createdAt: true, author: { select: { id: true, name: true, memberTags: true, avatarMimeType: true, updatedAt: true, email: true, role: true, isAi: true } } },
  });

  let tristaQueued = false;
  if (mentionsTrista(content)) {
    try {
      const placeholderId = await createTristaPlaceholder(postId);
      tristaQueued = true;
      after(() => answerTristaMention(postId, placeholderId));
    } catch (error) {
      console.error("Failed to queue TRISTA comment mention", error);
    }
  }

  return NextResponse.json({ comment: { ...comment, author: { ...comment.author, avatarUrl: memberAvatarUrl(comment.author.id, comment.author.avatarMimeType, comment.author.updatedAt) }, imageUrl: comment.imageMimeType ? `/api/comments/${comment.id}/image` : null }, tristaQueued }, { status: 201 });
}
