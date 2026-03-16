import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(request: NextRequest) {
  const { email, code, newPassword } = await request.json();

  if (!email || !code || !newPassword) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "password_too_short" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("admin_settings")
    .select("email, reset_code, reset_code_expires_at")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  if (data.email !== email) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  if (!data.reset_code || data.reset_code !== code) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  const expired =
    !data.reset_code_expires_at ||
    new Date(data.reset_code_expires_at) < new Date();

  if (expired) {
    return NextResponse.json({ error: "code_expired" }, { status: 400 });
  }

  // Update password and clear reset code
  const { error: updateError } = await supabase
    .from("admin_settings")
    .update({
      password: newPassword,
      reset_code: null,
      reset_code_expires_at: null,
    })
    .eq("id", 1);

  if (updateError) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}