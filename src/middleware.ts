import { NextRequest, NextResponse } from 'next/server'

/**
 * Basic Auth Middleware — protects the entire site (including /admin)
 * while in development. Set SITE_PROTECTION=true in Vercel env to enable.
 *
 * When SITE_PROTECTION is not "true", the middleware does nothing —
 * Payload's own /admin auth still protects the CMS panel.
 *
 * Env vars needed in Vercel:
 *   SITE_PROTECTION=true
 *   SITE_PASSWORD=YourSecretPassword
 */

export function middleware(req: NextRequest) {
  // Skip protection if not enabled
  if (process.env.SITE_PROTECTION !== 'true') {
    return NextResponse.next()
  }

  const basicAuth = req.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1] || ''
    const [user, pwd] = atob(authValue).split(':')

    // Username: admin, Password: from env var
    if (user === 'admin' && pwd === process.env.SITE_PASSWORD) {
      return NextResponse.next()
    }
  }

  // Return 401 with WWW-Authenticate header — browser shows password prompt
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Capital Upfitters"',
    },
  })
}

// Run on all routes except static assets and Next.js internals
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
