import type { CollectionConfig } from 'payload'
import { logAfterChange, logAfterDelete } from '../hooks/accessLog'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: {
    singular: 'Testimonial',
    plural: 'Testimonials',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'company', 'rating', 'featured', '_status', 'updatedAt'],
    group: 'Content',
    description: 'Customer reviews displayed on the website. Mark "Featured" to show on the homepage.',
    listSearchableFields: ['name', 'company', 'review'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Customer name (e.g. "Mike R.")',
      },
    },
    {
      name: 'company',
      type: 'text',
      admin: {
        description: 'Company or organization name (optional)',
      },
    },
    {
      name: 'review',
      type: 'textarea',
      required: true,
      maxLength: 1000,
      admin: {
        description: 'The full testimonial text (max 1000 chars)',
      },
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      defaultValue: 5,
      admin: {
        step: 1,
        position: 'sidebar',
        description: 'Star rating 1–5',
      },
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      admin: {
        description: 'Which service is this testimonial about?',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show on homepage and featured sections',
      },
    },
  ],
  hooks: {
    afterChange: [logAfterChange],
    afterDelete: [logAfterDelete],
  },
}
