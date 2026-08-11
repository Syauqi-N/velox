import { NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticatedUser();
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const member = await prisma.user.findFirst({
    where: { id, status: "ACTIVE" },
    select: { avatarData: true, avatarMimeType: true },
  });
  if (!member?.avatarData || !member.avatarMimeType) {
    return NextResponse.json({ error: "Avatar tidak ditemukan." }, { status: 404 });
  }
  return new NextResponse(member.avatarData, {
    headers: { "Content-Type": member.avatarMimeType, "Cache-Control": "private, max-age=86400" },
  });
}
