import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/requireAdmin";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// GET — fetch all products
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ products: [] }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}

// POST — add a new product
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert([{
      name: body.name,
      price: body.price,
      description: body.description,
      image_url: body.image_url,
      stock_quantity: body.stock_quantity,
      in_stock: body.in_stock,
      category: body.category,
    }])
    .select();

  if (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }

  return NextResponse.json({ success: true, product: data[0] });
}

// PUT — update an existing product
export async function PUT(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from("products")
    .update({
      name: body.name,
      price: body.price,
      description: body.description,
      image_url: body.image_url,
      stock_quantity: body.stock_quantity,
      in_stock: body.in_stock,
      category: body.category,
    })
    .eq("id", body.id)
    .select();

  if (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }

  return NextResponse.json({ success: true, product: data[0] });
}

// DELETE — remove a product
export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();

  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}