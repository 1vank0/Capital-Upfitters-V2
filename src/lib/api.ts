/**
 * Capital Upfitters — Frontend API Client
 *
 * Drop-in helper for any frontend (static HTML, React, Next.js).
 * Update CMS_URL to point to your deployed Payload backend.
 */

const CMS_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Service {
  id: string
  title: string
  slug: string
  description: unknown // Lexical rich text
  shortDescription?: string
  category: 'retail' | 'fleet' | 'dealer' | 'gov'
  featuredImage?: MediaObject
  gallery?: { image: MediaObject; caption?: string }[]
  geoTags?: { city: string }[]
  seo?: SEOFields
  published: boolean
  sortOrder: number
}

export interface GeoPage {
  id: string
  city: string
  state: string
  slug: string
  content: unknown // Lexical rich text
  heroHeadline?: string
  relatedServices?: Service[]
  nearbyLocations?: GeoPage[]
  seo?: SEOFields
  published: boolean
}

export interface Testimonial {
  id: string
  name: string
  company?: string
  review: string
  rating: number
  service?: Service
  featured: boolean
}

export interface FAQ {
  id: string
  question: string
  answer: unknown // Lexical rich text
  category: string
  sortOrder: number
}

export interface GalleryItem {
  id: string
  title: string
  images: {
    image: MediaObject
    caption?: string
    beforeAfter: 'before' | 'after' | 'na'
  }[]
  service?: Service
  category?: string
  featured: boolean
}

export interface LeadSubmission {
  name: string
  email: string
  phone?: string
  vehicle?: string
  requestedServices?: string[]
  message?: string
  leadType?: 'retail' | 'fleet' | 'dealer-gov'
  source?: string
  sourcePage?: string
}

export interface LeadResponse {
  success: boolean
  refId?: string
  message?: string
  error?: string
}

export interface BusinessSettingsData {
  businessName: string
  phone: string
  email: string
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
  hours: string
  serviceAreas: { area: string }[]
  defaultSeo: SEOFields & { ogImage?: MediaObject }
  socialLinks: {
    google?: string
    facebook?: string
    instagram?: string
    youtube?: string
    yelp?: string
  }
  urgency: {
    enabled: boolean
    message1?: string
    message2?: string
  }
  dealerPortalUrl?: string
}

interface MediaObject {
  id: string
  url: string
  alt: string
  caption?: string
  sizes?: Record<string, { url: string; width: number; height: number }>
}

interface SEOFields {
  metaTitle?: string
  metaDescription?: string
  keywords?: string
}

interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
}

// ─── Fetch Helpers ────────────────────────────────────────────────────────────

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${CMS_URL}${path}`, {
    next: { revalidate: 60 }, // ISR: revalidate every 60s
  })
  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${path}`)
  }
  return res.json()
}

// ─── Public API Functions ─────────────────────────────────────────────────────

/** Fetch all published services, optionally filtered by category */
export async function getServices(
  category?: string,
): Promise<Service[]> {
  const query = category ? `?category=${category}` : ''
  const data = await fetchJSON<PaginatedResponse<Service>>(
    `/api/public/services${query}`,
  )
  return data.docs
}

/** Fetch a single service by slug */
export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    return await fetchJSON<Service>(`/api/public/services/${slug}`)
  } catch {
    return null
  }
}

/** Fetch a geo page by slug (e.g. "rockville") */
export async function getGeoPage(slug: string): Promise<GeoPage | null> {
  try {
    return await fetchJSON<GeoPage>(`/api/public/geopages/${slug}`)
  } catch {
    return null
  }
}

/** Fetch testimonials, optionally only featured ones */
export async function getTestimonials(
  featured?: boolean,
): Promise<Testimonial[]> {
  const query = featured ? '?featured=true' : ''
  const data = await fetchJSON<PaginatedResponse<Testimonial>>(
    `/api/public/testimonials${query}`,
  )
  return data.docs
}

/** Fetch FAQs, optionally by category */
export async function getFAQs(category?: string): Promise<FAQ[]> {
  const query = category ? `?category=${category}` : ''
  const data = await fetchJSON<PaginatedResponse<FAQ>>(
    `/api/public/faqs${query}`,
  )
  return data.docs
}

/** Fetch gallery items, optionally by category */
export async function getGallery(
  category?: string,
): Promise<GalleryItem[]> {
  const query = category ? `?category=${category}` : ''
  const data = await fetchJSON<PaginatedResponse<GalleryItem>>(
    `/api/public/gallery${query}`,
  )
  return data.docs
}

/** Fetch global business settings */
export async function getSettings(): Promise<BusinessSettingsData> {
  return fetchJSON<BusinessSettingsData>('/api/public/settings')
}

/** Submit a new lead from the contact / quote form */
export async function submitLead(
  data: LeadSubmission,
): Promise<LeadResponse> {
  try {
    const res = await fetch(`${CMS_URL}/api/public/submit-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return await res.json()
  } catch {
    return {
      success: false,
      error: 'Network error — please call us directly at (301) 304-1419.',
    }
  }
}
