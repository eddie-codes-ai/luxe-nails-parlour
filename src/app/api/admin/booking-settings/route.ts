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

  const { error } = await supabase
    .from('booking_settings')
    .update({ ...base, mpesa_till: mpesa_till?.trim() || null })
    .eq('id', 1)

  if (!error) {
    return NextResponse.json({ success: true, message: 'Settings saved' })
  }

  // The mpesa_till column is new. Until the migration is applied, save
  // everything else rather than failing the whole form.
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
    message: 'Settings saved, but the M-Pesa till was not stored — add the mpesa_till column to booking_settings.',
  })
}