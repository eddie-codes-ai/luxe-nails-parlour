import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashPassword, verifyPassword } from "@/lib/password";
import { requireAdmin } from "@/lib/requireAdmin";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function PUT(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { currentPassword, newPassword } = await request.json().catch(() => ({}));

  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ success: false, error: "password_too_short" }, { status: 400 });
  }

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
  if (!(await verifyPassword(currentPassword, data.password))) {
    return NextResponse.json({ success: false, error: "incorrect_password" }, { status: 401 });
  }

  // Update to new password
  const { error: updateError } = await supabaseAdmin
    .from("admin_settings")
    .update({ password: await hashPassword(newPassword) })
    .eq("id", 1);

  if (updateError) {
    return NextResponse.json({ success: false, error: "update_failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}