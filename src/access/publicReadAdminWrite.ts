import type { CollectionConfig } from 'payload'

/** Public can read, only admins can create/update/delete */
export const publicReadAdminWrite: Pick<
  NonNullable<CollectionConfig['access']>,
  'read' | 'create' | 'update' | 'delete'
> = {
  read: () => true,
  create: ({ req: { user } }) => Boolean(user),
  update: ({ req: { user } }) => Boolean(user),
  delete: ({ req: { user } }) => Boolean(user),
}
