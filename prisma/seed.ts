import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) throw new Error("DATABASE_URL wajib diisi.");
if (!email) throw new Error("ADMIN_EMAIL wajib diisi untuk seed admin.");
if (!password || password.length < 12) {
  throw new Error("ADMIN_PASSWORD wajib diisi dan minimal 12 karakter.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

try {
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: "Velox Admin",
      passwordHash,
      role: "admin",
      status: "ACTIVE",
    },
    update: {
      passwordHash,
      role: "admin",
      status: "ACTIVE",
      entryCodeHash: null,
      entryCodeExpiresAt: null,
    },
  });
  console.log(`Admin siap: ${email}`);
} finally {
  await prisma.$disconnect();
}
