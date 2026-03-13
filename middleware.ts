import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin-auth")?.value;
  const { pathname } = request.nextUrl;

  // If trying to access any /admin route (except login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!token) {
      // Not logged in → redirect to login
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // If already logged in and trying to visit login page → redirect to dashboard
  if (pathname === "/admin/login" && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};