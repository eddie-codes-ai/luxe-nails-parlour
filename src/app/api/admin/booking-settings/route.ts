// src/app/api/admin/booking-settings/route.ts
// GET  /api/admin/booking-settings — fetch current settings
// PATCH /api/admin/booking-settings — update settings

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

export async function GET() {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: settings, error } = await supabase
    .from('booking_settings')
    .select('*')
    .eq('id', 1)
    .single()

  if (error || !settings) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }

  return NextResponse.json({ settings })
}

export async function PATCH(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))

  const {
    deposit_percent,
    travel_fee,
    slot_hold_minutes,
    late_night_surcharge_percent,
    late_grace_minutes,
    late_cancel_hours,
    owner_whatsapp,
    owner_email,
  } = body

  const { error } = await supabase
    .from('booking_settings')
    .update({
      deposit_percent:              Number(deposit_percent),
      travel_fee:                   Number(travel_fee),
      slot_hold_minutes:            Number(slot_hold_minutes),
      late_night_surcharge_percent: Number(late_night_surcharge_percent),
      late_grace_minutes:           Number(late_grace_minutes),
      late_cancel_hours:            Number(late_cancel_hours),
      owner_whatsapp:               owner_whatsapp?.trim() ?? null,
      owner_email:                  owner_email?.trim() ?? null,
    })
    .eq('id', 1)

  if (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Settings saved' })
}