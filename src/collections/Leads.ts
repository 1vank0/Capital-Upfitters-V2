import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'leadType', 'status', 'requestedServices', 'createdAt'],
    description: 'Inbound quote requests and contact form submissions from the website. NEW leads require follow-up. Update status as you work through them.',
    group: 'Operations',
  },
  access: {
    read: isAdmin,
    create: () => true, // Public API submits leads
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    // ── Contact info ──────────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Contact Information',
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: { width: '50%' },
            },
            {
              name: 'phone',
              type: 'text',
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'email',
              type: 'email',
              admin: { width: '50%' },
            },
            {
              name: 'vehicle',
              type: 'text',
              label: 'Vehicle',
              admin: {
                width: '50%',
                description: 'Year, make, model. E.g. "2023 Ford F-150 SuperCrew"',
              },
            },
          ],
        },
        {
          name: 'message',
          type: 'textarea',
          admin: {
            description: 'Customer\'s message or notes from the form.',
          },
        },
      ],
    },

    // ── Request details ───────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Request Details',
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'leadType',
              type: 'select',
              required: true,
              options: [
                { label: 'Retail (personal vehicle)', value: 'retail' },
                { label: 'Fleet (commercial)', value: 'fleet' },
                { label: 'Dealer / Government', value: 'dealer-gov' },
                { label: 'Contact (general)', value: 'contact' },
                { label: 'Quote (online form)', value: 'quote' },
              ],
              admin: {
                width: '50%',
                description: 'Type of customer.',
              },
            },
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'new',
              options: [
                { label: '🔴 New — needs response', value: 'new' },
                { label: '🟡 In Progress — contacted', value: 'in-progress' },
                { label: '🟢 Quoted — awaiting decision', value: 'quoted' },
                { label: '✅ Won — job scheduled', value: 'won' },
                { label: '❌ Lost — not converting', value: 'lost' },
                { label: '⭕ Spam', value: 'spam' },
              ],
              admin: {
                width: '50%',
                description: 'Follow-up status. Update this as you work the lead.',
              },
            },
          ],
        },
        {
          name: 'requestedServices',
          type: 'array',
          label: 'Services Requested',
          admin: {
            description: 'Services the customer asked about. Populated from the quote form checkboxes.',
          },
          fields: [
            {
              name: 'serviceName',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },

    // ── Tracking ──────────────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Tracking (Auto-filled)',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'source',
              type: 'select',
              defaultValue: 'web',
              options: [
                { label: 'Website form', value: 'web' },
                { label: 'Dealer portal', value: 'dealer' },
                { label: 'Referral', value: 'referral' },
                { label: 'Phone call', value: 'phone' },
                { label: 'Walk-in', value: 'walk-in' },
              ],
              admin: { width: '33%' },
            },
            {
              name: 'sourcePage',
              type: 'text',
              label: 'Source Page',
              admin: {
                width: '33%',
                description: 'URL path where form was submitted. E.g. /services/bedliner',
              },
            },
            {
              name: 'ipAddress',
              type: 'text',
              label: 'IP Address',
              admin: {
                width: '33%',
                description: 'Auto-captured for spam detection.',
              },
            },
          ],
        },
        {
          name: 'refId',
          type: 'text',
          label: 'Reference ID',
          admin: {
            description: 'Auto-generated unique ID sent to the customer in confirmation email.',
          },
        },
        {
          name: 'honeypot',
          type: 'text',
          label: 'Honeypot',
          admin: {
            description: 'Should always be empty. Non-empty = bot submission.',
          },
        },
      ],
    },
  ],
}
