// src/lib/artist-availability.ts
//
// "Out on a house call" — a manual switch the owner flips when an artist
// leaves, and flips back when they return.
//
// Rather than guessing travel time (Nairobi traffic makes any fixed buffer a
// lie), the artist is simply unbookable while they are out. The block covers
// TODAY ONLY: if the owner forgets to mark them back, availability returns by
// itself the next day, so a forgotten switch costs one afternoon rather than
// silently killing that artist's bookings indefinitely.

import { SALON_TZ, salonToday } from './salon-time'

export interface ArtistAvailability {
  /** When the artist was marked out. Null means they are in. */
  unavailable_since?: string | null
}

/** The Nairobi calendar date of a timestamp, as YYYY-MM-DD. */
function salonDateOf(timestamp: string): string | null {
  const parsed = new Date(timestamp)
  if (Number.isNaN(parsed.getTime())) return null
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SALON_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsed)
}

/**
 * Whether this artist is currently out, for bookings on `bookingDate`.
 * Only ever true for today — future dates are never affected.
 */
export function isOut(artist: ArtistAvailability, bookingDate: string): boolean {
  if (!artist.unavailable_since) return false

  const today = salonToday()
  if (bookingDate !== today) return false

  return salonDateOf(artist.unavailable_since) === today
}

/** Filters a roster down to those who can still take bookings on a date. */
export function bookable<T extends ArtistAvailability>(artists: T[], bookingDate: string): T[] {
  return artists.filter(a => !isOut(a, bookingDate))
}
