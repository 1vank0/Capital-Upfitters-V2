import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload-client'
import type { Where } from 'payload'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { searchParams } = new URL(req.url)
    const featured = searchParams.get('featured')

    const conditions: Where[] = [{ _status: { equals: 'published' } }]
    if (featured === 'true') {
      conditions.push({ featured: { equals: true } })
    }

    const where: Where = conditions.length > 1 ? { and: conditions } : conditions[0]

    const testimonials = await payload.find({
      collection: 'testimonials',
      where,
      sort: '-rating',
      limit: 50,
      depth: 1,
    })

    return NextResponse.json({
      docs: testimonials.docs,
      totalDocs: testimonials.totalDocs,
    })
  } catch (error) {
    console.error('[API] GET /api/public/testimonials error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 },
    )
  }
}
