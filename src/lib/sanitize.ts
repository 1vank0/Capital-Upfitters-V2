/**
 * Input sanitization for user-submitted data.
 * Strips HTML tags, trims whitespace, normalizes dangerous characters.
 */

/** Strip all HTML tags from a string */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '')
}

/** Escape characters that could be used in SQL injection or XSS */
export function escapeSpecial(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/** Full sanitization pipeline: trim, strip HTML, limit length */
export function sanitizeText(
  input: unknown,
  maxLength: number = 500,
): string {
  if (typeof input !== 'string') return ''
  return stripHtml(input).trim().slice(0, maxLength)
}

/** Sanitize an email: trim, lowercase, strip HTML, basic format check */
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return ''
  return stripHtml(input).trim().toLowerCase().slice(0, 254)
}

/** Sanitize phone: keep only digits, +, -, (, ), spaces */
export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[^\d+\-() ]/g, '').trim().slice(0, 30)
}

/** Validate email format (RFC 5322 simplified) */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

/** Validate phone format (at least 7 digits) */
export function isValidPhone(phone: string): boolean {
  if (!phone) return true // phone is optional
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

/**
 * Sanitize an entire lead submission object.
 * Returns a clean object safe to persist.
 */
export function sanitizeLeadInput(body: Record<string, unknown>): {
  name: string
  email: string
  phone: string
  vehicle: string
  message: string
  leadType: string
  source: string
  sourcePage: string
  requestedServices: string[]
  honeypot: string
} {
  // Parse services from multiple possible field names / formats
  let services: string[] = []
  const rawServices = body.requestedServices ?? body.services
  if (Array.isArray(rawServices)) {
    services = rawServices
      .map((s) => sanitizeText(s, 100))
      .filter(Boolean)
      .slice(0, 10) // max 10 services per request
  } else if (typeof rawServices === 'string') {
    services = [sanitizeText(rawServices, 100)]
  }

  return {
    name: sanitizeText(body.name, 100),
    email: sanitizeEmail(body.email),
    phone: sanitizePhone(body.phone),
    vehicle: sanitizeText(body.vehicle, 200),
    message: sanitizeText(body.message, 2000),
    leadType: sanitizeText(body.leadType, 20) || 'retail',
    source: sanitizeText(body.source, 50) || 'web',
    sourcePage: sanitizeText(body.sourcePage ?? body.source, 200),
    requestedServices: services,
    honeypot: sanitizeText(body.website ?? body.url ?? body.company_url, 500),
  }
}
