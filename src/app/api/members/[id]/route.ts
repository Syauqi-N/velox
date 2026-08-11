import { NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { memberAvatarUrl } from "@/lib/member-profile";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticatedUser();
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const member = await prisma.user.findFirst({
    where: { id, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      bio: true,
      memberTags: true,
      investmentStyle: true,
      favoriteSectors: true,
      avatarMimeType: true,
      role: true,
      isAi: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { posts: true, comments: true } },
    },
  });
  if (!member) return NextResponse.json({ error: "Profil member tidak ditemukan." }, { status: 404 });
  const { avatarMimeType, updatedAt, _count, ...profile } = member;
  return NextResponse.json({
    profile: {
      ...profile,
      avatarUrl: memberAvatarUrl(member.id, avatarMimeType, updatedAt),
      stats: { posts: _count.posts, comments: _count.comments },
      isOwnProfile: member.id === user.id,
    },
  });
}
