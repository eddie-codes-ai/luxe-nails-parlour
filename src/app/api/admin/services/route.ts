import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── GET — list all services (with category name joined) ──────────────────────

export async function GET() {
  const { data, error } = await supabase
    .from("services")
    .select("*, categories(name)")
    .order("category_id", { ascending: true })
    .order("name",        { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ services: data ?? [] });
}

// ─── POST — create a new service ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    description,
    base_price,
    duration_minutes,
    category_id,
    house_call_available,
    is_active,
  } = body;

  if (!name?.trim() || !base_price || !duration_minutes || !category_id) {
    return NextResponse.json(
      { error: "name, base_price, duration_minutes and category_id are required." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("services").insert([{
    name:                 name.trim(),
    description:          description?.trim() ?? "",
    base_price:           Number(base_price),
    duration_minutes:     Number(duration_minutes),
    category_id:          Number(category_id),
    house_call_available: house_call_available !== false,  // default true
    is_active:            is_active !== false,             // default true
  }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// ─── PUT — update an existing service ────────────────────────────────────────

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const {
    id,
    name,
    description,
    base_price,
    duration_minutes,
    category_id,
    house_call_available,
    is_active,
  } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const { error } = await supabase
    .from("services")
    .update({
      name:                 name?.trim(),
      description:          description?.trim() ?? "",
      base_price:           Number(base_price),
      duration_minutes:     Number(duration_minutes),
      category_id:          Number(category_id),
      house_call_available: Boolean(house_call_available),
      is_active:            Boolean(is_active),
      updated_at:           new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// ─── DELETE — remove a service ────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}