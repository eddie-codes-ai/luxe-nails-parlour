// src/app/api/bookings/[id]/select/route.ts
//
// GET   - services that fit the slot the owner reserved, plus their add-ons
// PATCH - customer commits their service + add-on choice; pricing is recomputed
//
// Backs the payment link the owner sends after taking a booking over WhatsApp.
// The owner fixes the artist, date and time; the customer chooses what they
// actually want. Only services that fit the reserved window are offered, so a
// customer cannot pick something that would break the schedule.

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { holdsSlot } from '@/lib/booking-holds'
import { getDefaultHours, resolveHours, timeToMins as toMins } from '@/lib/working-hours'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!
)

interface AddOn { name: string; price: number }

const OPEN_STATUSES = ['pending_payment', 'pending_approval']
const EXCLUDED_STATUSES = '("declined","cancelled","expired")'

function timeToMins(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  return `${String(h).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
}

/** Bookings a customer may still change: taken by the owner, not yet paid. */
function isSelectable(b: { status: string; booking_source: string | null; expires_at: string | null }) {
  if (b.booking_source === 'website') return false
  if (!OPEN_STATUSES.includes(b.status)) return false
  return holdsSlot(b)
}

/**
 * Minutes available from the booking start time before the artist's day ends
 * or their next appointment begins. This is the ceiling on service duration.
 */
async function availableMinutes(booking: {
  id: string; artist_id: number | null; booking_date: string; start_time: string
}): Promise<{ windowMins: number; bufferMins: number }> {
  const startMins = timeToMins(booking.start_time)

  const defaults = await getDefaultHours(supabase)

  let bufferMins = 0
  let endOfDay = toMins(defaults.lateEnd ?? defaults.end)

  if (booking.artist_id) {
    const [{ data: artist }, { data: schedule }] = await Promise.all([
      supabase.from('artists').select('buffer_minutes').eq('id', booking.artist_id).single(),
      supabase.from('artist_schedules').select('start_time, end_time, late_cutoff_time, late_end_time')
        .eq('artist_id', booking.artist_id).eq('schedule_date', booking.booking_date).maybeSingle(),
    ])
    bufferMins = artist?.buffer_minutes ?? 0
    const hours = resolveHours(schedule, defaults)
    endOfDay = toMins(hours.lateEnd ?? hours.end)
  }

  // The artist's next appointment caps the window.
  let nextStart = endOfDay
  if (booking.artist_id) {
    const { data: others } = await supabase
      .from('bookings')
      .select('id, start_time, status, expires_at')
      .eq('artist_id', booking.artist_id)
      .eq('booking_date', booking.booking_date)
      .neq('id', booking.id)
      .not('status', 'in', EXCLUDED_STATUSES)

    for (const other of others ?? []) {
      if (!holdsSlot(other)) continue
      const otherStart = timeToMins(other.start_time)
      if (otherStart > startMins && otherStart < nextStart) nextStart = otherStart
    }
  }

  return { windowMins: Math.max(0, nextStart - startMins - bufferMins), bufferMins }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, booking_date, start_time, location_type, status, booking_source, expires_at, service_id, artist_id')
    .eq('id', id)
    .single()

  if (error || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (!isSelectable(booking)) return NextResponse.json({ selectable: false })

  const { windowMins } = await availableMinutes(booking)

  const { data: services } = await supabase
    .from('services')
    .select('id, name, description, base_price, duration_minutes, house_call_available, add_ons')
    .eq('is_active', true)
    .order('base_price')

  const fits = (services ?? []).filter(s =>
    Number(s.duration_minutes) <= windowMins &&
    (booking.location_type !== 'house_call' || s.house_call_available)
  )

  return NextResponse.json({
    selectable: true,
    current_service_id: booking.service_id,
    window_minutes: windowMins,
    services: fits,
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const { service_id, add_ons } = body as { service_id?: string; add_ons?: string[] }

  if (!service_id) return NextResponse.json({ error: 'Please choose a service.' }, { status: 400 })

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, artist_id, booking_date, start_time, location_type, status, booking_source, expires_at, is_late_night')
    .eq('id', id)
    .single()

  if (error || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  if (!isSelectable(booking)) {
    return NextResponse.json(
      { error: 'This booking can no longer be changed. Please contact us on WhatsApp.' },
      { status: 400 }
    )
  }

  const { data: service } = await supabase
    .from('services')
    .select('id, name, base_price, duration_minutes, house_call_available, add_ons')
    .eq('id', service_id)
    .eq('is_active', true)
    .single()

  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

  if (booking.location_type === 'house_call' && !service.house_call_available) {
    return NextResponse.json({ error: 'That service is not available as a house call.' }, { status: 400 })
  }

  // Re-check the window at commit time: another booking may have landed since
  // the page was loaded.
  const { windowMins, bufferMins } = await availableMinutes(booking)
  if (Number(service.duration_minutes) > windowMins) {
    return NextResponse.json(
      { error: `${service.name} needs ${service.duration_minutes} minutes but only ${windowMins} are free at your time. Please pick a shorter service, or message us to move your appointment.` },
      { status: 409 }
    )
  }

  // Prices come from the service catalogue, never from the client.
  const offered: AddOn[] = Array.isArray(service.add_ons) ? service.add_ons : []
  const selectedAddOns: AddOn[] = []
  for (const name of Array.isArray(add_ons) ? add_ons : []) {
    const match = offered.find(a => a?.name === name)
    if (!match) {
      return NextResponse.json({ error: `"${name}" is not an available add-on for this service.` }, { status: 400 })
    }
    selectedAddOns.push({ name: match.name, price: Number(match.price ?? 0) })
  }

  const { data: settings } = await supabase.from('booking_settings').select('*').eq('id', 1).single()
  const depositPercent     = settings?.deposit_percent ?? 30
  const travelFee          = settings?.travel_fee ?? 0
  const lateNightSurcharge = settings?.late_night_surcharge_percent ?? 15

  const addOnsTotal    = Math.round(selectedAddOns.reduce((n, a) => n + a.price, 0) * 100) / 100
  const servicePrice   = Number(service.base_price ?? 0)
  const workSubtotal   = servicePrice + addOnsTotal
  const houseTravelFee = booking.location_type === 'house_call' ? Number(travelFee) : 0
  const lateNightFee   = booking.is_late_night
    ? Math.round(workSubtotal * (lateNightSurcharge / 100) * 100) / 100
    : 0
  const total         = workSubtotal + houseTravelFee + lateNightFee
  const depositAmount = Math.round(total * (depositPercent / 100) * 100) / 100

  const end_time = minsToTime(timeToMins(booking.start_time) + Number(service.duration_minutes) + bufferMins)

  const baseUpdate = {
    service_id:           service.id,
    end_time,
    service_price:        servicePrice,
    travel_fee:           houseTravelFee,
    late_night_surcharge: lateNightFee,
    deposit_amount:       depositAmount,
  }

  let { error: updateError } = await supabase
    .from('bookings')
    .update({ ...baseUpdate, add_ons: selectedAddOns, add_ons_total: addOnsTotal })
    .eq('id', id)

  // add_ons columns are new; keep working until the migration is applied.
  if (updateError && (updateError.code === 'PGRST204' || updateError.code === '42703')) {
    console.warn('[select] add_ons columns missing - saving without them. Run the migration.')
    updateError = (await supabase.from('bookings').update(baseUpdate).eq('id', id)).error
  }

  if (updateError) {
    console.error('[select] update error:', updateError)
    return NextResponse.json({ error: 'Could not save your choice. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    service_name:   service.name,
    service_price:  servicePrice,
    add_ons:        selectedAddOns,
    add_ons_total:  addOnsTotal,
    travel_fee:     houseTravelFee,
    late_night_fee: lateNightFee,
    total,
    deposit_amount: depositAmount,
  })
}
