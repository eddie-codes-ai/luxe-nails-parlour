// src/lib/requireAdmin.ts
// Shared guard for /api/admin/* route handlers.
//
// The Edge proxy already blocks these paths, but every route re-checks so that
// a future matcher change cannot silently expose them. Returns a 401 response
// to return early with, or null when the caller is authenticated.

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySession } from './session'

export async function requireAdmin(): Promise<NextResponse | null> {
  const store = await cookies()
  const session = await verifySession(store.get(SESSION_COOKIE)?.value)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
