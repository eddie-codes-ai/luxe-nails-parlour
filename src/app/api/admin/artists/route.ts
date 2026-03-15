import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// GET — fetch all artists
export async function GET() {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .order("id", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ artists: data });
}

// POST — add new artist
export async function POST(req: Request) {
  const body = await req.json();
  const { name, role, title, bio, specialty, years_experience, services, mobile_available, photo_url } = body;

  const { error } = await supabase.from("artists").insert([{
    name, role, title, bio, specialty, years_experience, services, mobile_available, photo_url,
  }]);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// PUT — update existing artist
export async function PUT(req: Request) {
  const body = await req.json();
  const { id, name, role, title, bio, specialty, years_experience, services, mobile_available, photo_url } = body;

  const { error } = await supabase.from("artists").update({
    name, role, title, bio, specialty, years_experience, services, mobile_available, photo_url,
  }).eq("id", id);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE — remove artist
export async function DELETE(req: Request) {
  const body = await req.json();
  const { id } = body;

  const { error } = await supabase.from("artists").delete().eq("id", id);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}