// src/app/api/admin/artist-schedules/route.ts
// GET  /api/admin/artist-schedules?artistId=xxx — fetch schedules for artist
// POST /api/admin/artist-schedules — upsert schedules for artist

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get('admin-auth')?.value === 'true'
}

export async function GET(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const artistId = searchParams.get('artistId')

  if (!artistId) return NextResponse.json({ error: 'artistId is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('artist_schedules')
    .select('*')
    .eq('artist_id', artistId)
    .gte('schedule_date', new Date().toISOString().split('T')[0])
    .order('schedule_date')

  if (error) return NextResponse.json({ error: 'Failed to load schedules' }, { status: 500 })

  return NextResponse.json({ schedules: data ?? [] })
}

export async function POST(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { artistId, schedules } = body

  if (!artistId || !Array.isArray(schedules)) {
    return NextResponse.json({ error: 'artistId and schedules are required' }, { status: 400 })
  }

  // Upsert all schedules — insert or update based on artist_id + schedule_date
  const rows = schedules.map((s: any) => ({
    artist_id:        artistId,
    schedule_date:    s.schedule_date,
    start_time:       s.start_time ?? '09:30',
    end_time:         s.end_time ?? '19:00',
    late_cutoff_time: s.late_cutoff_time ?? null,
    late_end_time:    s.late_end_time ?? null,
    is_blocked:       s.is_blocked ?? false,
  }))

  const { error } = await supabase
    .from('artist_schedules')
    .upsert(rows, { onConflict: 'artist_id,schedule_date' })

  if (error) {
    console.error('[artist-schedules] upsert error:', error)
    return NextResponse.json({ error: 'Failed to save schedules' }, { status: 500 })
  }

  return NextResponse.json({ success: true, saved: rows.length })
}