# PRD — iMagine Store (Apple Reseller) Website

## Original problem statement
Build a polished, responsive multi-page Imagine Store Apple reseller website. Prioritise retail-first homepage, Shop, category/device landing pages, separate product quote and repair quote wizards, Repairs, Accessories, About, Contact, working navigation. Only verified business info from www.imaginestore.co.za; clearly-labelled placeholders where unavailable. Use attached logo. Apple-inspired but distinct; white/light-grey/dark-grey with #FF7A00 accents. Repairs prominent but visually secondary to shopping. Parallax edit section, cool and aesthetic.

## User decisions (2026-09-04)
- Products/pricing: clearly-labelled placeholders ("Price on request").
- Backend: product/repair quote submissions + contact form saved to MongoDB.
- Look: Apple-inspired, airy, large typography, subtle parallax.
- Award-level directive: kinetic hero with masked line reveal, numbered manifesto chapters, slow editorial marquee, framer-motion reveals, lenis smooth scrolling, parallax/3D hero moment.

## Architecture
- Frontend: React 19 + react-router-dom 7 + framer-motion 11 + lenis + Tailwind. Pages in /app/frontend/src/pages, shared components in /app/frontend/src/components, catalogue data in /app/frontend/src/lib/data.js, API client in /app/frontend/src/lib/api.js. Logo at /app/frontend/public/assets/logo.png.
- Backend: FastAPI (/app/backend/server.py), MongoDB via motor. Collections: quotes (type product|repair, reference IMQ-/IMR-), contact_messages (IMC-).
- Endpoints: GET /api/, POST /api/quotes/product, POST /api/quotes/repair, GET /api/quotes/repair/{reference} (status lookup), POST /api/contact.

## Verified business info used
- iMagine Store (Pty) Ltd, est. 2014, Apple Reseller & leading KZN Apple Service Provider, Westville Durban.
- Philosophy "Educate. Innovate. Entertain."; represents Apple, Adobe, Promise; software dev & IT consultancy; on-site/fleet/education support; Facebook facebook.com/imaginestoreza.
- Phone/email/hours NOT publicly verified → shown as labelled placeholders on Contact page.

## Implemented (2026-09-04)
- Home: kinetic masked-line hero with 3D mouse-tilt + scroll parallax product frame, floating glass badges, editorial marquees, category rail, "The Parallax Edit" layered scroll section, numbered manifesto chapters (01–04), repairs band, final CTA.
- Shop: search + category filter pills, product cards with "Price on request" badges → prefilled quote wizard.
- Category landing pages: /shop/iphone|mac|ipad|watch with hero, marquee, product grid.
- Accessories page with grid + quote CTAs.
- Product quote wizard (4 steps, trade-in toggle, add-ons, summary, DB submit, reference code).
- Repair quote wizard (4 steps, device/issue/serial/service-mode, DB submit, ticket code).
- Repairs page: status lookup by IMR- reference (live DB query), verified services, device coverage.
- About page (verified story, values), Contact page (form → DB, verified location/Facebook, placeholder-labelled phone/email/hours).
- Lenis momentum scrolling, glass sticky nav, mobile drawer menu, data-testids throughout.

## Backlog
- P1: Real product catalogue & pricing once client supplies it; real phone/email/hours.
- P1: Admin view of quote/contact submissions.
- P2: Email notifications on submissions (Resend).
- P2: Product detail pages per SKU; trade-in calculator.
- P2: Blog/news section; store locator map embed.

## Testing notes
- curl verified: product quote, repair quote, repair status lookup, contact, email validation (422).
- Screenshot verified: home hero/marquee/parallax/repairs band, shop filters, full product wizard flow (reference IMQ-0091BD returned).
