// src/lib/rate-limit.ts
// Fixed-window rate limiter for auth endpoints.
//
// State is per-instance and in-memory, so on serverless it is per warm lambda
// rather than global. That still turns "unlimited guesses" into "a handful of
// guesses per instance per window", which is what makes the 6-digit reset code
// and the login form safe to expose. Move this to Redis/Postgres if the site
// ever needs a hard global guarantee.

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

function sweep(now: number) {
  if (buckets.size < 500) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export interface RateLimitResult {
  ok: boolean
  /** Seconds until the window resets. */
  retryAfter: number
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }

  bucket.count += 1

  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  return { ok: true, retryAfter: 0 }
}

/** Best-effort client identifier for rate-limit keys. */
export function clientKey(req: Request, scope: string): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  return `${scope}:${ip}`
}
