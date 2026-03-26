import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload-client'
import { rateLimit, getClientIP } from '@/lib/rate-limit'
import {
  sanitizeLeadInput,
  isValidEmail,
  isValidPhone,
} from '@/lib/sanitize'

// ── Rate-limit config ─────────────────────────────────────────────────────────
// 5 submissions per IP per 15 minutes
const LEAD_RATE_LIMIT = 5
const LEAD_RATE_WINDOW = 15 * 60 * 1000

export async function POST(req: NextRequest) {
  // ── 1. Rate limit check ───────────────────────────────────────
  const clientIP = getClientIP(req)
  const rl = rateLimit(`lead:${clientIP}`, LEAD_RATE_LIMIT, LEAD_RATE_WINDOW)

  if (!rl.allowed) {
    console.warn(
      JSON.stringify({
        level: 'warn',
        event: 'lead_rate_limited',
        ip: clientIP,
        retryAfterMs: rl.retryAfterMs,
        timestamp: new Date().toISOString(),
      }),
    )
    return NextResponse.json(
      {
        error: 'Too many submissions. Please wait a few minutes and try again, or call us at (301) 304-1419.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      },
    )
  }

  try {
    // ── 2. Parse + sanitize ───────────────────────────────────────
    let rawBody: Record<string, unknown>
    try {
      rawBody = await req.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      )
    }

    const input = sanitizeLeadInput(rawBody)

    // ── 3. Honeypot check ─────────────────────────────────────────
    // If the hidden honeypot field is filled, it's a bot — silently succeed
    if (input.honeypot) {
      console.warn(
        JSON.stringify({
          level: 'warn',
          event: 'lead_honeypot_triggered',
          ip: clientIP,
          timestamp: new Date().toISOString(),
        }),
      )
      // Return fake success so the bot doesn't retry
      return NextResponse.json({
        success: true,
        refId: 'CU-XXXXXX',
        message: 'Your request has been received.',
      })
    }

    // ── 4. Validation ─────────────────────────────────────────────
    const errors: string[] = []

    if (!input.name || input.name.length < 2) {
      errors.push('Name is required (min 2 characters)')
    }
    if (!input.email) {
      errors.push('Email is required')
    } else if (!isValidEmail(input.email)) {
      errors.push('Invalid email address')
    }
    if (input.phone && !isValidPhone(input.phone)) {
      errors.push('Invalid phone number (need 7–15 digits)')
    }
    if (input.message && input.message.length > 2000) {
      errors.push('Message must be under 2000 characters')
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join('. ') },
        { status: 400 },
      )
    }

    // ── 5. Create lead ────────────────────────────────────────────
    const payload = await getPayloadClient()

    const lead = await payload.create({
      collection: 'leads',
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        vehicle: input.vehicle,
        requestedServices: input.requestedServices.map((s) => ({
          serviceName: s,
        })),
        message: input.message,
        leadType: input.leadType as 'retail' | 'fleet' | 'dealer-gov',
        status: 'new',
        source: input.source as 'web' | 'dealer' | 'referral' | 'phone' | 'walk-in',
        sourcePage: input.sourcePage,
        ipAddress: clientIP,
      },
    })

    // ── 6. Structured log ─────────────────────────────────────────
    console.log(
      JSON.stringify({
        level: 'info',
        event: 'lead_created',
        refId: lead.refId,
        name: input.name,
        email: input.email,
        ip: clientIP,
        leadType: input.leadType,
        timestamp: new Date().toISOString(),
      }),
    )

    return NextResponse.json(
      {
        success: true,
        refId: lead.refId,
        message:
          'Your request has been received. We will contact you within 4 business hours.',
      },
      {
        headers: {
          'X-RateLimit-Remaining': String(rl.remaining),
        },
      },
    )
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'lead_submission_failed',
        ip: clientIP,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
    )
    return NextResponse.json(
      {
        error:
          'Failed to submit your request. Please call us directly at (301) 304-1419.',
      },
      { status: 500 },
    )
  }
}

// ── CORS preflight ────────────────────────────────────────────────────────────
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
