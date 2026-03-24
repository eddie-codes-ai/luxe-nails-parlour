import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PayClient from './PayClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
  params: { bookingId: string }
}) {
  const booking = await getBooking(params.bookingId)
  if (!booking) notFound()
  return <PayClient booking={booking} />
}