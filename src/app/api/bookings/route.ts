// src/app/api/bookings/route.ts
import { createClient } from '@supabase/supabase-js'
import { sendEmail, OWNER_EMAIL } from '@/lib/resend'
import { ownerNewBookingEmail, NewBookingEmailData } from '@/lib/email-templates'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CreateBookingBody {
  customer_name:       string
  customer_phone:      string
  customer_email?:     string
  service_id:          string
  artist_id:           number
  booking_date:        string
  start_time:          string
  location_type:       'in_shop' | 'house_call'
  house_call_address?: string
}

function timeToMins(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function overlaps(slotStart: number, slotEnd: number, bookStart: number, bookEnd: number): boolean {
  return slotStart < bookEnd && slotEnd > bookStart
}

// ── GET /api/bookings?id=xxx — fetch single booking for cancel page ──────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, customer_name, customer_phone, service_price, deposit_amount, booking_date, start_time, status, location_type, is_late_night, services ( name ), artists ( name )')
    .eq('id', id)
    .single()

  if (error || !booking) {
    console.error('[bookings GET] supabase error:', error, 'id:', id)
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  return NextResponse.json({ booking })
}

// ── POST /api/bookings — create new booking ──────────────────────────────────
export async function POST(req: NextRequest) {
  let body: CreateBookingBody

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    customer_name, customer_phone, customer_email,
    service_id, artist_id, booking_date, start_time,
    location_type, house_call_address,
  } = body

  if (!customer_name?.trim()) return NextResponse.json({ error: 'Customer name is required' }, { status: 400 })
  if (!customer_phone?.trim()) return NextResponse.json({ error: 'Customer phone is required' }, { status: 400 })
  if (!service_id || !booking_date || !start_time) return NextResponse.json({ error: 'service_id, booking_date, and start_time are required' }, { status: 400 })
  if (!['in_shop', 'house_call'].includes(location_type)) return NextResponse.json({ error: 'location_type must be in_shop or house_call' }, { status: 400 })
  if (location_type === 'house_call' && !house_call_address?.trim()) return NextResponse.json({ error: 'house_call_address is required for house calls' }, { status: 400 })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(booking_date)) return NextResponse.json({ error: 'booking_date must be YYYY-MM-DD' }, { status: 400 })
  if (!/^\d{2}:\d{2}$/.test(start_time)) return NextResponse.json({ error: 'start_time must be HH:MM' }, { status: 400 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (new Date(booking_date) < today) return NextResponse.json({ error: 'Cannot book slots in the past' }, { status: 400 })

  try {
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, name, duration_minutes, base_price, house_call_available')
      .eq('id', service_id)
      .single()

    if (serviceError || !service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    if (location_type === 'house_call' && !service.house_call_available) return NextResponse.json({ error: 'This service is not available as a house call' }, { status: 400 })

    let artist: { id: number; name: string; buffer_minutes: number } | null = null
    if (artist_id) {
      const { data, error: artistError } = await supabase
        .from('artists').select('id, name, buffer_minutes').eq('id', artist_id).single()
      if (artistError || !data) return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
      artist = data
    }

    const { data: settings } = await supabase.from('booking_settings').select('*').eq('id', 1).single()
    const depositPercent     = settings?.deposit_percent ?? 30
    const travelFee          = settings?.travel_fee ?? 0
    const lateNightSurcharge = settings?.late_night_surcharge_percent ?? 15
    const slotHoldMinutes    = settings?.slot_hold_minutes ?? 60

    let schedule: any = null
    if (artist_id) {
      const { data: scheduleData } = await supabase
        .from('artist_schedules').select('*').eq('artist_id', artist_id).eq('schedule_date', booking_date).single()
      schedule = scheduleData
      if (schedule?.is_blocked) return NextResponse.json({ error: 'Artist is not available on this date' }, { status: 409 })
    }

    const startMins      = timeToMins(start_time)
    const dayEndMins     = timeToMins(schedule?.end_time ?? '19:00')
    const lateCutoffMins = schedule?.late_cutoff_time ? timeToMins(schedule.late_cutoff_time) : null
    const lateEndMins    = schedule?.late_end_time    ? timeToMins(schedule.late_end_time)    : null
    const isLateNight    = lateCutoffMins !== null && startMins >= lateCutoffMins

    const withinNormal = startMins >= timeToMins(schedule?.start_time ?? '09:30') && startMins < dayEndMins
    const withinLate   = isLateNight && lateEndMins !== null && startMins < lateEndMins

    if (!withinNormal && !withinLate) return NextResponse.json({ error: "Selected time is outside the artist's working hours" }, { status: 400 })

    const bufferMins = artist?.buffer_minutes ?? 0
    const endMins    = startMins + service.duration_minutes + bufferMins
    const end_time   = minsToTime(endMins)

    if (artist_id) {
      const { data: conflictBookings } = await supabase
        .from('bookings').select('start_time, end_time')
        .eq('artist_id', artist_id).eq('booking_date', booking_date)
        .not('status', 'in', '("declined","cancelled","expired")')

      const slotTaken = (conflictBookings ?? []).some(b =>
        overlaps(startMins, endMins, timeToMins(b.start_time), timeToMins(b.end_time))
      )
      if (slotTaken) return NextResponse.json({ error: 'This slot has just been taken. Please choose another time.' }, { status: 409 })
    }

    const servicePrice       = Number(service.base_price ?? 0)
    const houseTravelFee     = location_type === 'house_call' ? Number(travelFee) : 0
    const lateNightFee       = isLateNight ? Math.round(servicePrice * (lateNightSurcharge / 100) * 100) / 100 : 0
    const totalBeforeDeposit = servicePrice + houseTravelFee + lateNightFee
    const depositAmount      = Math.round(totalBeforeDeposit * (depositPercent / 100) * 100) / 100
    const initialStatus      = isLateNight ? 'pending_approval' : 'pending_payment'
    const expiryMinutes      = isLateNight ? 60 * 24 : slotHoldMinutes
    const expiresAt          = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString()

    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        customer_name: customer_name.trim(), customer_phone: customer_phone.trim(),
        customer_email: customer_email?.trim() ?? null, service_id, artist_id, booking_date,
        start_time, end_time, location_type,
        house_call_address: location_type === 'house_call' ? house_call_address!.trim() : null,
        service_price: servicePrice, travel_fee: houseTravelFee, late_night_surcharge: lateNightFee,
        deposit_amount: depositAmount, is_late_night: isLateNight, status: initialStatus,
        booking_source: 'website', expires_at: expiresAt,
      })
      .select().single()

    if (insertError || !booking) {
      console.error('[bookings] insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create booking. Please try again.' }, { status: 500 })
    }

    const formattedDate = new Date(booking_date + 'T00:00:00').toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const formattedTime = (() => {
      const [h, m] = start_time.split(':').map(Number)
      const suffix = h >= 12 ? 'PM' : 'AM'
      const hh = h > 12 ? h - 12 : h === 0 ? 12 : h
      return `${hh}:${String(m).padStart(2,'0')} ${suffix}`
    })()

    const emailData: NewBookingEmailData = {
      customerName: customer_name.trim(), customerPhone: customer_phone.trim(),
      customerEmail: customer_email?.trim(), serviceName: service.name,
      artistName: artist?.name ?? 'Owner assigns', bookingDate: formattedDate,
      startTime: formattedTime, locationType: location_type,
      houseCallAddress: house_call_address?.trim(), servicePrice, travelFee: houseTravelFee,
      lateNightFee, depositAmount, bookingId: booking.id, isLateNight, bookingSource: 'website',
    }

    sendEmail({
      to: OWNER_EMAIL,
      subject: isLateNight ? `🌙 Late Night Request — ${customer_name} (${service.name})` : `✦ New Booking — ${customer_name} (${service.name})`,
      html: ownerNewBookingEmail(emailData),
    }).catch(err => console.error('[bookings] owner email failed:', err))

    return NextResponse.json({
      booking, is_late_night: isLateNight, deposit_amount: depositAmount,
      service_price: servicePrice, travel_fee: houseTravelFee, late_night_fee: lateNightFee,
      expires_at: expiresAt,
      message: isLateNight
        ? 'Your late-night request has been submitted. The artist will confirm your slot before payment is requested.'
        : 'Slot reserved for 1 hour. Please complete your deposit to confirm your booking.',
    }, { status: 201 })

  } catch (err) {
    console.error('[bookings] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}