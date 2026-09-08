// src/app/api/admin/artists/availability/route.ts
// PATCH /api/admin/artists/availability
//
// Marks an artist as out on a house call, or back at work. Kept separate from
// the artists PUT so the owner can flip it in one tap without resubmitting the
// whole profile (and without a stale form overwriting other fields).

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!
)

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { id, out } = await req.json().catch(() => ({}))

  if (typeof id !== 'number' || typeof out !== 'boolean') {
    return NextResponse.json({ error: 'id (number) and out (boolean) are required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('artists')
    .update({ unavailable_since: out ? new Date().toISOString() : null })
    .eq('id', id)

  if (error) {
    // The column is new; say so plainly rather than failing silently.
    if (error.code === 'PGRST204' || error.code === '42703') {
      return NextResponse.json(
        { error: 'Add the unavailable_since column to the artists table first.' },
        { status: 501 }
      )
    }
    console.error('[artist availability] update error:', error)
    return NextResponse.json({ error: 'Could not update availability' }, { status: 500 })
  }

  return NextResponse.json({ success: true, out })
}
