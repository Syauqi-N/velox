import type { NextAuthConfig } from "next-auth";

// Lightweight NextAuth config shared between the Node runtime (src/auth.ts)
// and anything else. The full Db-backed Credentials provider lives in
// src/auth.ts. Route protection is handled in src/proxy.ts using `auth(req)`.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
} satisfies NextAuthConfig;
