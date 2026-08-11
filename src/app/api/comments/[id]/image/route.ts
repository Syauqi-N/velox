import { NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticatedUser();
  if (!user || user.status !== "ACTIVE") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const comment = await prisma.comment.findUnique({ where: { id }, select: { imageData: true, imageMimeType: true } });
  if (!comment?.imageData || !comment.imageMimeType) return NextResponse.json({ error: "Gambar tidak ditemukan." }, { status: 404 });
  return new NextResponse(comment.imageData, { headers: { "Content-Type": comment.imageMimeType, "Cache-Control": "private, max-age=300" } });
}
