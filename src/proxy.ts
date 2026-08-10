import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Proxy performs only an optimistic cookie check. Protected Route Handlers
// verify the current database-backed session again before returning data.
const { auth: optimisticAuth } = NextAuth(authConfig);

export default optimisticAuth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const pathname = nextUrl.pathname;

  const publicRoutes = ["/", "/login", "/signup", "/activate", "/set-password"];
  const isPublic = publicRoutes.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );

  // Authentication and invite activation must remain reachable publicly.
  if (pathname.startsWith("/api/auth")) return NextResponse.next();
  if (
    pathname === "/api/signup" ||
    pathname === "/api/activate" ||
    pathname === "/api/set-password"
  ) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublic) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
