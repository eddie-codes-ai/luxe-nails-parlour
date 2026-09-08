// src/app/api/admin/bookings/[id]/confirm-payment/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/requireAdmin'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { id } = await params
  const body = await req.json().catch(() => ({}))

  const { error } = await supabase
    .from('bookings')
    .update({
      status:          'confirmed',
      deposit_paid_at: new Date().toISOString(),
      admin_notes:     body.admin_notes,
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 })

  return NextResponse.json({ success: true })
}