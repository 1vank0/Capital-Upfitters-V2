import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload-client'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { searchParams } = new URL(req.url)
    const limit = Math.min(Number(searchParams.get('limit') || '100'), 100)

    const result = await payload.find({
      collection: 'geo-pages',
      where: {
        _status: { equals: 'published' },
      },
      sort: 'city',
      depth: 2,
      limit,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] GET /api/public/geopages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch geo pages' },
      { status: 500 },
    )
  }
}
