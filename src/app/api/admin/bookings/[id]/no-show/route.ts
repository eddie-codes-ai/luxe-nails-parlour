// src/app/api/admin/bookings/[id]/no-show/route.ts
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin-auth')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json().catch(() => ({}))

  const { error } = await supabase
    .from('bookings')
    .update({
      status:            'no_show',
      cancellation_tier: 'no_show',
      refund_status:     'none',
      admin_notes:       body.admin_notes,
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })

  return NextResponse.json({ success: true })
}