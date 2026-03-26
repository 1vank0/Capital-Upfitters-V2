import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import sharp from 'sharp'

import { getPoolConfig } from './lib/db'
import { Services } from './collections/Services'
import { GeoPages } from './collections/GeoPages'
import { Testimonials } from './collections/Testimonials'
import { FAQs } from './collections/FAQs'
import { Gallery } from './collections/Gallery'
import { Leads } from './collections/Leads'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { BusinessSettings } from './globals/BusinessSettings'

import type { GenerateTitle, GenerateDescription, GenerateURL } from '@payloadcms/plugin-seo/types'
import type { Plugin } from 'payload'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// ── SEO auto-generation functions ─────────────────────────────────────────────

const generateTitle: GenerateTitle = ({ doc, collectionConfig }) => {
  const d = doc as Record<string, unknown>

  // Service: "Spray-On Bedliners | Capital Upfitters"
  if (d.title && collectionConfig?.slug === 'services') {
    return `${d.title} | Capital Upfitters`
  }

  // Geo page: "Vehicle Upfitting in Rockville MD | Capital Upfitters"
  if (d.city && collectionConfig?.slug === 'geo-pages') {
    return `Vehicle Upfitting in ${d.city} ${d.state || 'MD'} | Capital Upfitters`
  }

  // Fallback
  if (d.title) return `${d.title} | Capital Upfitters`
  if (d.name) return `${d.name} | Capital Upfitters`
  return 'Capital Upfitters — Premium Vehicle Upfitting'
}

const generateDescription: GenerateDescription = ({ doc, collectionConfig }) => {
  const d = doc as Record<string, unknown>

  // Use shortDescription if available (services)
  if (typeof d.shortDescription === 'string' && d.shortDescription.length > 0) {
    return d.shortDescription.slice(0, 160)
  }

  // Geo page auto-description
  if (d.city && collectionConfig?.slug === 'geo-pages') {
    return `Capital Upfitters serves ${d.city}, ${d.state || 'MD'} with bedliners, hitches, ceramic coatings, and fleet upfitting. 30+ years experience. Call (301) 304-1419.`
  }

  return "DMV's most trusted vehicle upfitting shop. Patriot Liner bedliners, ceramic coatings, hitches, undercoating, and full fleet solutions."
}

const generateURL: GenerateURL = ({ doc, collectionConfig }) => {
  const d = doc as Record<string, unknown>
  const slug = d.slug

  if (!slug) return serverUrl

  switch (collectionConfig?.slug) {
    case 'services':
      return `${serverUrl}/services/${slug}`
    case 'geo-pages':
      return `${serverUrl}/locations/${slug}`
    default:
      return `${serverUrl}/${slug}`
  }
}

// ── Plugin array (conditionally configured) ───────────────────────────────────

const plugins: Plugin[] = [
  // 1. SEO — auto-generates meta fields for Services + Geo Pages
  seoPlugin({
    collections: ['services', 'geo-pages'],
    uploadsCollection: 'media',
    generateTitle,
    generateDescription,
    generateURL,
    tabbedUI: true,
  }),
]

// 2. Storage — S3 (if configured) OR Vercel Blob (if token present) OR local
if (process.env.S3_BUCKET) {
  plugins.push(
    s3Storage({
      collections: { media: true },
      bucket: process.env.S3_BUCKET,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'us-east-1',
        ...(process.env.S3_ENDPOINT
          ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true }
          : {}),
      },
    }),
  )
} else if (process.env.BLOB_READ_WRITE_TOKEN) {
  plugins.push(
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  )
}
// If neither is set, Payload uses local disk storage (./media) — fine for dev

// ── Main config ───────────────────────────────────────────────────────────────

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — Capital Upfitters CMS',
    },
    livePreview: {
      url: serverUrl,
      collections: ['services', 'geo-pages'],
    },
  },

  collections: [
    Users,
    Media,
    Services,
    GeoPages,
    Testimonials,
    FAQs,
    Gallery,
    Leads,
  ],

  globals: [BusinessSettings],

  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET || 'CHANGE-THIS-SECRET-IN-PRODUCTION',

  serverURL: serverUrl,

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: postgresAdapter({
    pool: getPoolConfig(),
  }),

  sharp,

  plugins,
})
