// src/app/api/gallery/route.ts
// GET /api/gallery — public, read-only gallery images for the /gallery page.
//
// The public page previously called /api/admin/gallery, which is now
// authenticated. Reads run server-side with the service key so the gallery
// table needs no anon-readable RLS policy.

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('position', { ascending: true })

  if (error) {
    console.error('[gallery] fetch error:', error)
    return NextResponse.json({ images: [] }, { status: 500 })
  }

  return NextResponse.json({ images: data ?? [] })
}
