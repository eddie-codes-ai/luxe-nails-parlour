// src/app/api/services/route.ts
// GET /api/services
// Returns all active services for the booking form dropdown

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('services')
    .select('id, name, description, base_price, duration_minutes, house_call_available, category_id')
    .eq('is_active', true)
    .order('name')

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }

  return NextResponse.json({ services: data ?? [] })
}