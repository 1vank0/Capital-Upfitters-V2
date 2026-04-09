import type { CollectionConfig } from 'payload'
import { slugField } from '../hooks/slugField'
import { isAdmin } from '../access/isAdmin'
import { publicReadAdminWrite } from '../access/publicReadAdminWrite'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'sortOrder', '_status', 'updatedAt'],
    description: 'Vehicle upfitting services shown on the site. Each service maps to a /services/[slug] page. Publish to make it live.',
    group: 'Content',
  },
  access: {
    ...publicReadAdminWrite,
  } as CollectionConfig['access'],
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  hooks: {
    beforeChange: [
      // Auto-generate meta if not set
      ({ data, operation }) => {
        if (operation === 'create' || !data.meta?.title) {
          const title = data.title || ''
          const shortDesc = data.shortDescription || ''
          if (!data.meta) data.meta = {}
          if (!data.meta.title && title) {
            data.meta.title = `${title} in Rockville, MD | Capital Upfitters`
          }
          if (!data.meta.description && shortDesc) {
            data.meta.description = `${shortDesc} Located in Rockville, MD. Serving Bethesda, Silver Spring & the DMV. Call (301) 304-1419.`
          }
        }
        return data
      },
    ],
  },
  fields: [
    // ── Tab: Content ──────────────────────────────────────────────────────────
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: {
                description: 'Service name as shown on the site. E.g. "Spray-On Bedliners (Patriot Liner)"',
              },
  
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              required: true,
              maxLength: 300,
              admin: {
                description: 'One sentence used in service cards and meta descriptions. 150–300 chars. E.g. "Factory-certified Patriot Liner spray-on bedliners — lifetime warranty included."',
                rows: 3,
              },
            },
            {
              name: 'description',
              type: 'richText',
              required: true,
              admin: {
                description: 'Full page body content. Use H2/H3 headings, bullet lists, and clear benefit-driven copy. This renders on the /services/[slug] page via the Lexical renderer.',
              },
            },
            {
              name: 'category',
              type: 'select',
              required: true,
              defaultValue: 'retail',
              options: [
                { label: 'Retail (personal vehicles)', value: 'retail' },
                { label: 'Fleet (commercial operators)', value: 'fleet' },
                { label: 'Dealer (pre-delivery)', value: 'dealer' },
                { label: 'Government (municipal)', value: 'gov' },
              ],
              admin: {
                description: 'Who this service is for. Retail = truck owners, Fleet = businesses with multiple vehicles.',
              },
            },
            {
              name: 'sortOrder',
              type: 'number',
              defaultValue: 99,
              admin: {
                description: 'Order in which this service appears in the grid. Lower numbers appear first. Bedliner = 1, Hitches = 2, etc.',
              },
            },
          ],
        },

        // ── Tab: Media ────────────────────────────────────────────────────────
        {
          label: 'Media',
          fields: [
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Hero image for this service. Used as the card image on the services grid and the page hero background. Recommended: 1920×1080 JPG, under 500KB. Use the Image Generator prompts (see admin dashboard) to create scroll-stopping visuals.',
              },
            },
            {
              name: 'gallery',
              type: 'array',
              label: 'Work Gallery',
              admin: {
                description: 'Before/after photos or completed project images. These show in the gallery section on the service page.',
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'caption',
                  type: 'text',
                  admin: {
                    description: 'Optional caption. E.g. "2024 Ford F-150 — full Patriot Liner with UV topcoat"',
                  },
                },
              ],
            },
          ],
        },

        // ── Tab: SEO ──────────────────────────────────────────────────────────
        // The @payloadcms/plugin-seo plugin injects meta.title, meta.description,
        // and meta.image automatically — they appear in the Payload admin sidebar.
        // Only custom geo targeting fields are defined here.
        {
          label: 'SEO',
          fields: [
            {
              name: 'geoTags',
              type: 'array',
              label: 'Geographic Targets',
              admin: {
                description: 'Cities this service targets for local SEO. Used to build /services/[service]/[city] geo pages automatically.',
              },
              fields: [
                {
                  name: 'city',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'E.g. "Rockville", "Bethesda", "Silver Spring"',
                  },
                },
              ],
            },
          ],
        },

        // ── Tab: Slug ─────────────────────────────────────────────────────────
        {
          label: 'URL',
          fields: [
            {
              ...slugField('title'),
              admin: {
                description: 'URL-safe identifier. Auto-generated from title. E.g. "bedliner". This becomes /services/bedliner. DO NOT change after publishing — it will break links.',
              },
            } as CollectionConfig['fields'][0],
          ],
        },
      ],
    },
  ],
}
