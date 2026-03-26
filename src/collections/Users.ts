import type { CollectionConfig } from 'payload'
import { logAfterChange, logAfterDelete } from '../hooks/accessLog'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  labels: {
    singular: 'User',
    plural: 'Users',
  },
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
    description: 'CMS admin accounts. Only admins can create new users.',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name in the admin panel',
      },
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      required: true,
      admin: {
        description: 'Admin = full access. Editor = can edit content but not users or settings.',
      },
    },
  ],
  hooks: {
    afterChange: [logAfterChange],
    afterDelete: [logAfterDelete],
  },
}
