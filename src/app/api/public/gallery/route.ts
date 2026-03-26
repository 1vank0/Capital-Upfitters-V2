import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload-client'
import type { Where } from 'payload'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    const conditions: Where[] = [{ _status: { equals: 'published' } }]
    if (category) {
      conditions.push({ category: { equals: category } })
    }

    const where: Where = conditions.length > 1 ? { and: conditions } : conditions[0]

    const gallery = await payload.find({
      collection: 'gallery',
      where,
      sort: '-createdAt',
      limit: 100,
      depth: 2,
    })

    return NextResponse.json({
      docs: gallery.docs,
      totalDocs: gallery.totalDocs,
    })
  } catch (error) {
    console.error('[API] GET /api/public/gallery error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 },
    )
  }
}
