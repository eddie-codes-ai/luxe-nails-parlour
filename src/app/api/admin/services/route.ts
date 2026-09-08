import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/requireAdmin";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── GET — list all services ──────────────────────────────────────────────────

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { data, error } = await supabase
    .from("services")
    .select("id, name, tagline, tag, tag_color, description, base_price, duration_minutes, category, house_call_available, is_active, includes, add_ons, created_at")
    .order("category", { ascending: true })
    .order("name",     { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ services: data ?? [] });
}

// ─── POST — create a new service ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();
  const {
    name, tagline, tag, tag_color,
    description, base_price, duration_minutes,
    category, house_call_available, is_active,
    includes, add_ons,
  } = body;

  if (!name?.trim() || !base_price || !duration_minutes || !category?.trim()) {
    return NextResponse.json(
      { error: "name, base_price, duration_minutes and category are required." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("services").insert([{
    name:                 name.trim(),
    tagline:              tagline?.trim()   ?? "",
    tag:                  tag?.trim()       || null,
    tag_color:            tag?.trim() ? (tag_color ?? "#C5A358") : null,
    description:          description?.trim() ?? "",
    base_price:           Number(base_price),
    duration_minutes:     Number(duration_minutes),
    category:             category.trim(),
    house_call_available: house_call_available !== false,
    is_active:            is_active !== false,
    includes:             Array.isArray(includes) ? includes : [],
    add_ons:              Array.isArray(add_ons)  ? add_ons  : [],
  }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// ─── PUT — update an existing service ────────────────────────────────────────

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json();
  const {
    id, name, tagline, tag, tag_color,
    description, base_price, duration_minutes,
    category, house_call_available, is_active,
    includes, add_ons,
  } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const { error } = await supabase
    .from("services")
    .update({
      name:                 name?.trim(),
      tagline:              tagline?.trim()   ?? "",
      tag:                  tag?.trim()       || null,
      tag_color:            tag?.trim() ? (tag_color ?? "#C5A358") : null,
      description:          description?.trim() ?? "",
      base_price:           Number(base_price),
      duration_minutes:     Number(duration_minutes),
      category:             category?.trim(),
      house_call_available: Boolean(house_call_available),
      is_active:            Boolean(is_active),
      includes:             Array.isArray(includes) ? includes : [],
      add_ons:              Array.isArray(add_ons)  ? add_ons  : [],
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
  const denied = await requireAdmin();
  if (denied) return denied;

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