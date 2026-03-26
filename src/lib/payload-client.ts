import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'

// ── Global Payload Singleton ─────────────────────────────────────────────────
//
// Payload internally caches its own instance, but wrapping it in a globalThis
// cache gives us an extra safety net:
//   - Dev: survives Next.js hot module replacement without re-initializing
//   - Prod (Vercel): each serverless function gets exactly one Payload instance
//     per cold start, which reuses the single Pool created by the db adapter
//
// This prevents:
//   - Multiple Pool instances from HMR in development
//   - Redundant Payload init calls in the same function invocation
// ─────────────────────────────────────────────────────────────────────────────

const globalForPayload = globalThis as typeof globalThis & {
  __payloadInstance?: Promise<Payload>
}

export function getPayloadClient(): Promise<Payload> {
  if (!globalForPayload.__payloadInstance) {
    globalForPayload.__payloadInstance = getPayload({ config: configPromise })
  }
  return globalForPayload.__payloadInstance
}
