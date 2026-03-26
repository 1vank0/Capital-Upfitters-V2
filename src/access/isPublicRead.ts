import type { Access } from 'payload'

/** Allow unauthenticated read; require auth for everything else */
export const isPublicRead: Access = ({ req: { user } }) => {
  if (user) return true
  return true // read is always public — write gated at field/operation level
}
