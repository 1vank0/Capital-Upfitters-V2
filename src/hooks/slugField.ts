import type { Field, FieldHook } from 'payload'

/**
 * Format a string into a URL-safe slug.
 */
export const formatSlug = (val: string): string =>
  val
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()

/**
 * beforeValidate hook — auto-generates and formats slug from source field.
 */
const generateSlug =
  (sourceField: string): FieldHook =>
  ({ value, data }) => {
    // If slug is explicitly set, just sanitize it
    if (typeof value === 'string' && value.trim().length > 0) {
      return formatSlug(value)
    }
    // Otherwise derive from source field
    const source = data?.[sourceField]
    if (typeof source === 'string' && source.length > 0) {
      return formatSlug(source)
    }
    return value
  }

/**
 * beforeChange hook — ensures slug uniqueness by appending -2, -3, etc.
 * Queries the database using the Payload local API.
 */
const ensureUniqueSlug =
  (collectionSlug: string): FieldHook =>
  async ({ value, originalDoc, req }) => {
    if (!value || !req.payload) return value

    const currentId = originalDoc?.id

    // Check if this slug already exists (excluding the current doc)
    let candidate = value as string
    let suffix = 1
    const maxAttempts = 50 // safety valve

    while (suffix <= maxAttempts) {
      const existing = await req.payload.find({
        collection: collectionSlug as 'services',
        where: {
          slug: { equals: candidate },
          ...(currentId ? { id: { not_equals: currentId } } : {}),
        },
        limit: 1,
        depth: 0,
      })

      if (existing.docs.length === 0) {
        return candidate // slug is unique
      }

      // Collision — append numeric suffix
      suffix++
      candidate = `${value}-${suffix}`
    }

    // Fallback: append timestamp to guarantee uniqueness
    return `${value}-${Date.now().toString(36)}`
  }

/**
 * Create a slug field with auto-generation from a source field
 * and database-level uniqueness enforcement.
 *
 * Usage: slugField('title')
 */
export const slugField = (sourceField: string): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: `Auto-generated from "${sourceField}". Edit to override. Must be unique.`,
  },
  hooks: {
    beforeValidate: [generateSlug(sourceField)],
    beforeChange: [
      // The collection slug is inferred at runtime from the request context.
      // We pass a dummy value here — the hook reads req.collection at runtime.
      async ({ value, originalDoc, req, collection }) => {
        if (!value || !req.payload || !collection) return value

        const collectionSlug = collection.slug
        const currentId = originalDoc?.id
        let candidate = value as string
        let suffix = 1

        while (suffix <= 50) {
          const existing = await req.payload.find({
            collection: collectionSlug as 'services',
            where: {
              slug: { equals: candidate },
              ...(currentId ? { id: { not_equals: currentId } } : {}),
            },
            limit: 1,
            depth: 0,
          })

          if (existing.docs.length === 0) return candidate
          suffix++
          candidate = `${value}-${suffix}`
        }

        return `${value}-${Date.now().toString(36)}`
      },
    ],
  },
})
