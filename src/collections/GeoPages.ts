import type { CollectionConfig } from 'payload'
import { slugField } from '../hooks/slugField'
import { logAfterChange, logAfterDelete } from '../hooks/accessLog'

export const GeoPages: CollectionConfig = {
  slug: 'geo-pages',
  labels: {
    singular: 'Geo Page',
    plural: 'Geo Pages',
  },
  admin: {
    useAsTitle: 'city',
    defaultColumns: ['city', 'state', 'slug', '_status', 'updatedAt'],
    group: 'Content',
    description: 'Location-targeted landing pages for local SEO (e.g. "Vehicle Upfitting in Rockville MD").',
    listSearchableFields: ['city', 'state', 'slug'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  versions: {
    drafts: {
      autosave: {
        interval: 1500,
      },
      schedulePublish: true,
    },
    maxPerDoc: 15,
  },
  fields: [
    {
      name: 'city',
      type: 'text',
      required: true,
      admin: {
        description: 'City name (e.g. "Rockville")',
      },
    },
    {
      name: 'state',
      type: 'text',
      required: true,
      defaultValue: 'MD',
      admin: {
        description: 'Two-letter state code',
      },
    },
    slugField('city'),
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Full page body — unique content per city for SEO',
      },
    },
    {
      name: 'heroHeadline',
      type: 'text',
      admin: {
        description: 'Override headline (e.g. "Vehicle Upfitting in Rockville MD"). Auto-generated if blank.',
      },
    },
    {
      name: 'relatedServices',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: {
        description: 'Services highlighted on this geo page',
      },
    },
    {
      name: 'nearbyLocations',
      type: 'relationship',
      relationTo: 'geo-pages',
      hasMany: true,
      admin: {
        description: 'Links to nearby location pages for internal linking',
      },
    },
    // SEO fields injected by seoPlugin — see payload.config.ts
    {
      name: 'autoGenerate',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Flag indicating this page was auto-generated from a template',
      },
    },
  ],
  hooks: {
    afterChange: [logAfterChange],
    afterDelete: [logAfterDelete],
  },
}
