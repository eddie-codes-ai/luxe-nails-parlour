// src/lib/session.ts
// Signed admin session tokens.
//
// The previous implementation stored a literal `admin-auth=true` cookie, which
// any visitor could forge with `document.cookie`. Tokens here are HMAC-SHA256
// signed with a server-only secret, so a cookie the server did not issue fails
// verification.
//
// Uses Web Crypto so the same code runs in the Edge proxy and in Node route
// handlers.

export const SESSION_COOKIE = 'admin_session'
export const LEGACY_COOKIE  = 'admin-auth'
export const SESSION_MAX_AGE = 60 * 60 * 12 // 12 hours

export interface SessionPayload {
  sub: string   // admin email
  iat: number   // issued at (seconds)
  exp: number   // expires at (seconds)
}

const encoder = new TextEncoder()

function getSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!secret) {
    throw new Error(
      'No session secret available. Set ADMIN_SESSION_SECRET in the environment.'
    )
  }
  return secret
}

function b64urlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(value: string): Uint8Array {
  const padded = value.length % 4 === 0 ? value : value + '='.repeat(4 - (value.length % 4))
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

/** Issue a signed session token. Throws if no secret is configured. */
export async function createSession(subject: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = { sub: subject, iat: now, exp: now + SESSION_MAX_AGE }

  const body = b64urlEncode(encoder.encode(JSON.stringify(payload)))
  const key = await importKey(getSecret())
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body))

  return `${body}.${b64urlEncode(new Uint8Array(signature))}`
}

/**
 * Verify a session token. Returns the payload, or null for anything that is
 * missing, malformed, unsigned, tampered with, or expired. Never throws — a
 * misconfigured secret must fail closed, not 500 every request.
 */
export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null

  try {
    const [body, signature] = token.split('.')
    if (!body || !signature) return null

    const key = await importKey(getSecret())
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      b64urlDecode(signature) as unknown as ArrayBuffer,
      encoder.encode(body)
    )
    if (!valid) return null

    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body))) as SessionPayload
    if (typeof payload?.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

/** Cookie options shared by every place that sets or clears the session. */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}
