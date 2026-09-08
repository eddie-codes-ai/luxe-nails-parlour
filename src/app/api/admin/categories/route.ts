import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/requireAdmin";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// GET — fetch all categories
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ categories: [] }, { status: 500 });
  }

  return NextResponse.json({ categories: data || [] });
}

// POST — add a new category
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("categories")
    .insert([{ name: body.name.trim() }])
    .select();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, category: data[0] });
}

// DELETE — remove a category
export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}