import type { CollectionConfig } from 'payload'
import { slugField } from '../hooks/slugField'
import { isAdmin } from '../access/isAdmin'
import { publicReadAdminWrite } from '../access/publicReadAdminWrite'

export const GeoPages: CollectionConfig = {
  slug: 'geo-pages',
  admin: {
    useAsTitle: 'city',
    defaultColumns: ['city', 'state', 'slug', '_status', 'updatedAt'],
    description: 'Location-specific landing pages for local SEO. Each page targets search queries like "vehicle upfitting near [City], MD". Publishes to /locations/[slug].',
    group: 'Content',
  },
  access: {
    ...publicReadAdminWrite,
  } as CollectionConfig['access'],
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  hooks: {
    beforeChange: [
      // Auto-generate meta if not set
      ({ data }) => {
        const city = data.city || ''
        const state = data.state || 'MD'
        if (!data.meta) data.meta = {}
        if (!data.meta.title && city) {
          data.meta.title = `Vehicle Upfitting Near ${city}, ${state} | Capital Upfitters`
        }
        if (!data.meta.description && city) {
          data.meta.description = `Capital Upfitters serves ${city}, ${state} with professional bedliners, hitches, ceramic coatings, and fleet upfitting. ${city === 'Rockville' ? 'Our home base.' : `Just a short drive from ${city} via local routes.`} Call (301) 304-1419.`
        }
        return data
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ── Tab: Location ─────────────────────────────────────────────────────
        {
          label: 'Location',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'city',
                  type: 'text',
                  required: true,
                  admin: {
                    width: '50%',
                    description: 'City name. E.g. "Bethesda" or "Silver Spring".',
                  },
                },
                {
                  name: 'state',
                  type: 'text',
                  required: true,
                  defaultValue: 'MD',
                  admin: {
                    width: '50%',
                    description: 'Two-letter state code. E.g. "MD", "VA", "DC".',
                  },
                },
              ],
            },
            {
              name: 'heroHeadline',
              type: 'text',
              admin: {
                description: 'H1 headline for this geo page. E.g. "Vehicle Upfitting in Bethesda, MD". Auto-uses city name if blank.',
              },
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              admin: {
                description: 'Main page body. Write 300–600 words of locally-relevant copy. Mention nearby neighborhoods, landmarks, and how far the city is from the Rockville shop. Include 2–3 service mentions with internal links.',
              },
            },
            {
              name: 'relatedServices',
              type: 'relationship',
              relationTo: 'services',
              hasMany: true,
              admin: {
                description: 'Services shown in the "Available Near [City]" grid. Select all services unless a specific city is only served by some. Affects the /locations/[slug] page grid.',
              },
            },
            {
              name: 'nearbyLocations',
              type: 'relationship',
              relationTo: 'geo-pages',
              hasMany: true,
              admin: {
                description: 'Other geo pages shown as "Also Serving" links at the bottom. Builds internal link equity between location pages.',
              },
            },
          ],
        },

        // ── Tab: SEO ──────────────────────────────────────────────────────────
        {
          label: 'SEO',
          // The @payloadcms/plugin-seo plugin injects meta.title, meta.description,
          // and meta.image automatically into the Payload admin sidebar.
          // No manual meta group needed here.
          fields: [],
        },

        // ── Tab: URL ──────────────────────────────────────────────────────────
        {
          label: 'URL',
          fields: [
            {
              ...slugField('city'),
              admin: {
                description: 'URL-safe ID. Auto-generated as "[city]-[state]". E.g. "bethesda-md". Becomes /locations/bethesda-md. DO NOT change after publishing.',
              },
            } as CollectionConfig['fields'][0],
          ],
        },
      ],
    },
  ],
}
