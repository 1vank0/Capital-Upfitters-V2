import type { CollectionConfig } from 'payload'
import { logAfterChange, logAfterDelete } from '../hooks/accessLog'

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: {
    singular: 'Lead',
    plural: 'Leads',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'refId', 'status', 'source', 'createdAt'],
    group: 'Business',
    description: 'Inbound leads from the website contact/quote forms. Public can submit; only admins can view.',
    listSearchableFields: ['name', 'email', 'phone', 'refId', 'vehicle'],
  },
  access: {
    // Public can create (form submission), only logged-in users can read/update/delete
    read: ({ req: { user } }) => Boolean(user),
    create: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    // ── Contact Info ───────────────────────────────────────────────
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 100,
      admin: {
        description: 'Full name of the person requesting a quote',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        description: 'Contact email address',
      },
    },
    {
      name: 'phone',
      type: 'text',
      maxLength: 30,
      admin: {
        description: 'Phone number (optional)',
      },
      validate: (value: string | null | undefined) => {
        if (!value) return true // optional
        const digits = value.replace(/\D/g, '')
        if (digits.length < 7 || digits.length > 15) {
          return 'Phone must be 7–15 digits'
        }
        return true
      },
    },

    // ── Vehicle / Service ─────────────────────────────────────────
    {
      name: 'vehicle',
      type: 'text',
      maxLength: 200,
      admin: {
        description: 'Year / Make / Model of the vehicle',
      },
    },
    {
      name: 'requestedServices',
      type: 'array',
      maxRows: 10,
      admin: {
        description: 'Services the customer is interested in',
      },
      fields: [
        {
          name: 'serviceName',
          type: 'text',
          required: true,
          maxLength: 100,
        },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      maxLength: 2000,
      admin: {
        description: 'Free-form message from the customer',
      },
    },

    // ── Classification ────────────────────────────────────────────
    {
      name: 'leadType',
      type: 'select',
      options: [
        { label: 'Retail', value: 'retail' },
        { label: 'Fleet', value: 'fleet' },
        { label: 'Dealer / Government', value: 'dealer-gov' },
      ],
      defaultValue: 'retail',
      admin: {
        position: 'sidebar',
        description: 'Audience segment',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: '🟢 New', value: 'new' },
        { label: '📞 Contacted', value: 'contacted' },
        { label: '💰 Quoted', value: 'quoted' },
        { label: '✅ Closed — Won', value: 'closed-won' },
        { label: '❌ Closed — Lost', value: 'closed-lost' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Current pipeline stage',
      },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'web',
      options: [
        { label: 'Website', value: 'web' },
        { label: 'Dealer Portal', value: 'dealer' },
        { label: 'Referral', value: 'referral' },
        { label: 'Phone', value: 'phone' },
        { label: 'Walk-in', value: 'walk-in' },
      ],
      admin: {
        position: 'sidebar',
        description: 'How the lead arrived',
      },
    },
    {
      name: 'sourcePage',
      type: 'text',
      maxLength: 200,
      admin: {
        position: 'sidebar',
        description: 'URL path the form was submitted from',
        readOnly: true,
      },
    },
    {
      name: 'refId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-generated reference ID (e.g. CU-XXXXXX)',
      },
    },

    // ── Internal / Anti-Spam ──────────────────────────────────────
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Submitter IP address (for abuse detection)',
      },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      maxLength: 2000,
      admin: {
        description: 'Internal notes about this lead (not shown to customer)',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && data) {
          // Generate a reference ID: CU-<timestamp36>-<random4>
          const timestamp = Date.now().toString(36).toUpperCase()
          const random = Math.random().toString(36).substring(2, 6).toUpperCase()
          data.refId = `CU-${timestamp}-${random}`
        }
        return data
      },
    ],
    afterChange: [logAfterChange],
    afterDelete: [logAfterDelete],
  },
}
