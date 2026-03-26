import type { CollectionConfig } from 'payload'
import { logAfterChange, logAfterDelete } from '../hooks/accessLog'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  labels: {
    singular: 'FAQ',
    plural: 'FAQs',
  },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', '_status', 'updatedAt'],
    group: 'Content',
    description: 'Frequently asked questions, grouped by category. Used on service pages and the FAQ section.',
    listSearchableFields: ['question'],
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
      name: 'question',
      type: 'text',
      required: true,
      admin: {
        description: 'The question as it will appear on the website',
      },
    },
    {
      name: 'answer',
      type: 'richText',
      required: true,
      admin: {
        description: 'Full answer — supports formatting, links, and lists',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'General', value: 'general' },
        { label: 'Services', value: 'services' },
        { label: 'Pricing', value: 'pricing' },
        { label: 'Fleet', value: 'fleet' },
        { label: 'Warranty', value: 'warranty' },
        { label: 'Scheduling', value: 'scheduling' },
      ],
      defaultValue: 'general',
      admin: {
        position: 'sidebar',
        description: 'Group for filtering on the frontend',
      },
    },
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
