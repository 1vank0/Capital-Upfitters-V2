import type { GlobalConfig } from 'payload'

export const BusinessSettings: GlobalConfig = {
  slug: 'business-settings',
  label: 'Business Settings',
  admin: {
    group: 'Settings',
    description: 'Core business info — phone, email, address, service areas, SEO defaults, and social links.',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  versions: {
    drafts: true,
    max: 20,
  },
  fields: [
    // ── Contact Info ───────────────────────────────────────────────
    {
      type: 'collapsible',
      label: 'Business Identity',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'businessName',
          type: 'text',
          required: true,
          defaultValue: 'Capital Auto Upfitters & Protective Coatings',
          admin: {
            description: 'Legal business name displayed in the footer and schema markup',
          },
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
          defaultValue: '(301) 304-1419',
          admin: {
            description: 'Primary contact phone number',
          },
        },
        {
          name: 'email',
          type: 'email',
          required: true,
          defaultValue: 'CapitalUpfitters@gmail.com',
          admin: {
            description: 'Primary contact email',
          },
        },
        {
          name: 'hours',
          type: 'text',
          defaultValue: 'Mon–Fri 9:30am–4:30pm',
          admin: {
            description: 'Business hours displayed on the site and in schema markup',
          },
        },
      ],
    },

    // ── Address ────────────────────────────────────────────────────
    {
      name: 'address',
      type: 'group',
      label: 'Physical Address',
      admin: {
        description: 'Used in the footer, contact page, and structured data',
      },
      fields: [
        {
          name: 'street',
          type: 'text',
          required: true,
          defaultValue: '12019 Nebel Street',
        },
        {
          name: 'city',
          type: 'text',
          required: true,
          defaultValue: 'Rockville',
        },
        {
          name: 'state',
          type: 'text',
          required: true,
          defaultValue: 'MD',
        },
        {
          name: 'zip',
          type: 'text',
          required: true,
          defaultValue: '20852',
        },
      ],
    },

    // ── Service Areas ─────────────────────────────────────────────
    {
      name: 'serviceAreas',
      type: 'array',
      label: 'Service Areas',
      admin: {
        description: 'Cities and regions served — shown in the footer and used by geo pages',
      },
      fields: [
        {
          name: 'area',
          type: 'text',
          required: true,
        },
      ],
      defaultValue: [
        { area: 'Rockville' },
        { area: 'Bethesda' },
        { area: 'Silver Spring' },
        { area: 'Gaithersburg' },
        { area: 'Germantown' },
        { area: 'Potomac' },
        { area: 'Washington DC' },
        { area: 'Northern Virginia' },
      ],
    },

    // ── Default SEO ───────────────────────────────────────────────
    {
      name: 'defaultSeo',
      type: 'group',
      label: 'Default SEO',
      admin: {
        description: 'Fallback meta tags when a page has no SEO overrides',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          defaultValue: 'Capital Upfitters — Premium Vehicle Upfitting in Rockville, MD',
          admin: {
            description: 'Default <title> tag (max 70 chars)',
          },
          maxLength: 70,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          defaultValue:
            "DMV's most trusted vehicle upfitting shop. Patriot Liner bedliners, ceramic coatings, hitches, undercoating, and full fleet solutions. Family-owned 30+ years.",
          admin: {
            description: 'Default meta description (max 160 chars)',
          },
          maxLength: 160,
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Default Open Graph image (1200×630 recommended)',
          },
        },
      ],
    },

    // ── Social Links ──────────────────────────────────────────────
    {
      name: 'socialLinks',
      type: 'group',
      label: 'Social Media',
      admin: {
        description: 'Social profile URLs for the footer and structured data',
      },
      fields: [
        {
          name: 'google',
          type: 'text',
          label: 'Google Business URL',
        },
        {
          name: 'facebook',
          type: 'text',
        },
        {
          name: 'instagram',
          type: 'text',
        },
        {
          name: 'youtube',
          type: 'text',
        },
        {
          name: 'yelp',
          type: 'text',
        },
      ],
    },

    // ── Urgency Banner ────────────────────────────────────────────
    {
      name: 'urgency',
      type: 'group',
      label: 'Urgency Banner',
      admin: {
        description: 'Promotional or urgency banner displayed across the top of every page',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Toggle the banner on/off globally',
          },
        },
        {
          name: 'message1',
          type: 'text',
          admin: {
            description: 'Primary banner text (e.g. "Spring Special — 15% Off Bedliners")',
          },
        },
        {
          name: 'message2',
          type: 'text',
          admin: {
            description: 'Secondary rotating message (optional)',
          },
        },
      ],
    },

    // ── External Integrations ─────────────────────────────────────
    {
      name: 'dealerPortalUrl',
      type: 'text',
      label: 'Dealer Portal URL',
      defaultValue: 'https://upfit-portal-58190af9.base44.app',
      admin: {
        description: 'Link to the dealer partner portal',
      },
    },
  ],
}
