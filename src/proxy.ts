import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/admin/login";
  const isForgotPasswordPage = pathname === "/admin/forgot-password";
  const isAuthenticated = request.cookies.get("admin-auth")?.value === "true";

  if (!isAuthenticated && !isLoginPage && !isForgotPasswordPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};