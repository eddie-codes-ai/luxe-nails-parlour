// src/app/api/cron/expire-bookings/route.ts
// GET /api/cron/expire-bookings
// Runs daily via Vercel cron (Hobby plan caps cron frequency).
//
// This is housekeeping only: slot availability no longer depends on it, since
// lib/booking-holds evaluates expiry at read time. Its job is to keep the
// stored status honest for the admin bookings list and reporting.

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel cron (not a random person)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // pending_approval was previously never expired, so an unanswered late-night
  // request kept its slot marked as taken indefinitely.
  const { data: expired, error } = await supabase
    .from('bookings')
    .update({ status: 'expired' })
    .in('status', ['pending_payment', 'pending_approval'])
    .lt('expires_at', new Date().toISOString())
    .select('id')

  if (error) {
    console.error('[cron] expire-bookings error:', error)
    return NextResponse.json({ error: 'Failed to expire bookings' }, { status: 500 })
  }

  const count = expired?.length ?? 0
  console.log(`[cron] expired ${count} bookings`)

  return NextResponse.json({
    success: true,
    expired: count,
    message: `${count} booking${count !== 1 ? 's' : ''} expired`,
  })
}