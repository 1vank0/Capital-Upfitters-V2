import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { publicReadAdminWrite } from '../access/publicReadAdminWrite'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'rating', 'service', 'featured', '_status', 'updatedAt'],
    description: 'Customer reviews displayed on the homepage and service pages. Set "Featured" to show on the homepage. Link to a service to show on that service\'s page.',
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
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
            description: 'Customer first name + last initial. E.g. "Mike R."',
          },
        },
        {
          name: 'company',
          type: 'text',
          admin: {
            width: '50%',
            description: 'Optional company name. E.g. "Rockville Landscaping LLC". Leave blank for personal vehicles.',
          },
        },
      ],
    },
    {
      name: 'review',
      type: 'textarea',
      required: true,
      admin: {
        description: 'The review text. 1–4 sentences. Keep it authentic — avoid making edits that sound promotional.',
        rows: 4,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'rating',
          type: 'select',
          required: true,
          defaultValue: '5',
          options: [
            { label: '⭐⭐⭐⭐⭐  5 stars', value: '5' },
            { label: '⭐⭐⭐⭐  4 stars', value: '4' },
            { label: '⭐⭐⭐  3 stars', value: '3' },
          ],
          admin: {
            width: '40%',
            description: 'Star rating from the customer.',
          },
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            width: '30%',
            description: 'Show on homepage?',
          },
        },
      ],
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      admin: {
        description: 'Which service this review is about. Linking a testimonial to a service makes it appear on that service\'s page.',
      },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'google',
      options: [
        { label: 'Google', value: 'google' },
        { label: 'Yelp', value: 'yelp' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Direct / In-person', value: 'direct' },
      ],
      admin: {
        description: 'Where this review came from. Google reviews have the highest trust signal.',
      },
    },
  ],
}
