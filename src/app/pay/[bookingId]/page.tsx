import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PayClient from './PayClient'
import { getPaymentSettings } from '@/lib/payment-settings'
import { holdsSlot } from '@/lib/booking-holds'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!
)

export const metadata: Metadata = {
  title: 'Complete Payment | Luxe Nails Parlour',
  robots: { index: false },
}

interface BookingRow {
  id: string
  customer_name: string
  customer_phone: string
  booking_date: string
  start_time: string
  location_type: 'in_shop' | 'house_call'
  house_call_address: string | null
  service_price: number
  travel_fee: number
  late_night_surcharge: number
  deposit_amount: number
  is_late_night: boolean
  status: string
  booking_source: string | null
  expires_at: string | null
  deposit_mpesa_ref: string | null
  services: { name: string } | null
  artists: { name: string } | null
}

async function getBooking(id: string): Promise<BookingRow | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      customer_name,
      customer_phone,
      booking_date,
      start_time,
      location_type,
      house_call_address,
      service_price,
      travel_fee,
      late_night_surcharge,
      deposit_amount,
      is_late_night,
      status,
      booking_source,
      expires_at,
      deposit_mpesa_ref,
      services ( name ),
      artists ( name )
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null

  return {
    ...data,
    services: Array.isArray(data.services) ? (data.services[0] ?? null) : data.services,
    artists:  Array.isArray(data.artists)  ? (data.artists[0]  ?? null) : data.artists,
  } as BookingRow
}

export default async function PayPage({
  params,
}: {
  // Next 16 passes params as a Promise. Reading it synchronously yielded
  // undefined, so this page 404'd on every request.
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = await params

  const [booking, payment] = await Promise.all([
    getBooking(bookingId),
    getPaymentSettings(),
  ])

  if (!booking) notFound()

  // Bookings the owner took over WhatsApp let the customer pick their own
  // service and add-ons, right up until they pay.
  const selectable =
    booking.booking_source !== 'website' &&
    ['pending_payment', 'pending_approval'].includes(booking.status) &&
    holdsSlot(booking)

  return <PayClient booking={booking} payment={payment} selectable={selectable} />
}