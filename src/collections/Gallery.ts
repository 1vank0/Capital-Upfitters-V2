import type { CollectionConfig } from 'payload'
import { logAfterChange, logAfterDelete } from '../hooks/accessLog'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  labels: {
    singular: 'Gallery Project',
    plural: 'Gallery',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'service', 'featured', '_status', 'updatedAt'],
    group: 'Content',
    description: 'Before/after project photos grouped by job. Powers the filterable gallery page.',
    listSearchableFields: ['title'],
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
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Project title (e.g. "2024 F-150 Patriot Liner + Tonneau")',
      },
    },
    {
      name: 'images',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 20,
      admin: {
        description: 'Project photos — tag before/after where applicable',
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
            description: 'Optional description for this photo',
          },
        },
        {
          name: 'beforeAfter',
          type: 'select',
          options: [
            { label: 'Before', value: 'before' },
            { label: 'After', value: 'after' },
            { label: 'N/A', value: 'na' },
          ],
          defaultValue: 'na',
          admin: {
            description: 'Tag for before/after comparisons',
          },
        },
      ],
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      admin: {
        description: 'Link to the service performed',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Bedliner', value: 'bedliner' },
        { label: 'Ceramic Coating', value: 'ceramic-coating' },
        { label: 'Hitches', value: 'hitches' },
        { label: 'Undercoating', value: 'undercoating' },
        { label: 'Tonneau Covers', value: 'tonneau' },
        { label: 'Running Boards', value: 'running-boards' },
        { label: 'Wraps', value: 'wraps' },
        { label: 'Fleet', value: 'fleet' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Used for the frontend gallery filter tabs',
      },
    },
    {
      name: 'vehicleInfo',
      type: 'text',
      admin: {
        description: 'Year / Make / Model of the vehicle in this project',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show in the homepage gallery section',
      },
    },
  ],
  hooks: {
    afterChange: [logAfterChange],
    afterDelete: [logAfterDelete],
  },
}
