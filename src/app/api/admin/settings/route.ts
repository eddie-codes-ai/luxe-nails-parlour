import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function PUT(request: NextRequest) {
  const { currentPassword, newPassword } = await request.json();

  // Fetch current credentials from Supabase
  const { data, error } = await supabaseAdmin
    .from("admin_settings")
    .select("password")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }

  // Verify current password
  if (data.password !== currentPassword) {
    return NextResponse.json({ success: false, error: "incorrect_password" }, { status: 401 });
  }

  // Update to new password
  const { error: updateError } = await supabaseAdmin
    .from("admin_settings")
    .update({ password: newPassword })
    .eq("id", 1);

  if (updateError) {
    return NextResponse.json({ success: false, error: "update_failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}