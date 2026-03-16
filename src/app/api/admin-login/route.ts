import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const { data, error } = await supabaseAdmin
    .from("admin_settings")
    .select("email, password")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false }, { status: 500 });
  }

  if (email === data.email && password === data.password) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin-auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}