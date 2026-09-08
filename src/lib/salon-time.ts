// src/lib/salon-time.ts
// The salon runs on Africa/Nairobi (EAT, UTC+3) but Vercel runs in UTC, so
// "today" and "now" must be computed in the salon's timezone rather than the
// server's. Without this, slot validation drifts by three hours.

export const SALON_TZ = 'Africa/Nairobi'

/** Today's date in the salon's timezone, as YYYY-MM-DD. */
export function salonToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SALON_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/** Current time in the salon's timezone, as minutes since midnight. */
export function salonNowMinutes(): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: SALON_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())

  const hour = Number(parts.find(p => p.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find(p => p.type === 'minute')?.value ?? 0)
  return hour * 60 + minute
}

/** True when the given YYYY-MM-DD is before today in the salon's timezone. */
export function isPastDate(date: string): boolean {
  return date < salonToday()
}

/** True when the date is today in the salon's timezone. */
export function isToday(date: string): boolean {
  return date === salonToday()
}
