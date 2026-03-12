import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// GET — fetch all gallery images
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("gallery")
    .select("*")
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ images: [] }, { status: 500 });
  }

  return NextResponse.json({ images: data });
}

// POST — add a new gallery image
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from("gallery")
    .insert([{
      title: body.title,
      category: body.category,
      image_url: body.image_url,
      alt_text: body.alt_text,
      featured: body.featured,
      position: body.position,
      design_group: body.design_group || "",
    }])
    .select();

  if (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }

  return NextResponse.json({ success: true, image: data[0] });
}

// PUT — update an existing gallery image
export async function PUT(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from("gallery")
    .update({
      title: body.title,
      category: body.category,
      image_url: body.image_url,
      alt_text: body.alt_text,
      featured: body.featured,
      position: body.position,
      design_group: body.design_group || "",
    })
    .eq("id", body.id)
    .select();

  if (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }

  return NextResponse.json({ success: true, image: data[0] });
}

// DELETE — remove a gallery image
export async function DELETE(request: NextRequest) {
  const body = await request.json();

  if (body.image_url && body.image_url.includes("supabase")) {
    const path = body.image_url.split("/gallery/")[1];
    if (path) {
      await supabaseAdmin.storage.from("gallery").remove([path]);
    }
  }

  const { error } = await supabaseAdmin
    .from("gallery")
    .delete()
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PATCH — handle image upload to Supabase Storage
export async function PATCH(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { data, error } = await supabaseAdmin.storage
    .from("gallery")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }

  const { data: urlData } = supabaseAdmin.storage
    .from("gallery")
    .getPublicUrl(data.path);

  return NextResponse.json({ success: true, url: urlData.publicUrl });
}