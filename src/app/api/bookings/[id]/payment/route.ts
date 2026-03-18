// src/app/api/bookings/[id]/payment/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, customer_name, customer_phone, service_price, deposit_amount, booking_date, start_time, status, location_type, is_late_night, services ( name ), artists ( name )')
    .eq('id', id)
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  return NextResponse.json({ booking })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: { mpesa_ref: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { mpesa_ref } = body

  if (!mpesa_ref?.trim()) {
    return NextResponse.json({ error: 'M-Pesa reference is required' }, { status: 400 })
  }

  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('id, status, expires_at')
    .eq('id', id)
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  if (booking.status !== 'pending_payment') {
    return NextResponse.json(
      { error: `Cannot submit payment for a booking with status: ${booking.status}` },
      { status: 400 }
    )
  }

  if (new Date(booking.expires_at) < new Date()) {
    await supabase.from('bookings').update({ status: 'expired' }).eq('id', id)
    return NextResponse.json(
      { error: 'Your reserved slot has expired. Please start a new booking.' },
      { status: 410 }
    )
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      deposit_mpesa_ref: mpesa_ref.trim().toUpperCase(),
      status: 'payment_submitted',
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to submit payment reference' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'Payment reference received. We will confirm your booking shortly.',
  })
}