import { randomInt } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: NextRequest) {
  const limit = rateLimit(clientKey(request, "forgot-password"), 4, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "too_many_requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { email } = await request.json().catch(() => ({}));

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Check email matches admin
  const { data, error } = await supabase
    .from("admin_settings")
    .select("email")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  // Always return success — don't reveal if email exists or not
  if (String(data.email).trim().toLowerCase() !== email.trim().toLowerCase()) {
    return NextResponse.json({ success: true });
  }

  // Generate 6-digit code with a cryptographic RNG. Math.random() is
  // predictable and must never be used to mint a security token.
  const code = String(randomInt(100000, 1000000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store in Supabase
  const { error: updateError } = await supabase
    .from("admin_settings")
    .update({
      reset_code: code,
      reset_code_expires_at: expiresAt.toISOString(),
    })
    .eq("id", 1);

  if (updateError) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  // Send email via Resend
  const { error: emailError } = await resend.emails.send({
    from: "Luxe Nails Admin <onboarding@resend.dev>", // swap for your domain later
    to: email,
    subject: "Your Luxe Nails password reset code",
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 480px; margin: 0 auto; padding: 40px 32px; background: #FDFBF7; border: 1px solid #E5E0D8;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 22px; color: #2D2424; letter-spacing: 0.05em;">Luxe Nails</div>
          <div style="font-size: 10px; letter-spacing: 0.3em; color: #C5A358; text-transform: uppercase; margin-top: 4px;">Admin Panel</div>
        </div>
        <h2 style="font-size: 20px; color: #2D2424; font-weight: 400; text-align: center; margin-bottom: 8px;">
          Password Reset Code
        </h2>
        <p style="font-size: 13px; color: rgba(45,36,36,0.6); text-align: center; margin-bottom: 32px;">
          Enter this code to reset your admin password. It expires in <strong>10 minutes</strong>.
        </p>
        <div style="background: #fff; border: 1px solid #E5E0D8; border-radius: 4px; padding: 24px; text-align: center; margin-bottom: 32px;">
          <div style="font-size: 40px; font-weight: 700; letter-spacing: 0.25em; color: #2D2424;">
            ${code}
          </div>
        </div>
        <p style="font-size: 11px; color: rgba(45,36,36,0.4); text-align: center;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (emailError) {
    console.error("Resend error:", emailError);
    return NextResponse.json({ error: "email_failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}