// src/app/api/admin/bookings/manual/route.ts
// POST /api/admin/bookings/manual
// Owner creates a booking manually for WhatsApp/call/walk-in customers

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function timeToMins(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export async function POST(req: NextRequest) {
  // Auth check
  const denied = await requireAdmin()
  if (denied) return denied

  const body = await req.json().catch(() => ({}))

  const {
    customer_name, customer_phone, customer_email,
    service_id, artist_id, booking_date, start_time,
    location_type, house_call_address,
    booking_source, deposit_collection, admin_notes,
  } = body

  // Validate required fields
  if (!customer_name?.trim()) return NextResponse.json({ error: 'Customer name is required' }, { status: 400 })
  if (!customer_phone?.trim()) return NextResponse.json({ error: 'Customer phone is required' }, { status: 400 })
  if (!service_id) return NextResponse.json({ error: 'Service is required' }, { status: 400 })
  if (!booking_date) return NextResponse.json({ error: 'Date is required' }, { status: 400 })
  if (!start_time) return NextResponse.json({ error: 'Time slot is required' }, { status: 400 })
  if (location_type === 'house_call' && !house_call_address?.trim()) {
    return NextResponse.json({ error: 'Address is required for house calls' }, { status: 400 })
  }

  // Fetch service
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('id, name, duration_minutes, base_price, house_call_available')
    .eq('id', service_id)
    .single()

  if (serviceError || !service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

  // Fetch artist (optional)
  let artist: { id: number; buffer_minutes: number; name: string } | null = null
  if (artist_id) {
    const { data } = await supabase
      .from('artists')
      .select('id, name, buffer_minutes')
      .eq('id', artist_id)
      .single()
    artist = data
  }

  // Fetch booking settings
  const { data: settings } = await supabase
    .from('booking_settings')
    .select('*')
    .eq('id', 1)
    .single()

  const depositPercent     = settings?.deposit_percent ?? 30
  const travelFee          = settings?.travel_fee ?? 0
  const lateNightSurcharge = settings?.late_night_surcharge_percent ?? 15

  // Fetch artist schedule to detect late night
  let isLateNight = false
  if (artist_id) {
    const { data: schedule } = await supabase
      .from('artist_schedules')
      .select('late_cutoff_time')
      .eq('artist_id', artist_id)
      .eq('schedule_date', booking_date)
      .single()

    if (schedule?.late_cutoff_time) {
      isLateNight = timeToMins(start_time) >= timeToMins(schedule.late_cutoff_time)
    }
  }

  // Calculate end time
  const bufferMins = artist?.buffer_minutes ?? 0
  const startMins  = timeToMins(start_time)
  const endMins    = startMins + service.duration_minutes + bufferMins
  const end_time   = minsToTime(endMins)

  // Calculate pricing
  const servicePrice   = Number(service.base_price ?? 0)
  const houseTravelFee = location_type === 'house_call' ? Number(travelFee) : 0
  const lateNightFee   = isLateNight ? Math.round(servicePrice * (lateNightSurcharge / 100) * 100) / 100 : 0
  const total          = servicePrice + houseTravelFee + lateNightFee
  const depositAmount  = Math.round(total * (depositPercent / 100) * 100) / 100

  // Manual bookings go straight to confirmed if deposit collected
  // or payment_submitted if sending payment link
  const status = deposit_collection === 'collected_offline' ? 'confirmed' : 'pending_payment'

  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      customer_name:        customer_name.trim(),
      customer_phone:       customer_phone.trim(),
      customer_email:       customer_email?.trim() ?? null,
      service_id,
      artist_id:            artist_id ?? null,
      booking_date,
      start_time,
      end_time,
      location_type,
      house_call_address:   location_type === 'house_call' ? house_call_address.trim() : null,
      service_price:        servicePrice,
      travel_fee:           houseTravelFee,
      late_night_surcharge: lateNightFee,
      deposit_amount:       depositAmount,
      is_late_night:        isLateNight,
      status,
      booking_source:       booking_source ?? 'whatsapp',
      deposit_collection:   deposit_collection ?? 'collected_offline',
      deposit_paid_at:      deposit_collection === 'collected_offline' ? new Date().toISOString() : null,
      admin_notes:          admin_notes?.trim() ?? null,
      expires_at:           new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single()

  if (insertError || !booking) {
    console.error('[manual booking] insert error:', insertError)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  // If payment link — send WhatsApp/email to customer (future enhancement)
  // For now just return the booking with the pay URL
  const payUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://luxenailsparlour.vercel.app'}/booking/cancel?id=${booking.id}`

  return NextResponse.json({
    success:        true,
    booking,
    deposit_amount: depositAmount,
    pay_url:        deposit_collection === 'payment_link'
      ? `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://luxenailsparlour.vercel.app'}/pay/${booking.id}`
      : null,
    message: deposit_collection === 'collected_offline'
      ? 'Booking confirmed — deposit marked as collected.'
      : 'Booking created — send the customer their payment link.',
  })
}