import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Reachable without a session. Everything else under the matcher requires one.
const PUBLIC_PAGES = new Set(["/admin/login", "/admin/forgot-password"]);
const PUBLIC_APIS = new Set([
  "/api/admin/forgot-password",
  "/api/admin/reset-password",
]);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApi = pathname.startsWith("/api/");
  const isAuthenticated = !!(await verifySession(
    request.cookies.get(SESSION_COOKIE)?.value
  ));

  if (isApi) {
    if (PUBLIC_APIS.has(pathname)) return NextResponse.next();
    // API callers get a 401 to handle, not a redirect to an HTML login page.
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (PUBLIC_PAGES.has(pathname)) {
    if (isAuthenticated && pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // /api/admin/* was previously unmatched, leaving every admin write endpoint
  // reachable by anonymous requests.
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
