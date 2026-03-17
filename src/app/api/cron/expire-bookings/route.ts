// src/app/api/cron/expire-bookings/route.ts
// POST /api/cron/expire-bookings
// Runs every 15 minutes via Vercel cron
// Finds all pending_payment bookings past their expires_at and marks them expired

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

  // Find all bookings that are pending_payment and past their expiry time
  const { data: expired, error } = await supabase
    .from('bookings')
    .update({ status: 'expired' })
    .eq('status', 'pending_payment')
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