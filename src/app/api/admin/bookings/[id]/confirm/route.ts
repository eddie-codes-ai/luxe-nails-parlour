// src/app/api/admin/bookings/[id]/confirm/route.ts
// PATCH /api/admin/bookings/[id]/confirm
// Owner confirms a booking → sends customer confirmation email

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'
import { customerConfirmationEmail } from '@/lib/email-templates'
import { requireAdmin } from "@/lib/requireAdmin";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params

  // ── Fetch full booking with service + artist ───────────────────────────────
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select(`
      *,
      services ( name ),
      artists ( name )
    `)
    .eq('id', id)
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  if (!['payment_submitted', 'pending_approval'].includes(booking.status)) {
    return NextResponse.json(
      { error: `Cannot confirm a booking with status: ${booking.status}` },
      { status: 400 }
    )
  }

  // ── Update status to confirmed ─────────────────────────────────────────────
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status:          'confirmed',
      deposit_paid_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 })
  }

  // ── Send customer confirmation email ───────────────────────────────────────
  if (booking.customer_email) {
    const formattedDate = new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('en-KE', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    const formattedTime = (() => {
      const [h, m] = booking.start_time.split(':').map(Number)
      const suffix = h >= 12 ? 'PM' : 'AM'
      const hh = h > 12 ? h - 12 : h === 0 ? 12 : h
      return `${hh}:${String(m).padStart(2, '0')} ${suffix}`
    })()

    const cancelUrl = `https://luxenailsparlour.vercel.app/booking/cancel?id=${booking.id}`

    sendEmail({
      to:      booking.customer_email,
      subject: `Booking Confirmed ✓ — ${booking.services?.name} on ${formattedDate}`,
      html: customerConfirmationEmail({
        customerName:     booking.customer_name,
        serviceName:      booking.services?.name ?? 'Service',
        artistName:       booking.artists?.name ?? 'Our artist',
        bookingDate:      formattedDate,
        startTime:        formattedTime,
        locationType:     booking.location_type,
        houseCallAddress: booking.house_call_address,
        depositAmount:    Number(booking.deposit_amount),
        bookingId:        booking.id,
        cancelUrl,
      }),
    }).catch(err => console.error('[confirm] customer email failed:', err))
  }

  return NextResponse.json({ success: true, message: 'Booking confirmed' })
}