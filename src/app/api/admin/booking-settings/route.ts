// src/app/api/admin/booking-settings/route.ts
// GET  /api/admin/booking-settings — fetch current settings
// PATCH /api/admin/booking-settings — update settings

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied

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
  const denied = await requireAdmin()
  if (denied) return denied

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
    mpesa_till,
    default_start_time,
    default_end_time,
    default_late_cutoff_time,
    default_late_end_time,
  } = body

  const base = {
    deposit_percent:              Number(deposit_percent),
    travel_fee:                   Number(travel_fee),
    slot_hold_minutes:            Number(slot_hold_minutes),
    late_night_surcharge_percent: Number(late_night_surcharge_percent),
    late_grace_minutes:           Number(late_grace_minutes),
    late_cancel_hours:            Number(late_cancel_hours),
    owner_whatsapp:               owner_whatsapp?.trim() ?? null,
    owner_email:                  owner_email?.trim() ?? null,
  }

  const extras = {
    mpesa_till:               mpesa_till?.trim() || null,
    default_start_time:       default_start_time || null,
    default_end_time:         default_end_time || null,
    // Blank clears late-night entirely rather than falling back to a default.
    default_late_cutoff_time: default_late_cutoff_time || null,
    default_late_end_time:    default_late_end_time || null,
  }

  const { error } = await supabase
    .from('booking_settings')
    .update({ ...base, ...extras })
    .eq('id', 1)

  if (!error) {
    return NextResponse.json({ success: true, message: 'Settings saved' })
  }

  // mpesa_till and the default_* hours are new columns. Until the migration is
  // applied, save everything else rather than failing the whole form.
  const missingColumn = error.code === 'PGRST204' || error.code === '42703'
  if (!missingColumn) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }

  const { error: retryError } = await supabase
    .from('booking_settings')
    .update(base)
    .eq('id', 1)

  if (retryError) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'Settings saved, but the M-Pesa till and default hours were not stored — run the booking_settings migration.',
  })
}