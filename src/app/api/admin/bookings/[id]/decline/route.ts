// src/app/api/admin/bookings/[id]/decline/route.ts
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'
import { customerDeclinedEmail } from '@/lib/email-templates'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin-auth')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json().catch(() => ({}))

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, services(name)')
    .eq('id', id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  await supabase
    .from('bookings')
    .update({ status: 'declined', admin_notes: body.admin_notes ?? booking.admin_notes })
    .eq('id', id)

  // Send decline email if customer has email
  if (booking.customer_email) {
    const formattedDate = new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('en-KE', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    const [h, m] = booking.start_time.split(':').map(Number)
    const suffix = h >= 12 ? 'PM' : 'AM'
    const hh = h > 12 ? h - 12 : h === 0 ? 12 : h
    const formattedTime = `${hh}:${String(m).padStart(2, '0')} ${suffix}`

    sendEmail({
      to: booking.customer_email,
      subject: `Booking Update — ${booking.services?.name}`,
      html: customerDeclinedEmail({
        customerName: booking.customer_name,
        serviceName:  booking.services?.name ?? 'Service',
        bookingDate:  formattedDate,
        startTime:    formattedTime,
        bookingId:    booking.id,
      }),
    }).catch(err => console.error('[decline] email failed:', err))
  }

  return NextResponse.json({ success: true })
}