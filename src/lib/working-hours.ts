// src/lib/working-hours.ts
//
// Salon-wide working hours, with per-day artist overrides layered on top.
//
// Previously '09:30' and '19:00' were hardcoded in three separate routes and
// late-night hours could only be set through artist_schedules — a rolling
// 14-day admin screen, while customers can book 60 days ahead. That made
// late-night impossible to configure durably. Defaults now live in
// booking_settings and apply to every date with no explicit override.

import type { SupabaseClient } from '@supabase/supabase-js'

export interface WorkingHours {
  /** First bookable start time, HH:MM. */
  start: string
  /** End of normal hours, HH:MM. */
  end: string
  /** Start of late-night rates, HH:MM. Null disables late-night entirely. */
  lateCutoff: string | null
  /** Latest permitted appointment START, HH:MM. Null disables late-night. */
  lateEnd: string | null
}

/** Used when booking_settings has no values (or the columns do not exist yet). */
export const FALLBACK_HOURS: WorkingHours = {
  start: '09:00',
  end: '20:00',
  lateCutoff: '20:00',
  lateEnd: '22:00',
}

export interface ScheduleOverride {
  start_time?: string | null
  end_time?: string | null
  late_cutoff_time?: string | null
  late_end_time?: string | null
  is_blocked?: boolean | null
}

/** Salon defaults from booking_settings, falling back to FALLBACK_HOURS. */
export async function getDefaultHours(supabase: SupabaseClient): Promise<WorkingHours> {
  try {
    // select('*') so this keeps working before the migration is applied.
    const { data } = await supabase.from('booking_settings').select('*').eq('id', 1).single()
    if (!data) return FALLBACK_HOURS

    return {
      start:      data.default_start_time      || FALLBACK_HOURS.start,
      end:        data.default_end_time        || FALLBACK_HOURS.end,
      // An explicit null in settings means "no late night"; undefined means
      // the column is absent, so fall back.
      lateCutoff: data.default_late_cutoff_time === undefined
        ? FALLBACK_HOURS.lateCutoff
        : data.default_late_cutoff_time,
      lateEnd:    data.default_late_end_time === undefined
        ? FALLBACK_HOURS.lateEnd
        : data.default_late_end_time,
    }
  } catch {
    return FALLBACK_HOURS
  }
}

/** Layers a per-day artist_schedules row over the salon defaults. */
export function resolveHours(
  schedule: ScheduleOverride | null | undefined,
  defaults: WorkingHours
): WorkingHours {
  if (!schedule) return defaults
  return {
    start:      schedule.start_time       ?? defaults.start,
    end:        schedule.end_time         ?? defaults.end,
    lateCutoff: schedule.late_cutoff_time ?? defaults.lateCutoff,
    lateEnd:    schedule.late_end_time    ?? defaults.lateEnd,
  }
}

export function timeToMins(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  return `${String(h).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
}

export interface StartBounds {
  /** Earliest bookable start, in minutes since midnight. */
  minStart: number
  /** Latest bookable start, in minutes since midnight. */
  maxStart: number
  lateCutoffMins: number | null
}

/**
 * The range of start times bookable for a service of `durationMins`.
 *
 * With late-night configured, `lateEnd` is the last permitted START, so a long
 * service booked near the end will run past it — that is the nature of a
 * late-night appointment. Without late-night, the service must finish by the
 * normal end time.
 */
export function startBounds(hours: WorkingHours, durationMins: number): StartBounds {
  const minStart = timeToMins(hours.start)
  const lateCutoffMins = hours.lateCutoff ? timeToMins(hours.lateCutoff) : null
  const lateEndMins = hours.lateEnd ? timeToMins(hours.lateEnd) : null

  const maxStart = lateCutoffMins !== null && lateEndMins !== null
    ? lateEndMins
    : timeToMins(hours.end) - durationMins

  return { minStart, maxStart, lateCutoffMins }
}

export function isLateStart(startMins: number, bounds: StartBounds): boolean {
  return bounds.lateCutoffMins !== null && startMins >= bounds.lateCutoffMins
}
