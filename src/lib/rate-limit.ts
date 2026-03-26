/**
 * In-memory sliding-window rate limiter.
 *
 * Zero dependencies. Works on Vercel (serverless) and long-running VPS.
 * On Vercel, each cold start resets the window — acceptable for lead-form
 * abuse prevention. For stricter enforcement, swap to Redis (Upstash).
 */

interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

// Auto-evict stale entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  const cutoff = now - windowMs
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff)
    if (entry.timestamps.length === 0) store.delete(key)
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterMs: number
}

/**
 * Check and consume a rate-limit token.
 *
 * @param key      Unique key (usually IP or IP+path)
 * @param limit    Max requests per window
 * @param windowMs Window duration in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  cleanup(windowMs)

  const now = Date.now()
  const cutoff = now - windowMs

  let entry = store.get(key)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(key, entry)
  }

  // Trim expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff)

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0]
    const retryAfterMs = oldest + windowMs - now
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(retryAfterMs, 0),
    }
  }

  // Consume a token
  entry.timestamps.push(now)

  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    retryAfterMs: 0,
  }
}

/**
 * Extract client IP from a Next.js request.
 * Handles Vercel, Cloudflare, and standard proxies.
 */
export function getClientIP(req: Request): string {
  const headers = req.headers

  // Vercel
  const xForwardedFor = headers.get('x-forwarded-for')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }

  // Cloudflare
  const cfConnecting = headers.get('cf-connecting-ip')
  if (cfConnecting) return cfConnecting

  // Real IP (nginx)
  const xRealIp = headers.get('x-real-ip')
  if (xRealIp) return xRealIp

  return 'unknown'
}
