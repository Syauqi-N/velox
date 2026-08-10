import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";
import { clearRateLimit, takeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { normalizedEmail } from "@/lib/validation";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Email + Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = normalizedEmail(credentials?.email);
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const rateLimitKey = `login:${getClientIp(request)}:${email}`;
        if (!takeRateLimit(rateLimitKey, 10, 15 * 60 * 1000).allowed) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash || user.status !== "ACTIVE") return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        clearRateLimit(rateLimitKey);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "member";
        token.status = user.status ?? "ACTIVE";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.id === "string") {
        const currentUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { id: true, role: true, status: true },
        });
        session.user.id = currentUser?.id ?? "";
        session.user.role = currentUser?.role ?? "member";
        session.user.status = currentUser?.status ?? "PENDING";
      }
      return session;
    },
  },
});
