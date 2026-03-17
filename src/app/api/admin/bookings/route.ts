// src/app/api/admin/bookings/route.ts
// GET /api/admin/bookings
// Returns all bookings with service + artist details, newest first

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  // ── Auth check ─────────────────────────────────────────────────────────────
  const cookieStore = await cookies()
  const auth = cookieStore.get('admin-auth')
  if (auth?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      services ( name ),
      artists ( name )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }

  return NextResponse.json({ bookings: data ?? [] })
}