import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload-client'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const payload = await getPayloadClient()

    const result = await payload.find({
      collection: 'geo-pages',
      where: {
        and: [
          { slug: { equals: slug } },
          { _status: { equals: 'published' } },
        ],
      },
      depth: 2,
      limit: 1,
    })

    if (!result.docs.length) {
      return NextResponse.json(
        { error: 'Geo page not found' },
        { status: 404 },
      )
    }

    return NextResponse.json(result.docs[0])
  } catch (error) {
    console.error('[API] GET /api/public/geopages/[slug] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch geo page' },
      { status: 500 },
    )
  }
}
