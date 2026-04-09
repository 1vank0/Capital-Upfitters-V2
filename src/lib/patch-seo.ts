/**
 * SEO Patch Script — run via: npm run patch:seo
 *
 * Fixes all missing meta.title, meta.description, relatedServices,
 * and settings fields discovered during SEO audit (April 2026).
 *
 * Run ONCE against the live database. Safe to run again — it skips
 * records that already have meta filled.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

// ── SEO data per service ──────────────────────────────────────────────────────

const SERVICE_SEO: Record<string, { title: string; description: string }> = {
  bedliner: {
    title: 'Spray-On Bedliner Installation in Rockville, MD | Capital Upfitters',
    description:
      'Authorized Patriot Liner dealer serving Rockville, Bethesda & the DMV. Spray-on bedliners with a lifetime warranty. Same-week installation. Call (301) 304-1419.',
  },
  hitches: {
    title: 'Trailer Hitch Installation Near Rockville, MD | Capital Upfitters',
    description:
      'Professional trailer hitch and towing equipment installation. All makes and models. CURT, Draw-Tite, Reese brands. Same-day install available. Call (301) 304-1419.',
  },
  'ceramic-coating': {
    title: 'Ceramic Coating & Paint Protection Film | Capital Upfitters Rockville',
    description:
      'IGL Coatings & System X certified applicators in Rockville, MD. Ceramic coatings and PPF for cars, trucks, and SUVs. Free estimates. Call (301) 304-1419.',
  },
  undercoating: {
    title: 'Undercoating & Rust Protection Services | Capital Upfitters Rockville',
    description:
      'Spray-on undercoating and rust-proofing for trucks, SUVs, and fleet vehicles in Rockville, MD. Protect against DMV road salt. Call (301) 304-1419.',
  },
  tonneau: {
    title: 'Tonneau Cover Installation Rockville, MD | Capital Upfitters',
    description:
      'Retractable, folding, and hard tonneau cover installation for all pickup trucks. Huge selection in stock. Same-week fitting. Call (301) 304-1419.',
  },
  'running-boards': {
    title: 'Running Boards & Nerf Bars | Capital Upfitters Rockville MD',
    description:
      'Custom running board and nerf bar installation for trucks and SUVs in Rockville, MD. OEM and aftermarket brands. Free estimates. Call (301) 304-1419.',
  },
  'commercial-wraps': {
    title: 'Commercial Vehicle Wraps & Fleet Graphics | Capital Upfitters Rockville',
    description:
      'Full and partial vehicle wraps, fleet graphics, and vehicle branding for Rockville, MD businesses. Turn your fleet into a moving billboard. Call (301) 304-1419.',
  },
}

// ── SEO data per geo page ─────────────────────────────────────────────────────

const GEO_SEO: Record<string, { title: string; description: string }> = {
  'rockville-md': {
    title: 'Vehicle Upfitting in Rockville, MD | Capital Auto Upfitters',
    description:
      'Capital Upfitters is Rockville\'s #1 vehicle upfitting shop. Bedliners, hitches, ceramic coatings, fleet solutions. Authorized Patriot Liner dealer. Call (301) 304-1419.',
  },
  'bethesda-md': {
    title: 'Vehicle Upfitting Near Bethesda, MD | Capital Upfitters Rockville',
    description:
      'Serving Bethesda vehicle owners from our Rockville location — just 8 minutes away. Bedliners, hitches, ceramic coatings & more. Call (301) 304-1419.',
  },
  'silver-spring-md': {
    title: 'Vehicle Upfitting Near Silver Spring, MD | Capital Upfitters',
    description:
      'Capital Upfitters serves Silver Spring and all of eastern Montgomery County. Professional bedliners, hitches, and ceramic coatings. Call (301) 304-1419.',
  },
  'gaithersburg-md': {
    title: 'Vehicle Upfitting Near Gaithersburg, MD | Capital Upfitters',
    description:
      'Serving Gaithersburg vehicle owners from our Rockville facility — 12 minutes on I-270. Bedliners, hitches, ceramic coatings, fleet solutions. Call (301) 304-1419.',
  },
}

async function patchSEO() {
  console.log('\n🔧 SEO Patch Script — Capital Upfitters CMS\n')

  const payload = await getPayload({ config })

  // ── 1. Patch Services ───────────────────────────────────────────────────────
  console.log('── Patching Services ─────────────────────────────────')

  const services = await payload.find({
    collection: 'services',
    limit: 50,
    depth: 0,
  })

  for (const svc of services.docs) {
    const seoData = SERVICE_SEO[svc.slug]
    if (!seoData) {
      console.log(`  ⏭️  Unknown slug, skipping: ${svc.slug}`)
      continue
    }

    const hasTitle = svc.meta?.title
    const hasDesc = svc.meta?.description

    if (hasTitle && hasDesc) {
      console.log(`  ⏭️  Already has meta: ${svc.slug}`)
      continue
    }

    await payload.update({
      collection: 'services',
      id: svc.id,
      data: {
        meta: {
          ...svc.meta,
          title: hasTitle || seoData.title,
          description: hasDesc || seoData.description,
        },
      },
    })
    console.log(`  ✅ Patched: ${svc.slug}`)
  }

  // ── 2. Patch Geo Pages ──────────────────────────────────────────────────────
  console.log('\n── Patching Geo Pages ────────────────────────────────')

  const geoPages = await payload.find({
    collection: 'geo-pages',
    limit: 50,
    depth: 0,
  })

  // Get all service IDs for relatedServices
  const allServices = await payload.find({
    collection: 'services',
    limit: 50,
    depth: 0,
  })
  const allServiceIds = allServices.docs.map((s) => s.id)

  for (const page of geoPages.docs) {
    const seoData = GEO_SEO[page.slug]
    if (!seoData) {
      console.log(`  ⏭️  Unknown slug, skipping: ${page.slug}`)
      continue
    }

    const updates: Record<string, unknown> = {}

    if (!page.meta?.title || !page.meta?.description) {
      updates.meta = {
        ...page.meta,
        title: page.meta?.title || seoData.title,
        description: page.meta?.description || seoData.description,
      }
    }

    // Add all services as relatedServices if empty
    const existingRelated = Array.isArray(page.relatedServices)
      ? page.relatedServices
      : []
    if (existingRelated.length === 0) {
      updates.relatedServices = allServiceIds
    }

    if (Object.keys(updates).length === 0) {
      console.log(`  ⏭️  Already complete: ${page.slug}`)
      continue
    }

    await payload.update({
      collection: 'geo-pages',
      id: page.id,
      data: updates,
    })
    console.log(`  ✅ Patched: ${page.slug}`)
  }

  // ── 3. Patch Testimonials — link to services ────────────────────────────────
  console.log('\n── Patching Testimonials ─────────────────────────────')

  const testimonials = await payload.find({
    collection: 'testimonials',
    limit: 20,
    depth: 0,
  })

  const bedliner = allServices.docs.find((s) => s.slug === 'bedliner')
  const ceramic = allServices.docs.find((s) => s.slug === 'ceramic-coating')
  const hitches = allServices.docs.find((s) => s.slug === 'hitches')

  const testimonialServiceMap: Record<string, number | undefined> = {
    'Mike R.': bedliner?.id,
    'Sarah T.': ceramic?.id,
    'James K.': hitches?.id,
  }

  for (const t of testimonials.docs) {
    const serviceId = testimonialServiceMap[t.name]
    if (!serviceId) {
      console.log(`  ⏭️  No service mapped for: ${t.name}`)
      continue
    }
    if (t.service) {
      console.log(`  ⏭️  Already linked: ${t.name}`)
      continue
    }
    await payload.update({
      collection: 'testimonials',
      id: t.id,
      data: { service: serviceId },
    })
    console.log(`  ✅ Linked ${t.name} → ${t.name === 'Mike R.' ? 'bedliner' : t.name === 'Sarah T.' ? 'ceramic-coating' : 'hitches'}`)
  }

  // ── 4. Patch Business Settings ──────────────────────────────────────────────
  console.log('\n── Patching Business Settings ────────────────────────')

  const settings = await payload.findGlobal({ slug: 'business-settings' })

  const settingsUpdates: Record<string, unknown> = {}

  if (!settings.socialLinks?.google) {
    settingsUpdates.socialLinks = {
      ...settings.socialLinks,
      google: 'https://www.google.com/maps/place/Capital+Auto+Upfitters+%26+Protective+Coatings/@39.0587,-77.1214,17z/',
      yelp: 'https://www.yelp.com/biz/capital-auto-upfitters-rockville',
    }
  }

  if (Object.keys(settingsUpdates).length > 0) {
    await payload.updateGlobal({ slug: 'business-settings', data: settingsUpdates })
    console.log('  ✅ Patched: social links')
  } else {
    console.log('  ⏭️  Settings already complete')
  }

  console.log('\n🎉 SEO patch complete.\n')
  process.exit(0)
}

patchSEO().catch((err) => {
  console.error('\n❌ Patch failed:', err)
  process.exit(1)
})
