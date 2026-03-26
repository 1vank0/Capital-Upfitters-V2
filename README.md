# Capital Upfitters — Payload CMS Backend

Production-ready headless CMS for Capital Upfitters, replacing the static site with a real CMS backend + API.

## Stack

- **Next.js 15** (App Router)
- **Payload CMS 3** (latest stable)
- **PostgreSQL** (Neon / Supabase)
- **TypeScript**

---

## Quick Start (Local Development)

### 1. Prerequisites

- Node.js 20+
- A PostgreSQL database (Neon free tier works perfectly)

### 2. Install

```bash
cd capital-upfitters-cms
npm install
```

### 3. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URI=postgresql://user:password@your-neon-host.neon.tech/capital_upfitters?sslmode=require
PAYLOAD_SECRET=generate-a-random-64-char-string-here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

**Generate a secret:**
```bash
openssl rand -hex 32
```

### 4. Run

```bash
npm run dev
```

- **Admin panel:** http://localhost:3000/admin
- **API root:** http://localhost:3000/api
- **Public API:** http://localhost:3000/api/public/services

On first run, Payload auto-creates all database tables.
Create your first admin user at `/admin`.

### 5. Seed Sample Data (Optional)

```bash
npx tsx src/lib/seed.ts
```

Creates:
- Admin user (`admin@capitalupfitters.com` / `CapUpfit2024!`)
- 7 services (bedliner, hitches, ceramic coating, etc.)
- 4 geo pages (Rockville, Bethesda, Silver Spring, Gaithersburg)
- 3 testimonials
- 5 FAQs

---

## Neon Database Setup

1. Go to [neon.tech](https://neon.tech) → Create free account
2. Create a new project: `capital-upfitters`
3. Copy the connection string (looks like `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)
4. Paste it as `DATABASE_URI` in your `.env`

---

## Collections

| Collection     | Public Read | Public Create | Admin Only |
|----------------|:-----------:|:------------:|:----------:|
| Services       | ✅          | ❌            | Write      |
| Geo Pages      | ✅          | ❌            | Write      |
| Testimonials   | ✅          | ❌            | Write      |
| FAQs           | ✅          | ❌            | Write      |
| Gallery        | ✅          | ❌            | Write      |
| Leads          | ❌          | ✅            | Read/Write |
| Media          | ✅          | ❌            | Write      |
| Users          | ❌          | ❌            | Full       |

**Global:** Business Settings (public read, admin update)

---

## Public API Endpoints

| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/api/public/services`            | All published services             |
| GET    | `/api/public/services?category=fleet` | Services filtered by category  |
| GET    | `/api/public/services/[slug]`     | Single service by slug             |
| GET    | `/api/public/geopages/[slug]`     | Single geo page by slug            |
| GET    | `/api/public/testimonials`        | All testimonials                   |
| GET    | `/api/public/testimonials?featured=true` | Featured testimonials only  |
| GET    | `/api/public/faqs`                | All FAQs                           |
| GET    | `/api/public/faqs?category=fleet` | FAQs filtered by category          |
| GET    | `/api/public/gallery`             | All gallery items                  |
| GET    | `/api/public/gallery?category=bedliner` | Gallery by category          |
| GET    | `/api/public/settings`            | Business settings                  |
| POST   | `/api/public/submit-lead`         | Submit a contact/quote form        |

**Lead submission body:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "301-555-0100",
  "vehicle": "2024 Ford F-150",
  "requestedServices": ["bedliner", "tonneau"],
  "message": "Looking for a quote on bedliner + tonneau cover.",
  "leadType": "retail",
  "source": "quote-page"
}
```

---

## Static Frontend Integration

The existing static site connects via `cms-integration.js`. Update the `CMS_URL` constant:

```js
const CMS_URL = 'https://your-deployed-cms.vercel.app'
```

All forms with `data-cms-form` attributes will auto-submit to the Leads collection.

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Capital Upfitters CMS — initial commit"
git remote add origin https://github.com/YOUR_USER/capital-upfitters-cms.git
git push -u origin main
```

### 2. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the GitHub repo
3. Framework: **Next.js**
4. Add environment variables:
   - `DATABASE_URI` — your Neon connection string
   - `PAYLOAD_SECRET` — your random secret
   - `NEXT_PUBLIC_SERVER_URL` — `https://your-project.vercel.app`
5. Deploy

### 3. First-Time Setup

After deploy:
1. Visit `https://your-project.vercel.app/admin`
2. Create your first admin account
3. Or run the seed script locally pointing to the production DB

---

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Generate TypeScript types
npm run generate:types

# Run seed
npx tsx src/lib/seed.ts
```

---

## Project Structure

```
capital-upfitters-cms/
├── src/
│   ├── access/                    # Access control helpers
│   │   ├── isAdmin.ts
│   │   ├── isPublicRead.ts
│   │   └── publicReadAdminWrite.ts
│   ├── app/
│   │   ├── (frontend)/            # Minimal frontend root
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── (payload)/             # Payload admin panel
│   │   │   ├── admin/
│   │   │   │   ├── [[...segments]]/
│   │   │   │   │   ├── not-found.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── importMap.js
│   │   │   ├── api/
│   │   │   │   ├── [...slug]/route.ts
│   │   │   │   └── graphql/route.ts
│   │   │   ├── custom.scss
│   │   │   └── layout.tsx
│   │   └── api/
│   │       └── public/            # Custom public API routes
│   │           ├── services/
│   │           │   ├── route.ts
│   │           │   └── [slug]/route.ts
│   │           ├── geopages/
│   │           │   └── [slug]/route.ts
│   │           ├── testimonials/route.ts
│   │           ├── faqs/route.ts
│   │           ├── gallery/route.ts
│   │           ├── settings/route.ts
│   │           └── submit-lead/route.ts
│   ├── collections/               # Payload collection schemas
│   │   ├── FAQs.ts
│   │   ├── Gallery.ts
│   │   ├── GeoPages.ts
│   │   ├── Leads.ts
│   │   ├── Media.ts
│   │   ├── Services.ts
│   │   ├── Testimonials.ts
│   │   └── Users.ts
│   ├── globals/
│   │   └── BusinessSettings.ts
│   ├── hooks/
│   │   └── slugField.ts           # Auto-slug generation
│   ├── lib/
│   │   ├── api.ts                 # Frontend integration helpers
│   │   ├── payload-client.ts      # Server-side Payload client
│   │   └── seed.ts                # Database seed script
│   └── payload.config.ts          # Main Payload configuration
├── .env.example
├── .gitignore
├── next.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```
