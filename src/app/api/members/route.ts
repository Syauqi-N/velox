import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/authz";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = await authenticatedUser();
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        role: true,
        isAi: true,
        memberTags: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      members: users.map((u) => ({
        id: u.id,
        name: u.name,
        avatarUrl: null,
        role: u.role,
        isAi: u.isAi,
        memberTags: Array.isArray(u.memberTags) ? u.memberTags : [],
      })),
    });
  } catch (error) {
    console.error("Failed to fetch members", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
