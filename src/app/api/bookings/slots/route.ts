// src/app/api/bookings/slots/route.ts
// GET /api/bookings/slots?artistId=&date=&serviceId=
//
// artistId can be a specific artist ID or "any" (No Preference)
// When "any": returns slots where AT LEAST ONE artist is free
// The actual artist is assigned by the owner at confirmation time

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isPastDate, isToday, salonNowMinutes } from '@/lib/salon-time'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type SlotStatus =
  | 'available'            // normal bookable slot
  | 'taken'                // already booked (all artists busy)
  | 'late_night_request'   // past cutoff — request only
  | 'unavailable'          // outside working hours

export interface TimeSlot {
  start_time:   string
  end_time:     string
  display_time: string
  status:       SlotStatus
  is_late_night: boolean
  available_artist_ids?: number[]  // for "any" mode — which artists are free
}

export interface SlotsResponse {
  slots:               TimeSlot[]
  artist_name:         string
  service_name:        string
  service_duration:    number
  date:                string
  is_artist_available: boolean
  message?:            string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeToMins(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function formatDisplayTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hh = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hh}:${String(m).padStart(2, '0')} ${suffix}`
}

function overlaps(
  slotStart: number, slotEnd: number,
  bookStart: number, bookEnd: number
): boolean {
  return slotStart < bookEnd && slotEnd > bookStart
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const artistIdParam = searchParams.get('artistId')
  const date          = searchParams.get('date')
  const serviceId     = searchParams.get('serviceId')

  if (!artistIdParam || !date || !serviceId) {
    return NextResponse.json(
      { error: 'artistId, date, and serviceId are required' },
      { status: 400 }
    )
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date must be YYYY-MM-DD' }, { status: 400 })
  }

  if (isPastDate(date)) {
    return NextResponse.json({ error: 'Cannot book slots in the past' }, { status: 400 })
  }

  // On the current day, every slot that has already started is unbookable.
  // Previously only past *dates* were rejected, so at 5pm you could still
  // book this morning's 9:30 slot.
  const earliestStartMins = isToday(date) ? salonNowMinutes() : -1

  const isAnyArtist = artistIdParam === 'any'

  try {
    // ── Fetch service ──────────────────────────────────────────────────────────
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, name, duration_minutes')
      .eq('id', serviceId)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // ── Fetch artist(s) ────────────────────────────────────────────────────────
    let artists: { id: number; name: string; buffer_minutes: number }[] = []

    if (isAnyArtist) {
      const { data, error } = await supabase
        .from('artists')
        .select('id, name, buffer_minutes')
      if (error || !data?.length) {
        return NextResponse.json({ error: 'No artists found' }, { status: 404 })
      }
      artists = data
    } else {
      const { data, error } = await supabase
        .from('artists')
        .select('id, name, buffer_minutes')
        .eq('id', Number(artistIdParam))
        .single()
      if (error || !data) {
        return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
      }
      artists = [data]
    }

    const artistIds = artists.map(a => a.id)

    // ── Fetch schedules for all artists on this date ───────────────────────────
    const { data: schedules } = await supabase
      .from('artist_schedules')
      .select('*')
      .in('artist_id', artistIds)
      .eq('schedule_date', date)

    // ── Fetch existing bookings for all artists on this date ───────────────────
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('artist_id, start_time, end_time')
      .in('artist_id', artistIds)
      .eq('booking_date', date)
      .not('status', 'in', '("declined","cancelled","expired")')

    // ── Specific artist mode ───────────────────────────────────────────────────
    if (!isAnyArtist) {
      const artist   = artists[0]
      const schedule = schedules?.find(s => s.artist_id === artist.id)

      if (schedule?.is_blocked) {
        return NextResponse.json({
          slots: [], artist_name: artist.name,
          service_name: service.name, service_duration: service.duration_minutes,
          date, is_artist_available: false,
          message: 'Artist is not available on this date',
        } satisfies SlotsResponse)
      }

      const dayStartMins   = timeToMins(schedule?.start_time      ?? '09:30')
      const dayEndMins     = timeToMins(schedule?.end_time        ?? '19:00')
      const lateCutoffMins = schedule?.late_cutoff_time ? timeToMins(schedule.late_cutoff_time) : null
      const lateEndMins    = schedule?.late_end_time    ? timeToMins(schedule.late_end_time)    : null
      const windowEnd      = lateEndMins ?? dayEndMins
      const slotStep       = service.duration_minutes + (artist.buffer_minutes ?? 0)

      const bookedRanges = (existingBookings ?? [])
        .filter(b => b.artist_id === artist.id)
        .map(b => ({ start: timeToMins(b.start_time), end: timeToMins(b.end_time) }))

      const slots: TimeSlot[] = []
      let cursor = dayStartMins

      while (cursor + service.duration_minutes <= windowEnd) {
        const slotStart  = cursor
        const slotEnd    = cursor + slotStep
        const startStr   = minsToTime(slotStart)
        const isLateNight = lateCutoffMins !== null && slotStart >= lateCutoffMins
        const isTaken     = bookedRanges.some(b => overlaps(slotStart, slotEnd, b.start, b.end))

        if (slotStart <= earliestStartMins) { cursor += slotStep; continue }

        slots.push({
          start_time:   startStr,
          end_time:     minsToTime(slotEnd),
          display_time: formatDisplayTime(startStr),
          status:       isTaken ? 'taken' : isLateNight ? 'late_night_request' : 'available',
          is_late_night: isLateNight,
        })
        cursor += slotStep
      }

      return NextResponse.json({
        slots, artist_name: artist.name,
        service_name: service.name, service_duration: service.duration_minutes,
        date, is_artist_available: true,
      } satisfies SlotsResponse)
    }

    // ── "Any artist" mode ──────────────────────────────────────────────────────
    // Build a map: slotStartTime → { availableArtistIds, isLateNight, endTime }
    const slotMap = new Map<string, {
      availableArtistIds: number[]
      isLateNight: boolean
      endTime: string
    }>()

    for (const artist of artists) {
      const schedule = schedules?.find(s => s.artist_id === artist.id)
      if (schedule?.is_blocked) continue

      const dayStartMins   = timeToMins(schedule?.start_time      ?? '09:30')
      const dayEndMins     = timeToMins(schedule?.end_time        ?? '19:00')
      const lateCutoffMins = schedule?.late_cutoff_time ? timeToMins(schedule.late_cutoff_time) : null
      const lateEndMins    = schedule?.late_end_time    ? timeToMins(schedule.late_end_time)    : null
      const windowEnd      = lateEndMins ?? dayEndMins
      const slotStep       = service.duration_minutes + (artist.buffer_minutes ?? 0)

      const bookedRanges = (existingBookings ?? [])
        .filter(b => b.artist_id === artist.id)
        .map(b => ({ start: timeToMins(b.start_time), end: timeToMins(b.end_time) }))

      let cursor = dayStartMins
      while (cursor + service.duration_minutes <= windowEnd) {
        const slotStart  = cursor
        const slotEnd    = cursor + slotStep
        const startStr   = minsToTime(slotStart)
        const isLateNight = lateCutoffMins !== null && slotStart >= lateCutoffMins
        const isTaken     = bookedRanges.some(b => overlaps(slotStart, slotEnd, b.start, b.end))

        if (!isTaken && slotStart > earliestStartMins) {
          const existing = slotMap.get(startStr)
          if (existing) {
            existing.availableArtistIds.push(artist.id)
          } else {
            slotMap.set(startStr, {
              availableArtistIds: [artist.id],
              isLateNight,
              endTime: minsToTime(slotEnd),
            })
          }
        }
        cursor += slotStep
      }
    }

    // Sort slots by time and build response
    const slots: TimeSlot[] = Array.from(slotMap.entries())
      .sort((a, b) => timeToMins(a[0]) - timeToMins(b[0]))
      .map(([startStr, data]) => ({
        start_time:           startStr,
        end_time:             data.endTime,
        display_time:         formatDisplayTime(startStr),
        status:               data.isLateNight ? 'late_night_request' : 'available',
        is_late_night:        data.isLateNight,
        available_artist_ids: data.availableArtistIds,
      }))

    return NextResponse.json({
      slots,
      artist_name:         'Any available artist',
      service_name:        service.name,
      service_duration:    service.duration_minutes,
      date,
      is_artist_available: true,
    } satisfies SlotsResponse)

  } catch (err) {
    console.error('[slots] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}