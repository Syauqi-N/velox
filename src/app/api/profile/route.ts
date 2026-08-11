import { NextRequest, NextResponse } from "next/server";
import { InvestmentStyle, type Prisma } from "@prisma/client";
import { authenticatedUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { parseImageUpload } from "@/lib/image-upload";
import { INVESTMENT_STYLES, memberAvatarUrl, SECTOR_OPTIONS } from "@/lib/member-profile";
import { takeRateLimit } from "@/lib/rate-limit";
import { readJsonObject } from "@/lib/request";
import { trimmedText } from "@/lib/validation";

const profileSelect = {
  id: true,
  name: true,
  email: true,
  bio: true,
  memberTags: true,
  investmentStyle: true,
  favoriteSectors: true,
  avatarMimeType: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

function profileResponse(profile: Prisma.UserGetPayload<{ select: typeof profileSelect }>) {
  const { avatarMimeType, updatedAt, ...data } = profile;
  return { ...data, avatarUrl: memberAvatarUrl(profile.id, avatarMimeType, updatedAt) };
}

function cleanTags(value: unknown) {
  if (!Array.isArray(value) || value.some((tag) => typeof tag !== "string")) return null;
  const tags = value.map((tag) => String(tag).trim().replace(/\s+/g, " ")).filter(Boolean);
  const unique = [...new Map(tags.map((tag) => [tag.toLocaleLowerCase("id-ID"), tag])).values()];
  if (unique.length > 3 || unique.some((tag) => tag.length > 30 || /[\u0000-\u001f\u007f]/.test(tag))) return null;
  return unique;
}

function cleanSectors(value: unknown) {
  if (!Array.isArray(value) || value.some((sector) => typeof sector !== "string")) return null;
  const allowed = new Set(SECTOR_OPTIONS.map((option) => option.value as string));
  const sectors = [...new Set(value.map(String))];
  if (sectors.length > 5 || sectors.some((sector) => !allowed.has(sector))) return null;
  return sectors;
}

export async function GET() {
  const user = await authenticatedUser();
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const profile = await prisma.user.findUnique({ where: { id: user.id }, select: profileSelect });
  if (!profile) return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ profile: profileResponse(profile) });
}

export async function PATCH(req: NextRequest) {
  const user = await authenticatedUser();
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rateLimit = takeRateLimit(`profile-write:${user.id}`, 20, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak perubahan profil." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  let nameInput: unknown;
  let bioInput: unknown;
  let tagsInput: unknown;
  let styleInput: unknown;
  let sectorsInput: unknown;
  let removeAvatar = false;
  let avatar: Awaited<ReturnType<typeof parseImageUpload>>["image"] = null;
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.startsWith("multipart/form-data")) {
    const form = await req.formData();
    nameInput = form.get("name");
    bioInput = form.get("bio");
    tagsInput = form.getAll("memberTags");
    styleInput = form.get("investmentStyle");
    sectorsInput = form.getAll("favoriteSectors");
    removeAvatar = form.get("removeAvatar") === "true";
    const parsedAvatar = await parseImageUpload(form.get("avatar"));
    if (parsedAvatar.error) return NextResponse.json({ error: parsedAvatar.error }, { status: 400 });
    avatar = parsedAvatar.image;
  } else {
    const body = await readJsonObject(req);
    if (!body) return NextResponse.json({ error: "Payload JSON tidak valid." }, { status: 400 });
    nameInput = body.name;
    bioInput = body.bio;
    tagsInput = body.memberTags;
    styleInput = body.investmentStyle;
    sectorsInput = body.favoriteSectors;
    removeAvatar = body.removeAvatar === true;
  }

  const name = trimmedText(nameInput, 80, true);
  const bio = trimmedText(bioInput, 160);
  const memberTags = cleanTags(tagsInput);
  const favoriteSectors = cleanSectors(sectorsInput);
  const style = typeof styleInput === "string" && styleInput ? styleInput : null;
  const allowedStyles = new Set(INVESTMENT_STYLES.map((option) => option.value as string));
  if (!name) return NextResponse.json({ error: "Nama wajib diisi dan maksimal 80 karakter." }, { status: 400 });
  if (bio === null) return NextResponse.json({ error: "Bio maksimal 160 karakter." }, { status: 400 });
  if (!memberTags) return NextResponse.json({ error: "Maksimal 3 member tag, masing-masing 30 karakter." }, { status: 400 });
  if (!favoriteSectors) return NextResponse.json({ error: "Pilih maksimal 5 sektor yang tersedia." }, { status: 400 });
  if (style && !allowedStyles.has(style)) return NextResponse.json({ error: "Gaya investasi tidak valid." }, { status: 400 });

  const avatarData = avatar
    ? { avatarData: new Uint8Array(avatar.data), avatarMimeType: avatar.mimeType, avatarName: avatar.name }
    : removeAvatar
      ? { avatarData: null, avatarMimeType: null, avatarName: null }
      : {};
  const profile = await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      bio: bio || null,
      memberTags,
      investmentStyle: style as InvestmentStyle | null,
      favoriteSectors,
      ...avatarData,
    },
    select: profileSelect,
  });
  return NextResponse.json({ profile: profileResponse(profile) });
}
