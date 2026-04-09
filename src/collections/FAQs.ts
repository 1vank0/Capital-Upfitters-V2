import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { publicReadAdminWrite } from '../access/publicReadAdminWrite'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'sortOrder', '_status'],
    description: 'Frequently asked questions. These appear as an FAQ accordion on service and contact pages. Each FAQ generates a FAQPage schema entry for Google rich results.',
    group: 'Content',
  },
  access: {
    ...publicReadAdminWrite,
  } as CollectionConfig['access'],
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
        description: 'The question as a customer would ask it. Start with "How", "What", "Do you", "Can I", etc. This shows as the accordion header.',
      },
    },
    {
      name: 'answer',
      type: 'richText',
      required: true,
      admin: {
        description: 'The full answer. 2–4 sentences. Can include links to relevant service pages. This generates a FAQPage schema entry that may appear in Google\'s featured snippets.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'select',
          required: true,
          defaultValue: 'general',
          options: [
            { label: 'General', value: 'general' },
            { label: 'Services', value: 'services' },
            { label: 'Fleet', value: 'fleet' },
            { label: 'Scheduling', value: 'scheduling' },
            { label: 'Warranty', value: 'warranty' },
            { label: 'Pricing', value: 'pricing' },
          ],
          admin: {
            width: '50%',
            description: 'Category determines which pages this FAQ appears on. "General" shows on the contact and homepage. Service-specific categories filter to their respective pages.',
          },
        },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 99,
          admin: {
            width: '50%',
            description: 'Display order within its category. Lower = shown first.',
          },
        },
      ],
    },
  ],
}
