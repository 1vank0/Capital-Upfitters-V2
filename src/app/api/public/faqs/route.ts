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

    const faqs = await payload.find({
      collection: 'faqs',
      where,
      sort: 'sortOrder',
      limit: 100,
    })

    return NextResponse.json({
      docs: faqs.docs,
      totalDocs: faqs.totalDocs,
    })
  } catch (error) {
    console.error('[API] GET /api/public/faqs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 },
    )
  }
}
