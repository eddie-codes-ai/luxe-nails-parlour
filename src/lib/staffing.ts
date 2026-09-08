// src/lib/staffing.ts
//
// docs/04 §3 — at least one technician must be at the storefront at all times.
//
// The spec states the rule as "total staff − mobile bookings ≥ 1". Taken
// literally that can never bind here: six artists are on the roster and only
// four can travel, so two always remain. Counting artists who are actually
// WORKING that day is what protects the studio — days off shrink the pool, and
// two artists working with one already out on a house call means a second
// house call empties the shop.

import { resolveHours, startBounds, timeToMins, type ScheduleOverride, type WorkingHours } from './working-hours'
import { holdsSlot, type SlotHold } from './booking-holds'

/** Fallback when booking_settings has no value (or the column is absent). */
export const DEFAULT_MIN_STOREFRONT_STAFF = 1

/**
 * How many technicians must remain at the storefront, from booking_settings.
 * The roster size itself is never configured here - it is read live from the
 * artists table, so hiring or losing staff needs no code or settings change.
 */
export async function getMinStorefrontStaff(
  supabase: { from: (t: string) => any }
): Promise<number> {
  try {
    // select('*') so this keeps working before the migration is applied.
    const { data } = await supabase.from('booking_settings').select('*').eq('id', 1).single()
    const value = Number(data?.min_storefront_staff)
    return Number.isFinite(value) && value >= 0 ? value : DEFAULT_MIN_STOREFRONT_STAFF
  } catch {
    return DEFAULT_MIN_STOREFRONT_STAFF
  }
}

export interface StaffingBooking extends SlotHold {
  artist_id: number | null
  start_time: string
  end_time: string
  location_type: string | null
}

export interface StaffingInput {
  /** Every artist on the roster. */
  allArtists: { id: number }[]
  /** Their schedule rows for this date, if any. */
  schedules: (ScheduleOverride & { artist_id: number })[] | null | undefined
  defaultHours: WorkingHours
  /** All non-cancelled bookings on the date. */
  dayBookings: StaffingBooking[] | null | undefined
  startMins: number
  endMins: number
  durationMins: number
  /** Technicians who must remain in the studio. Defaults to 1. */
  minStorefrontStaff?: number
}

export interface StaffingResult {
  /** Artists rostered on and working at this time. */
  working: number
  /** House calls already overlapping this window. */
  houseCallsOut: number
  /** Whether one more house call would still leave the studio staffed. */
  canAddHouseCall: boolean
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && aEnd > bStart
}

export function checkStaffing(input: StaffingInput): StaffingResult {
  const {
    allArtists, schedules, defaultHours, dayBookings,
    startMins, endMins, durationMins,
    minStorefrontStaff = DEFAULT_MIN_STOREFRONT_STAFF,
  } = input

  const working = allArtists.filter(a => {
    const schedule = schedules?.find(s => s.artist_id === a.id) ?? null
    if (schedule?.is_blocked) return false
    const bounds = startBounds(resolveHours(schedule, defaultHours), durationMins)
    return startMins >= bounds.minStart && startMins <= bounds.maxStart
  }).length

  const houseCallsOut = (dayBookings ?? []).filter(b =>
    b.location_type === 'house_call' &&
    holdsSlot(b) &&
    overlaps(startMins, endMins, timeToMins(b.start_time), timeToMins(b.end_time))
  ).length

  return {
    working,
    houseCallsOut,
    // One more artist leaves for a house call: does anyone remain in the shop?
    canAddHouseCall: working - houseCallsOut - 1 >= minStorefrontStaff,
  }
}
