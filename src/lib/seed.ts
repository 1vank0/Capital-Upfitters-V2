/**
 * Seed script — run via: npm run seed
 *
 * Creates a default admin user and sample data.
 * Requires DATABASE_URL and PAYLOAD_SECRET in .env
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

async function seed() {
  const payload = await getPayload({ config })

  console.log('🌱 Seeding Capital Upfitters CMS...\n')

  // ── Create admin user ──────────────────────────────────────────────
  try {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: 'admin@capitalupfitters.com' } },
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'admin@capitalupfitters.com',
          password: 'CapUpfit2024!',
          name: 'Admin',
          role: 'admin',
        },
      })
      console.log('✅ Admin user created: admin@capitalupfitters.com / CapUpfit2024!')
    } else {
      console.log('⏭️  Admin user already exists')
    }
  } catch (err) {
    console.error('❌ Failed to create admin:', err)
  }

  // ── Seed Services ──────────────────────────────────────────────────
  const services = [
    {
      title: 'Spray-On Bedliners (Patriot Liner)',
      slug: 'bedliner',
      shortDescription:
        'Military-grade spray-on bedliner protection. Authorized Patriot Liner dealer — lifetime warranty included.',
      category: 'retail' as const,
      sortOrder: 1,
    },
    {
      title: 'Hitches & Towing',
      slug: 'hitches',
      shortDescription:
        'Expert hitch installation — Stealth Hitches, B&W Turnover Balls, weight distribution systems, and brake controllers.',
      category: 'retail' as const,
      sortOrder: 2,
    },
    {
      title: 'Ceramic Coating & PPF',
      slug: 'ceramic-coating',
      shortDescription:
        'Professional ceramic coating and paint protection film. Multi-year hydrophobic protection for paint, wheels, and trim.',
      category: 'retail' as const,
      sortOrder: 3,
    },
    {
      title: 'Undercoating & Rust Protection',
      slug: 'undercoating',
      shortDescription:
        'Rubberized undercoating and rust inhibitor treatments. Protect your vehicle from road salt, moisture, and corrosion.',
      category: 'retail' as const,
      sortOrder: 4,
    },
    {
      title: 'Tonneau Covers',
      slug: 'tonneau',
      shortDescription:
        'Hard and soft tonneau covers professionally installed. Protect your cargo and improve fuel economy.',
      category: 'retail' as const,
      sortOrder: 5,
    },
    {
      title: 'Running Boards & Steps',
      slug: 'running-boards',
      shortDescription:
        'Factory-quality running boards and side steps. Custom fit for trucks and SUVs — AMP Research, Lund, and more.',
      category: 'retail' as const,
      sortOrder: 6,
    },
    {
      title: 'Commercial Vehicle Wraps',
      slug: 'commercial-wraps',
      shortDescription:
        'Full and partial commercial vehicle wraps. Turn your fleet into mobile advertising — design to installation.',
      category: 'fleet' as const,
      sortOrder: 7,
    },
  ]

  for (const svc of services) {
    try {
      const existing = await payload.find({
        collection: 'services',
        where: { slug: { equals: svc.slug } },
      })
      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'services',
          data: {
            ...svc,
            _status: 'published',
            description: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', text: svc.shortDescription, version: 1 }],
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
            geoTags: [
              { city: 'Rockville' },
              { city: 'Bethesda' },
              { city: 'Silver Spring' },
              { city: 'Gaithersburg' },
            ],
          },
        })
        console.log(`✅ Service: ${svc.title}`)
      } else {
        console.log(`⏭️  Service already exists: ${svc.title}`)
      }
    } catch (err) {
      console.error(`❌ Service "${svc.title}":`, err)
    }
  }

  // ── Seed Geo Pages ─────────────────────────────────────────────────
  const geoPages = [
    { city: 'Rockville', slug: 'rockville-md' },
    { city: 'Bethesda', slug: 'bethesda-md' },
    { city: 'Silver Spring', slug: 'silver-spring-md' },
    { city: 'Gaithersburg', slug: 'gaithersburg-md' },
  ]

  for (const geo of geoPages) {
    try {
      const existing = await payload.find({
        collection: 'geo-pages',
        where: { slug: { equals: geo.slug } },
      })
      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'geo-pages',
          data: {
            city: geo.city,
            state: 'MD',
            slug: geo.slug,
            heroHeadline: `Vehicle Upfitting in ${geo.city} MD`,
            _status: 'published',
            content: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: `Capital Upfitters is proud to serve ${geo.city}, MD and surrounding areas. Visit us at 12019 Nebel Street, Rockville — just minutes away.`,
                        version: 1,
                      },
                    ],
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
            meta: {
              title: `Vehicle Upfitting in ${geo.city} MD | Capital Upfitters`,
              description: `Capital Upfitters serves ${geo.city}, MD with bedliners, hitches, ceramic coatings, and fleet upfitting services. 30+ years experience. Call (301) 304-1419.`,
            },
          },
        })
        console.log(`✅ Geo Page: ${geo.city}`)
      } else {
        console.log(`⏭️  Geo page already exists: ${geo.city}`)
      }
    } catch (err) {
      console.error(`❌ Geo page "${geo.city}":`, err)
    }
  }

  // ── Seed Testimonials ──────────────────────────────────────────────
  const testimonials = [
    {
      name: 'Mike R.',
      company: 'Rockville Fleet Services',
      review:
        'Capital Upfitters did our entire fleet — bedliners and ladder racks on 15 trucks. Everything was done on time and the quality is outstanding.',
      rating: 5 as unknown as never,
      featured: true,
    },
    {
      name: 'Sarah T.',
      review:
        'Got a Patriot Liner bedliner on my F-150. The finish is perfect and they were done in about 2 hours. Highly recommend.',
      rating: 5 as unknown as never,
      featured: true,
    },
    {
      name: 'James K.',
      company: 'Bethesda Landscaping',
      review:
        'We needed a Stealth Hitch for the company SUV — zero visible hardware. The install was clean and professional. Will be back for ceramic coating.',
      rating: 5 as unknown as never,
      featured: true,
    },
  ]

  for (const t of testimonials) {
    try {
      const existing = await payload.find({
        collection: 'testimonials',
        where: { name: { equals: t.name } },
      })
      if (existing.docs.length === 0) {
        await payload.create({ collection: 'testimonials', data: { ...t, _status: 'published' } })
        console.log(`✅ Testimonial: ${t.name}`)
      } else {
        console.log(`⏭️  Testimonial already exists: ${t.name}`)
      }
    } catch (err) {
      console.error(`❌ Testimonial "${t.name}":`, err)
    }
  }

  // ── Seed FAQs ──────────────────────────────────────────────────────
  const faqs = [
    {
      question: 'How long does a spray-on bedliner take?',
      category: 'services' as const,
      sortOrder: 1,
    },
    {
      question: 'Do you offer fleet pricing?',
      category: 'fleet' as const,
      sortOrder: 2,
    },
    {
      question: 'What warranty do Patriot Liner bedliners come with?',
      category: 'warranty' as const,
      sortOrder: 3,
    },
    {
      question: 'Can I drop off my vehicle and pick it up later?',
      category: 'scheduling' as const,
      sortOrder: 4,
    },
    {
      question: 'Do you work on personal and commercial vehicles?',
      category: 'general' as const,
      sortOrder: 5,
    },
  ]

  for (const faq of faqs) {
    try {
      const existing = await payload.find({
        collection: 'faqs',
        where: { question: { equals: faq.question } },
      })
      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'faqs',
          data: {
            ...faq,
            _status: 'published',
            answer: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'Please contact us for details — (301) 304-1419 or CapitalUpfitters@gmail.com.',
                        version: 1,
                      },
                    ],
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
          },
        })
        console.log(`✅ FAQ: ${faq.question}`)
      } else {
        console.log(`⏭️  FAQ already exists: ${faq.question}`)
      }
    } catch (err) {
      console.error(`❌ FAQ:`, err)
    }
  }

  console.log('\n🎉 Seed complete!')
  process.exit(0)
}

seed()
