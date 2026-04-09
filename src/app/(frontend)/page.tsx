import { getPayloadClient } from '@/lib/payload-client'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  let stats = {
    services: 0,
    geoPages: 0,
    testimonials: 0,
    faqs: 0,
    leads: 0,
    newLeads: 0,
    gallery: 0,
    users: 0,
  }
  let dbConnected = false

  try {
    const payload = await getPayloadClient()

    const [svcs, geo, testimonials, faqs, leads, gallery, users] = await Promise.all([
      payload.find({ collection: 'services', limit: 0, depth: 0 }),
      payload.find({ collection: 'geo-pages', limit: 0, depth: 0 }),
      payload.find({ collection: 'testimonials', limit: 0, depth: 0 }),
      payload.find({ collection: 'faqs', limit: 0, depth: 0 }),
      payload.find({ collection: 'leads', limit: 0, depth: 0 }),
      payload.find({ collection: 'gallery', limit: 0, depth: 0 }),
      payload.find({ collection: 'users', limit: 0, depth: 0 }),
    ])

    const newLeads = await payload.find({
      collection: 'leads',
      where: { status: { equals: 'new' } },
      limit: 0,
      depth: 0,
    })

    stats = {
      services: svcs.totalDocs,
      geoPages: geo.totalDocs,
      testimonials: testimonials.totalDocs,
      faqs: faqs.totalDocs,
      leads: leads.totalDocs,
      newLeads: newLeads.totalDocs,
      gallery: gallery.totalDocs,
      users: users.totalDocs,
    }
    dbConnected = true
  } catch {
    dbConnected = false
  }

  const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://capital-upfitters-frontend.vercel.app'

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Capital Upfitters CMS — Dashboard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800;900&family=Inter:wght@400;500;600&display=swap" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          :root {
            --navy: #203055;
            --dark: #111827;
            --surface: #1a2742;
            --border: rgba(255,255,255,0.08);
            --text: #f9fafb;
            --muted: rgba(255,255,255,0.45);
            --accent: #3b82f6;
            --green: #22c55e;
            --red: #ef4444;
            --amber: #f59e0b;
          }
          body { background: var(--dark); color: var(--text); font-family: 'Inter', sans-serif; min-height: 100vh; }
          .page { max-width: 1100px; margin: 0 auto; padding: 48px 24px; }

          /* Header */
          .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 48px; flex-wrap: wrap; gap: 16px; }
          .logo { display: flex; align-items: center; gap: 12px; }
          .logo-mark { width: 40px; height: 40px; background: var(--navy); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
          .logo-name { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
          .logo-name span { color: var(--accent); }
          .header-ctas { display: flex; gap: 10px; }
          .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 9999px; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.15s; }
          .btn-primary { background: var(--navy); color: #fff; border: 1px solid transparent; }
          .btn-primary:hover { background: #2a3d6a; }
          .btn-ghost { background: transparent; color: var(--text); border: 1px solid var(--border); }
          .btn-ghost:hover { border-color: rgba(255,255,255,0.25); }

          /* DB Status */
          .db-status { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 32px; }
          .db-ok { background: rgba(34,197,94,0.12); color: var(--green); border: 1px solid rgba(34,197,94,0.25); }
          .db-err { background: rgba(239,68,68,0.12); color: var(--red); border: 1px solid rgba(239,68,68,0.25); }
          .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

          /* Stats grid */
          .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 40px; }
          .stat { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; text-align: center; text-decoration: none; color: inherit; transition: all 0.15s; }
          .stat:hover { border-color: rgba(255,255,255,0.2); }
          .stat-val { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 900; letter-spacing: -0.02em; color: var(--text); display: block; }
          .stat-val.alert { color: var(--amber); }
          .stat-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; display: block; margin-top: 4px; }

          /* Quick links */
          .section-title { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; }
          .links { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-bottom: 40px; }
          .link-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; text-decoration: none; color: inherit; display: flex; align-items: center; gap: 10px; transition: all 0.15s; }
          .link-card:hover { border-color: rgba(255,255,255,0.2); }
          .link-icon { font-size: 18px; }
          .link-text strong { display: block; font-size: 13px; font-weight: 600; }
          .link-text span { font-size: 11px; color: var(--muted); }

          /* API table */
          .api-table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .api-table th { text-align: left; font-weight: 600; color: var(--muted); padding: 8px 12px; border-bottom: 1px solid var(--border); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; }
          .api-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); }
          .api-table tr:last-child td { border-bottom: none; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
          .badge-get { background: rgba(34,197,94,0.15); color: var(--green); }
          .badge-post { background: rgba(59,130,246,0.15); color: var(--accent); }
          .code { font-family: monospace; font-size: 12px; color: rgba(255,255,255,0.7); }

          /* Footer */
          .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
          .footer-text { font-size: 12px; color: var(--muted); }
          .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 32px; }
        `}</style>
      </head>
      <body>
        <div className="page">

          {/* Header */}
          <div className="header">
            <div className="logo">
              <div className="logo-mark">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <div className="logo-name">Capital <span>Upfitters</span></div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>Content Management System</div>
              </div>
            </div>
            <div className="header-ctas">
              <a href={FRONTEND_URL} target="_blank" rel="noopener" className="btn btn-ghost">↗ Live Site</a>
              <a href="/admin" className="btn btn-primary">Open Admin →</a>
            </div>
          </div>

          {/* DB Status */}
          <div className={`db-status ${dbConnected ? 'db-ok' : 'db-err'}`}>
            <div className="dot" />
            {dbConnected ? 'Database connected — Neon PostgreSQL (pooled)' : 'Database connection failed — check DATABASE_URL'}
          </div>

          {/* Stats */}
          <div style={{ marginBottom: 8 }}><div className="section-title">Content Overview</div></div>
          <div className="stats">
            <a href="/admin/collections/services" className="stat">
              <span className="stat-val">{stats.services}</span>
              <span className="stat-label">Services</span>
            </a>
            <a href="/admin/collections/geo-pages" className="stat">
              <span className="stat-val">{stats.geoPages}</span>
              <span className="stat-label">Geo Pages</span>
            </a>
            <a href="/admin/collections/testimonials" className="stat">
              <span className="stat-val">{stats.testimonials}</span>
              <span className="stat-label">Testimonials</span>
            </a>
            <a href="/admin/collections/faqs" className="stat">
              <span className="stat-val">{stats.faqs}</span>
              <span className="stat-label">FAQs</span>
            </a>
            <a href="/admin/collections/gallery" className="stat">
              <span className="stat-val">{stats.gallery}</span>
              <span className="stat-label">Gallery</span>
            </a>
            <a href="/admin/collections/media" className="stat">
              <span className="stat-val">—</span>
              <span className="stat-label">Media</span>
            </a>
            <a href="/admin/collections/leads" className="stat">
              <span className={`stat-val ${stats.newLeads > 0 ? 'alert' : ''}`}>{stats.newLeads}</span>
              <span className="stat-label">New Leads</span>
            </a>
            <a href="/admin/collections/leads" className="stat">
              <span className="stat-val">{stats.leads}</span>
              <span className="stat-label">Total Leads</span>
            </a>
          </div>

          {/* Quick Actions */}
          <div className="section-title">Quick Actions</div>
          <div className="links">
            <a href="/admin/collections/services/create" className="link-card">
              <span className="link-icon">➕</span>
              <div className="link-text"><strong>Add Service</strong><span>Create a new upfitting service page</span></div>
            </a>
            <a href="/admin/collections/geo-pages/create" className="link-card">
              <span className="link-icon">📍</span>
              <div className="link-text"><strong>Add Geo Page</strong><span>Target a new city for local SEO</span></div>
            </a>
            <a href="/admin/collections/testimonials/create" className="link-card">
              <span className="link-icon">⭐</span>
              <div className="link-text"><strong>Add Testimonial</strong><span>Add a customer review</span></div>
            </a>
            <a href="/admin/collections/gallery/create" className="link-card">
              <span className="link-icon">📷</span>
              <div className="link-text"><strong>Add Gallery Item</strong><span>Upload before/after photos</span></div>
            </a>
            <a href="/admin/collections/media/create" className="link-card">
              <span className="link-icon">🖼️</span>
              <div className="link-text"><strong>Upload Media</strong><span>Add images for service pages</span></div>
            </a>
            <a href="/admin/globals/business-settings" className="link-card">
              <span className="link-icon">⚙️</span>
              <div className="link-text"><strong>Business Settings</strong><span>Phone, hours, social links</span></div>
            </a>
            <a href="/admin/collections/leads" className="link-card">
              <span className="link-icon">📬</span>
              <div className="link-text"><strong>View Leads</strong><span>{stats.newLeads} new requests need follow-up</span></div>
            </a>
            <a href="/admin/collections/faqs/create" className="link-card">
              <span className="link-icon">❓</span>
              <div className="link-text"><strong>Add FAQ</strong><span>Improve search rich results</span></div>
            </a>
          </div>

          {/* API Reference */}
          <div className="section-title">Public API Endpoints</div>
          <div className="card">
            <table className="api-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['GET', '/api/public/services', 'All published services'],
                  ['GET', '/api/public/services/[slug]', 'Single service by slug'],
                  ['GET', '/api/public/geopages', 'All published geo pages'],
                  ['GET', '/api/public/geopages/[slug]', 'Single geo page by slug'],
                  ['GET', '/api/public/testimonials', 'All published testimonials'],
                  ['GET', '/api/public/faqs', 'All published FAQs'],
                  ['GET', '/api/public/gallery', 'All published gallery items'],
                  ['GET', '/api/public/settings', 'Business settings (global)'],
                  ['POST', '/api/public/submit-lead', 'Submit a quote/contact form'],
                  ['GET', '/api/health', 'DB connection + pool status'],
                ].map(([method, path, desc]) => (
                  <tr key={path}>
                    <td><span className={`badge ${method === 'GET' ? 'badge-get' : 'badge-post'}`}>{method}</span></td>
                    <td><a href={SITE_URL + path} target="_blank" rel="noopener" className="code" style={{ color: 'rgba(255,255,255,0.7)' }}>{path}</a></td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="footer-text">
              Payload CMS 3.80.0 · Next.js 15 · Neon PostgreSQL · Vercel
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="/api/health" target="_blank" className="footer-text" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Health →</a>
              <a href={FRONTEND_URL + '/sitemap.xml'} target="_blank" className="footer-text" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Sitemap →</a>
            </div>
          </div>

        </div>
      </body>
    </html>
  )
}
