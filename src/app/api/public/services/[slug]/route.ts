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
      collection: 'services',
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
        { error: 'Service not found' },
        { status: 404 },
      )
    }

    return NextResponse.json(result.docs[0])
  } catch (error) {
    console.error('[API] GET /api/public/services/[slug] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 },
    )
  }
}
