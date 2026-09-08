// src/lib/payment-settings.ts
// Single source of truth for the M-Pesa details shown to customers.
//
// These used to be hardcoded placeholders ('123456', wa.me/254000000000), so
// no customer could actually pay a deposit. Values come from booking_settings
// when the owner has set them, falling back to environment variables.

import { createClient } from '@supabase/supabase-js'

export interface PaymentSettings {
  /** M-Pesa Buy Goods till number. Null when the owner has not set one yet. */
  mpesaTill: string | null
  /** Support WhatsApp number in wa.me format (digits only). Null when unset. */
  whatsapp: string | null
}

export const EMPTY_PAYMENT_SETTINGS: PaymentSettings = { mpesaTill: null, whatsapp: null }

function normalise(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const digits = value.replace(/[^\d]/g, '')
  return digits.length ? digits : null
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const envFallback: PaymentSettings = {
    mpesaTill: normalise(process.env.MPESA_TILL),
    whatsapp:  normalise(process.env.OWNER_WHATSAPP),
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
  if (!url || !key) return envFallback

  try {
    // select('*') so this keeps working before the mpesa_till column is added.
    const { data } = await createClient(url, key)
      .from('booking_settings')
      .select('*')
      .eq('id', 1)
      .single()

    return {
      mpesaTill: normalise(data?.mpesa_till) ?? envFallback.mpesaTill,
      whatsapp:  normalise(data?.owner_whatsapp) ?? envFallback.whatsapp,
    }
  } catch {
    return envFallback
  }
}
