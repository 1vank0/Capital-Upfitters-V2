import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload-client'
import type { Where } from 'payload'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    // Only return published (non-draft) documents
    const conditions: Where[] = [{ _status: { equals: 'published' } }]
    if (category) {
      conditions.push({ category: { equals: category } })
    }

    const where: Where = conditions.length > 1 ? { and: conditions } : conditions[0]

    const services = await payload.find({
      collection: 'services',
      where,
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
    })

    return NextResponse.json({
      docs: services.docs,
      totalDocs: services.totalDocs,
    })
  } catch (error) {
    console.error('[API] GET /api/public/services error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 },
    )
  }
}
