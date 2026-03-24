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

async function getBooking(id: string) {
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
  return data
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