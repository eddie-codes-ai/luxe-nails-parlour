import { NextResponse } from "next/server";
import { LEGACY_COOKIE, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ success: true });

  for (const name of [SESSION_COOKIE, LEGACY_COOKIE]) {
    response.cookies.set(name, "", { ...sessionCookieOptions, expires: new Date(0) });
  }

  return response;
}
