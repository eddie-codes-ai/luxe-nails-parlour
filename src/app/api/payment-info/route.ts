// src/app/api/payment-info/route.ts
// GET /api/payment-info
// Public M-Pesa details for the booking flow's deposit step. Contains only
// information already printed on the shop front — no customer or booking data.

import { NextResponse } from 'next/server'
import { getPaymentSettings } from '@/lib/payment-settings'

export async function GET() {
  return NextResponse.json(await getPaymentSettings())
}
