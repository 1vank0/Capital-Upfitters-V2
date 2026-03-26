import type { CollectionConfig } from 'payload'
import { logAfterChange, logAfterDelete } from '../hooks/accessLog'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media File',
    plural: 'Media Library',
  },
  admin: {
    group: 'Media',
    description: 'Upload and manage images. Sharp auto-generates optimized sizes on upload.',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'],
    // Payload + Sharp auto-resize at these breakpoints
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: { quality: 80 },
        },
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: { quality: 82 },
        },
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined, // maintain aspect ratio
        formatOptions: {
          format: 'webp',
          options: { quality: 82 },
        },
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: { quality: 85 },
        },
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        formatOptions: {
          format: 'jpeg',
          options: { quality: 85 },
        },
      },
    ],
    focalPoint: true,
    // Max upload 10 MB
    filesRequiredOnCreate: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Descriptive alt text for accessibility and SEO (required)',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional visible caption beneath the image',
      },
    },
    {
      name: 'credit',
      type: 'text',
      admin: {
        description: 'Photo credit / attribution (optional)',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Tags for filtering in the media library',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  hooks: {
    afterChange: [logAfterChange],
    afterDelete: [logAfterDelete],
  },
}
