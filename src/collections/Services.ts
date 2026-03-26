import type { CollectionConfig } from 'payload'
import { slugField } from '../hooks/slugField'
import { logAfterChange, logAfterDelete } from '../hooks/accessLog'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: {
    singular: 'Service',
    plural: 'Services',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', '_status', 'updatedAt'],
    group: 'Content',
    description: 'Vehicle upfitting services offered to retail, fleet, dealer, and government clients.',
    listSearchableFields: ['title', 'slug', 'shortDescription'],
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
    maxPerDoc: 25,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Service name as displayed on the website',
      },
    },
    slugField('title'),
    {
      name: 'description',
      type: 'richText',
      required: true,
      admin: {
        description: 'Full service description with rich text formatting',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      maxLength: 300,
      admin: {
        description: 'Brief summary for cards, listings, and meta descriptions (max 300 chars)',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Retail', value: 'retail' },
        { label: 'Fleet', value: 'fleet' },
        { label: 'Dealer', value: 'dealer' },
        { label: 'Government', value: 'gov' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Audience segment this service targets',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Primary image shown on service cards and hero sections',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Service Gallery',
      admin: {
        description: 'Additional photos showcasing this service',
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
        },
      ],
    },
    {
      name: 'geoTags',
      type: 'array',
      label: 'Service Areas',
      admin: {
        description: 'Cities where this service is available — drives geo page associations',
      },
      fields: [
        {
          name: 'city',
          type: 'text',
          required: true,
        },
      ],
    },
    // SEO fields are injected by the seoPlugin — see payload.config.ts
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Display order (lower = first)',
      },
    },
  ],
  hooks: {
    afterChange: [logAfterChange],
    afterDelete: [logAfterDelete],
  },
}
