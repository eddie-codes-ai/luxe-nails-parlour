// src/app/api/bookings/route.ts
import { createClient } from '@supabase/supabase-js'
import { sendEmail, OWNER_EMAIL } from '@/lib/resend'
import { ownerNewBookingEmail, NewBookingEmailData } from '@/lib/email-templates'
import { NextRequest, NextResponse } from 'next/server'
import { isPastDate, isToday, salonNowMinutes } from '@/lib/salon-time'
import { activeHolds } from '@/lib/booking-holds'
import { getDefaultHours, isLateStart, resolveHours, startBounds, type WorkingHours } from '@/lib/working-hours'
import { checkStaffing } from '@/lib/staffing'

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
  /** Names of chosen add-ons. Prices are resolved server-side, never trusted from the client. */
  add_ons?:            string[]
}

interface AddOn {
  name:  string
  price: number
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

interface ArtistRow {
  id: number
  name: string
  buffer_minutes: number
  mobile_available?: boolean | null
}

interface ScheduleRow {
  artist_id: number
  is_blocked?: boolean | null
  start_time?: string | null
  end_time?: string | null
  late_cutoff_time?: string | null
  late_end_time?: string | null
}

interface Candidate {
  artist: ArtistRow
  isLateNight: boolean
  endMins: number
}

/**
 * Whether an artist can start this service at `startMins` on their schedule.
 * Returns null when they are blocked or the time falls outside their hours.
 */
function evaluateCandidate(
  artist: ArtistRow,
  schedule: ScheduleRow | null,
  startMins: number,
  durationMins: number,
  defaultHours: WorkingHours
): Candidate | null {
  if (schedule?.is_blocked) return null

  const bounds = startBounds(resolveHours(schedule, defaultHours), durationMins)

  if (startMins < bounds.minStart || startMins > bounds.maxStart) return null

  return {
    artist,
    isLateNight: isLateStart(startMins, bounds),
    endMins: startMins + durationMins + (artist.buffer_minutes ?? 0),
  }
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
    location_type, house_call_address, add_ons,
  } = body

  if (!customer_name?.trim()) return NextResponse.json({ error: 'Customer name is required' }, { status: 400 })
  if (!customer_phone?.trim()) return NextResponse.json({ error: 'Customer phone is required' }, { status: 400 })
  if (!service_id || !booking_date || !start_time) return NextResponse.json({ error: 'service_id, booking_date, and start_time are required' }, { status: 400 })
  if (!['in_shop', 'house_call'].includes(location_type)) return NextResponse.json({ error: 'location_type must be in_shop or house_call' }, { status: 400 })
  if (location_type === 'house_call' && !house_call_address?.trim()) return NextResponse.json({ error: 'house_call_address is required for house calls' }, { status: 400 })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(booking_date)) return NextResponse.json({ error: 'booking_date must be YYYY-MM-DD' }, { status: 400 })
  if (!/^\d{2}:\d{2}$/.test(start_time)) return NextResponse.json({ error: 'start_time must be HH:MM' }, { status: 400 })

  if (isPastDate(booking_date)) return NextResponse.json({ error: 'Cannot book slots in the past' }, { status: 400 })
  if (isToday(booking_date) && timeToMins(start_time) <= salonNowMinutes()) {
    return NextResponse.json({ error: 'That time has already passed today. Please choose a later slot.' }, { status: 400 })
  }

  try {
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, name, duration_minutes, base_price, house_call_available, add_ons')
      .eq('id', service_id)
      .single()

    if (serviceError || !service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    if (location_type === 'house_call' && !service.house_call_available) return NextResponse.json({ error: 'This service is not available as a house call' }, { status: 400 })

    // Match requested names against the service's own add-on list. A name that
    // is not offered is rejected rather than silently dropped, so the customer
    // is never charged a different total from the one they were shown.
    const offered: AddOn[] = Array.isArray(service.add_ons) ? service.add_ons : []
    const requested = Array.isArray(add_ons) ? add_ons : []
    const selectedAddOns: AddOn[] = []

    for (const name of requested) {
      const match = offered.find(a => a?.name === name)
      if (!match) {
        return NextResponse.json(
          { error: `"${name}" is not an available add-on for this service.` },
          { status: 400 }
        )
      }
      selectedAddOns.push({ name: match.name, price: Number(match.price ?? 0) })
    }

    const addOnsTotal        = Math.round(selectedAddOns.reduce((sum, a) => sum + a.price, 0) * 100) / 100

    const isAnyArtist = !artist_id

    // Pool of artists who could serve this booking. When the customer picks
    // "any", capacity is bounded by how many artists are actually free — the
    // previous code skipped every availability check for unassigned bookings,
    // so a single slot could be booked without limit.
    let artistPool: ArtistRow[]
    const isHouseCall = location_type === 'house_call'

    if (artist_id) {
      const { data, error: artistError } = await supabase
        .from('artists').select('id, name, buffer_minutes, mobile_available').eq('id', artist_id).single()
      if (artistError || !data) return NextResponse.json({ error: 'Artist not found' }, { status: 404 })

      // Availability used to be gated on the service alone, so a
      // storefront-only artist could be booked for a house call.
      if (isHouseCall && !data.mobile_available) {
        return NextResponse.json(
          { error: `${data.name} only works at the studio and cannot take house calls. Please choose another artist or book in-studio.` },
          { status: 400 }
        )
      }
      artistPool = [data]
    } else {
      let query = supabase.from('artists').select('id, name, buffer_minutes, mobile_available')
      if (isHouseCall) query = query.eq('mobile_available', true)

      const { data, error: artistsError } = await query
      if (artistsError || !data?.length) {
        return NextResponse.json({
          error: isHouseCall
            ? 'No artists are available for house calls at the moment. Please book in-studio.'
            : 'No artists available',
        }, { status: 503 })
      }
      artistPool = data
    }
    const artist = artist_id ? artistPool[0] : null

    const { data: settings } = await supabase.from('booking_settings').select('*').eq('id', 1).single()
    const depositPercent     = settings?.deposit_percent ?? 30
    const travelFee          = settings?.travel_fee ?? 0
    const lateNightSurcharge = settings?.late_night_surcharge_percent ?? 15
    const slotHoldMinutes    = settings?.slot_hold_minutes ?? 60

    const startMins = timeToMins(start_time)

    const { data: schedules } = await supabase
      .from('artist_schedules').select('*')
      .in('artist_id', artistPool.map(a => a.id))
      .eq('schedule_date', booking_date)

    // Every artist whose working hours cover the requested start time.
    const defaultHours = await getDefaultHours(supabase)

    const candidates = artistPool
      .map(a => evaluateCandidate(a, schedules?.find(s => s.artist_id === a.id) ?? null, startMins, service.duration_minutes, defaultHours))
      .filter((c): c is Candidate => c !== null)

    if (!candidates.length) {
      if (!isAnyArtist) {
        const schedule = schedules?.find(s => s.artist_id === artist!.id)
        if (schedule?.is_blocked) {
          return NextResponse.json({ error: 'Artist is not available on this date' }, { status: 409 })
        }
        return NextResponse.json({ error: "Selected time is outside the artist's working hours" }, { status: 400 })
      }
      return NextResponse.json({
        error: isHouseCall
          ? 'No house-call artist is working at that time. Please choose another slot or book in-studio.'
          : 'No artist is working at that time. Please choose another slot.',
      }, { status: 400 })
    }

    // All non-cancelled bookings on the date, so we can check both assigned
    // conflicts and how many unassigned bookings already claim this window.
    const { data: dayBookings } = await supabase
      .from('bookings').select('artist_id, start_time, end_time, status, expires_at, location_type')
      .eq('booking_date', booking_date)
      .not('status', 'in', '("declined","cancelled","expired")')

    const bookingsOnDay = activeHolds(dayBookings)

    const freeCandidates = candidates.filter(c =>
      !bookingsOnDay.some(b =>
        b.artist_id === c.artist.id &&
        overlaps(startMins, c.endMins, timeToMins(b.start_time), timeToMins(b.end_time))
      )
    )

    if (!freeCandidates.length) {
      return NextResponse.json({ error: 'This slot has just been taken. Please choose another time.' }, { status: 409 })
    }

    if (isAnyArtist) {
      // Unassigned bookings will each need their own artist at confirmation
      // time, so they consume capacity even though no artist_id is set yet.
      const unassignedHolding = bookingsOnDay.filter(b =>
        b.artist_id === null &&
        overlaps(startMins, Math.max(...freeCandidates.map(c => c.endMins)), timeToMins(b.start_time), timeToMins(b.end_time))
      ).length

      if (freeCandidates.length <= unassignedHolding) {
        return NextResponse.json({ error: 'This slot has just been taken. Please choose another time.' }, { status: 409 })
      }
    }

    // docs/04 §3 — a house call must not leave the storefront unstaffed.
    if (isHouseCall) {
      const { data: roster } = await supabase.from('artists').select('id')
      const { data: rosterSchedules } = await supabase
        .from('artist_schedules').select('*')
        .in('artist_id', (roster ?? []).map(a => a.id))
        .eq('schedule_date', booking_date)

      const staffing = checkStaffing({
        allArtists: roster ?? [],
        schedules: rosterSchedules,
        defaultHours,
        dayBookings: bookingsOnDay,
        startMins,
        endMins: Math.max(...freeCandidates.map(c => c.endMins)),
        durationMins: service.duration_minutes,
      })

      if (!staffing.canAddHouseCall) {
        return NextResponse.json({
          error: 'We cannot send an artist out at that time — someone has to stay at the studio. Please choose another slot or book in-studio.',
        }, { status: 409 })
      }
    }

    // Prefer an artist who can take this within normal hours; only treat the
    // booking as a late-night request when nobody free can serve it normally.
    const chosen = freeCandidates.find(c => !c.isLateNight) ?? freeCandidates[0]
    const isLateNight = chosen.isLateNight
    // Reserve against the longest buffer in the free pool so an unassigned
    // booking never under-reserves whichever artist ends up taking it.
    const endMins  = Math.max(...freeCandidates.map(c => c.endMins))
    const end_time = minsToTime(endMins)

    const servicePrice       = Number(service.base_price ?? 0)
    const houseTravelFee     = location_type === 'house_call' ? Number(travelFee) : 0
    // The surcharge is a premium on the whole job, so it applies to the service
    // plus any add-ons - the same base the deposit is calculated from. Travel
    // fee is excluded: it covers distance, not the hour of day.
    const workSubtotal       = servicePrice + addOnsTotal
    const lateNightFee       = isLateNight ? Math.round(workSubtotal * (lateNightSurcharge / 100) * 100) / 100 : 0
    const totalBeforeDeposit = workSubtotal + houseTravelFee + lateNightFee
    const depositAmount      = Math.round(totalBeforeDeposit * (depositPercent / 100) * 100) / 100
    const initialStatus      = isLateNight ? 'pending_approval' : 'pending_payment'
    const expiryMinutes      = isLateNight ? 60 * 24 : slotHoldMinutes
    const expiresAt          = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString()

    const baseRow = {
      customer_name: customer_name.trim(), customer_phone: customer_phone.trim(),
      customer_email: customer_email?.trim() ?? null, service_id, artist_id, booking_date,
      start_time, end_time, location_type,
      house_call_address: location_type === 'house_call' ? house_call_address!.trim() : null,
      service_price: servicePrice, travel_fee: houseTravelFee, late_night_surcharge: lateNightFee,
      deposit_amount: depositAmount, is_late_night: isLateNight, status: initialStatus,
      booking_source: 'website', expires_at: expiresAt,
    }

    let { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({ ...baseRow, add_ons: selectedAddOns, add_ons_total: addOnsTotal })
      .select().single()

    // add_ons/add_ons_total are new columns. Until the migration is applied,
    // still take the booking rather than failing the customer's checkout - the
    // deposit already reflects the add-ons either way.
    if (insertError && (insertError.code === 'PGRST204' || insertError.code === '42703')) {
      console.warn('[bookings] add_ons columns missing - saving without them. Run the migration.')
      const retry = await supabase.from('bookings').insert(baseRow).select().single()
      booking = retry.data
      insertError = retry.error
    }

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
      houseCallAddress: house_call_address?.trim(), servicePrice,
      addOns: selectedAddOns, addOnsTotal, travelFee: houseTravelFee,
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
      add_ons: selectedAddOns, add_ons_total: addOnsTotal,
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