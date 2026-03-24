// src/app/api/bookings/pay/route.ts
// POST /api/bookings/pay
// Customer submits their M-Pesa reference after paying the deposit

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  let body: { bookingId: string; mpesa_ref: string }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { bookingId, mpesa_ref } = body

  if (!bookingId) {
    return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
  }

  const clean = mpesa_ref?.trim().toUpperCase()
  if (!clean || clean.length < 8) {
    return NextResponse.json(
      { error: 'Please enter a valid M-Pesa reference number.' },
      { status: 400 }
    )
  }

  // ── Fetch booking ────────────────────────────────────────────────────────────
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('id, status, customer_name')
    .eq('id', bookingId)
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
  }

  // ── Guard: only allow payment on pending_payment status ─────────────────────
  if (booking.status !== 'pending_payment') {
    const msg: Record<string, string> = {
      payment_submitted: 'Payment already submitted — we will verify and confirm shortly.',
      confirmed:         'This booking is already confirmed.',
      completed:         'This booking has already been completed.',
      cancelled:         'This booking has been cancelled.',
      declined:          'This booking has been declined.',
      expired:           'This booking has expired. Please make a new booking.',
      no_show:           'This booking is marked as no show.',
      pending_approval:  'This booking is pending approval. Payment will be requested once approved.',
    }
    return NextResponse.json(
      { error: msg[booking.status] ?? `Cannot submit payment for a booking with status: ${booking.status}` },
      { status: 400 }
    )
  }

  // ── Check M-Pesa ref not already used ────────────────────────────────────────
  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('deposit_mpesa_ref', clean)
    .neq('id', bookingId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'This M-Pesa reference has already been used on another booking.' },
      { status: 400 }
    )
  }

  // ── Update booking ───────────────────────────────────────────────────────────
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status:            'payment_submitted',
      deposit_mpesa_ref: clean,
      deposit_paid_at:   new Date().toISOString(),
    })
    .eq('id', bookingId)

  if (updateError) {
    console.error('[pay] update error:', updateError)
    return NextResponse.json({ error: 'Failed to save payment. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}