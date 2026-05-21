import { NextRequest, NextResponse } from "next/server";

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname === "/login" ||
    pathname === "/api/auth/login" ||
    pathname === "/capital" ||
    pathname === "/founders" ||
    pathname === "/mentors"
  ) {
    return NextResponse.next();
  }

  const participantPassword = process.env.PARTICIPANT_PASSWORD;

  if (!participantPassword) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("participant_auth");

  if (authCookie) {
    const expected = await hashPassword(participantPassword);
    if (authCookie.value === expected) {
      return NextResponse.next();
    }
  }

  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/") {
    loginUrl.searchParams.set("from", pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
