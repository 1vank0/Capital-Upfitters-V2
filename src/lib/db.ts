import type { PoolConfig } from 'pg'

// ── Neon / Vercel Serverless Pool Configuration ──────────────────────────────
//
// Problem: Vercel serverless functions spin up fresh Node processes on every
// cold start. Each process creates its own pg Pool, which opens connections to
// Neon. Without limits, this causes "too many connections" errors because:
//   - Neon Free: 20 connection limit
//   - Neon Pro:  100 connection limit (pooled endpoint handles more)
//   - Vercel can spin 10+ concurrent functions during traffic spikes
//
// Solution:
//   1. Use Neon's POOLED connection string (the -pooler hostname)
//   2. Keep max connections per process LOW (3-5 per function)
//   3. Aggressively release idle connections (10s timeout)
//   4. Short connection timeout to fail fast if pool is exhausted
//   5. Cache the PoolConfig on `globalThis` so hot reloads in dev
//      don't create duplicate pool configs
//
// The Payload adapter creates the actual Pool instance from this config.
// We cache the CONFIG object to ensure consistency across hot reloads.
// ─────────────────────────────────────────────────────────────────────────────

interface CachedPoolConfig {
  config: PoolConfig
}

const globalForPg = globalThis as typeof globalThis & {
  __pgPoolConfig?: CachedPoolConfig
}

function buildPoolConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URI || ''
  const isProduction = process.env.NODE_ENV === 'production'
  const isNeon = connectionString.includes('neon.tech') || connectionString.includes('neon.')

  // ── Base config ────────────────────────────────────────────────────────
  const config: PoolConfig = {
    connectionString,

    // Serverless-safe pool sizing:
    // - Production (Vercel): keep low. Each function gets its own pool.
    //   With 10 concurrent functions × 5 max = 50 connections (within Neon Pro limit).
    // - Development: slightly higher for admin panel + API + hot reload.
    max: isProduction ? 5 : 10,

    // Minimum idle connections. Zero in production = connections are only
    // created on demand and released when idle. Saves Neon compute-seconds.
    min: isProduction ? 0 : 2,

    // How long (ms) a client can sit idle before being closed.
    // Neon's pooler has a 300s server-side timeout. We close ours well before.
    idleTimeoutMillis: isProduction ? 10_000 : 30_000,

    // How long (ms) to wait for a connection from the pool before throwing.
    // Fail fast in serverless — don't hold the function open waiting.
    connectionTimeoutMillis: isProduction ? 5_000 : 10_000,

    // Close idle connections proactively. In serverless, we don't want
    // connections lingering after the function finishes.
    allowExitOnIdle: isProduction,
  }

  // ── Neon SSL ───────────────────────────────────────────────────────────
  // Neon requires SSL. The pooled endpoint uses SNI routing, so we must NOT
  // reject unauthorized certs (Neon uses its own CA).
  if (isNeon) {
    config.ssl = { rejectUnauthorized: false }
  }

  // ── Connection string validation ───────────────────────────────────────
  if (isNeon && !connectionString.includes('-pooler')) {
    console.warn(
      '[DB] WARNING: You are using a direct Neon connection string.\n'
      + '     For serverless deployments, use the POOLED endpoint:\n'
      + '     Replace .neon.tech with -pooler.neon.tech in DATABASE_URI.\n'
      + '     This routes through PgBouncer and prevents connection exhaustion.',
    )
  }

  return config
}

// ── Export: cached pool config ────────────────────────────────────────────────
// Cached on globalThis to survive Next.js hot reloads in dev.
// In production (Vercel), each function gets one copy — which is correct.

export function getPoolConfig(): PoolConfig {
  if (!globalForPg.__pgPoolConfig) {
    globalForPg.__pgPoolConfig = { config: buildPoolConfig() }
  }
  return globalForPg.__pgPoolConfig.config
}

// ── Health check helper (optional — useful for /api/health endpoints) ────────

export function getPoolStats() {
  const config = getPoolConfig()
  return {
    max: config.max,
    min: config.min,
    idleTimeoutMillis: config.idleTimeoutMillis,
    connectionTimeoutMillis: config.connectionTimeoutMillis,
    ssl: !!config.ssl,
    isNeon: (config.connectionString || '').includes('neon'),
    isPooled: (config.connectionString || '').includes('-pooler'),
  }
}
