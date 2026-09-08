// src/lib/booking-holds.ts
// Whether a booking still occupies its slot.
//
// Unpaid bookings reserve a slot until `expires_at`. The cron that flips them
// to 'expired' runs once a day (Vercel Hobby caps cron frequency), so relying
// on `status` alone meant a 60-minute hold could block a slot for up to 24
// hours. Evaluating expiry at read time makes the hold accurate immediately
// and reduces the cron to housekeeping.

/** Statuses that never occupy a slot. */
const RELEASED = new Set(['declined', 'cancelled', 'expired'])

/** Statuses that only occupy a slot until their expires_at passes. */
const PROVISIONAL = new Set(['pending_payment', 'pending_approval'])

export interface SlotHold {
  status: string
  expires_at?: string | null
}

export function holdsSlot(booking: SlotHold, now: number = Date.now()): boolean {
  if (RELEASED.has(booking.status)) return false

  if (PROVISIONAL.has(booking.status) && booking.expires_at) {
    return new Date(booking.expires_at).getTime() > now
  }

  return true
}

/** Convenience filter for a day's bookings. */
export function activeHolds<T extends SlotHold>(bookings: T[] | null | undefined): T[] {
  const now = Date.now()
  return (bookings ?? []).filter(b => holdsSlot(b, now))
}
