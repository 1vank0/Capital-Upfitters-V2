import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload-client'

export async function GET() {
  try {
    const payload = await getPayloadClient()

    const settings = await payload.findGlobal({
      slug: 'business-settings',
      depth: 1, // populate ogImage
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('[API] GET /api/public/settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 },
    )
  }
}
