// src/app/api/bookings/cancel/route.ts
// POST /api/bookings/cancel?id=xxx
// Uses query param instead of [id] to avoid Windows bracket issues

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const refundChoice = body.refund_choice ?? 'refund'

  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('id, status, booking_date, start_time, is_late_night, deposit_amount')
    .eq('id', id)
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  if (!['confirmed', 'pending_payment', 'payment_submitted', 'pending_approval'].includes(booking.status)) {
    return NextResponse.json(
      { error: `This booking cannot be cancelled (status: ${booking.status})` },
      { status: 400 }
    )
  }

  const now = new Date()
  const appointmentDateTime = new Date(`${booking.booking_date}T${booking.start_time}`)
  const hoursNotice = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  let cancellationTier: string
  let refundStatus: string
  let refundLabel: string
  let message: string

  if (booking.is_late_night) {
    if (hoursNotice >= 4) {
      cancellationTier = 'early'
      refundStatus     = 'full_refund'
      refundLabel      = 'Full refund - KSh ' + Number(booking.deposit_amount).toLocaleString() + ' will be returned within 2-3 days'
      message          = 'Your late night booking has been cancelled.'
    } else {
      cancellationTier = 'late'
      refundStatus     = 'none'
      refundLabel      = 'No refund - cancellation was within 4 hours of appointment'
      message          = 'Your booking has been cancelled. No refund applies for late night cancellations within 4 hours.'
    }
  } else if (hoursNotice >= 48) {
    cancellationTier = 'early'
    refundStatus     = refundChoice === 'credit' ? 'credit' : 'full_refund'
    refundLabel      = refundChoice === 'credit'
      ? 'Credit stored against your phone number for your next booking'
      : 'Full refund - KSh ' + Number(booking.deposit_amount).toLocaleString() + ' will be returned within 2-3 days'
    message          = 'Your booking has been cancelled with plenty of notice.'
  } else if (hoursNotice >= 24) {
    cancellationTier = 'mid'
    refundStatus     = 'credit'
    refundLabel      = 'Credit stored against your phone number for your next booking'
    message          = 'Your booking has been cancelled. Your deposit has been kept as credit.'
  } else {
    cancellationTier = 'late'
    refundStatus     = 'none'
    refundLabel      = 'No refund - cancellation was within 24 hours of appointment'
    message          = 'Your booking has been cancelled. No refund applies for cancellations within 24 hours.'
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status:            'cancelled',
      cancellation_tier: cancellationTier,
      refund_status:     refundStatus,
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }

  return NextResponse.json({
    success:       true,
    message,
    refund_label:  refundLabel,
    tier:          cancellationTier,
    refund_status: refundStatus,
  })
}