import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashPassword, isHashed, verifyPassword } from "@/lib/password";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { createSession, SESSION_COOKIE, SESSION_MAX_AGE, sessionCookieOptions } from "@/lib/session";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(request: NextRequest) {
  const limit = rateLimit(clientKey(request, "admin-login"), 8, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { email, password } = await request.json().catch(() => ({}));

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("admin_settings")
    .select("email, password")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const emailMatches = email.trim().toLowerCase() === String(data.email).trim().toLowerCase();
  const passwordMatches = await verifyPassword(password, data.password);

  if (!emailMatches || !passwordMatches) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  // Transparently upgrade the legacy plaintext row to a hash on first login.
  if (!isHashed(data.password)) {
    const hashed = await hashPassword(password);
    const { error: upgradeError } = await supabaseAdmin
      .from("admin_settings")
      .update({ password: hashed })
      .eq("id", 1);
    if (upgradeError) {
      console.error("[admin-login] password hash upgrade failed:", upgradeError);
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, await createSession(data.email), {
    ...sessionCookieOptions,
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
