import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload-client'
import { getPoolStats } from '@/lib/db'

export async function GET() {
  const poolStats = getPoolStats()

  try {
    // Verify Payload can reach the database
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'users',
      limit: 0,
      depth: 0,
    })

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        pool: poolStats,
      },
      collections: {
        users: result.totalDocs,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: message,
          pool: poolStats,
        },
      },
      { status: 503 },
    )
  }
}
