// src/app/api/artists/route.ts
// GET /api/artists
// Returns all artists for the booking form selection

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('artists')
    .select('id, name, bio, photo_url, buffer_minutes')
    .order('name')

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 })
  }

  return NextResponse.json({ artists: data ?? [] })
}