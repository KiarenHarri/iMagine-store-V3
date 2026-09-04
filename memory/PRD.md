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

## Implemented (2026-09-04, update 2 — Google Auth)
- Emergent-managed Google sign-in: Sign-in button in nav + Account page, OAuth via auth.emergentagent.com, session_id exchange at POST /api/auth/session (backend-only call), httpOnly session_token cookie (7 days, secure, samesite=none).
- Auth endpoints: POST /api/auth/session, GET /api/auth/me (cookie then Bearer fallback), POST /api/auth/logout, GET /api/quotes/mine (protected).
- Quote/repair submissions attach user_id when signed in (withCredentials); wizards prefill name/email from the signed-in Google profile.
- Account page (/account, auth-gated): Google profile card, quotes & repair history, logout. AuthCallback handles session_id via useLocation().hash (race-safe); AuthProvider skips /me on OAuth return.
- CORS locked to frontend origin (credentials-enabled).

## Implemented (2026-09-04, update 3 — Email notifications)
- Emergent-managed Resend email via integration proxy (/app/backend/mailer.py with guardrail gate _assert_safe_email on every send).
- Team notification email on every product quote, repair quote and contact submission (all fields, escaped, branded template).
- Customer confirmation email to the submitter with their reference code (per user choice).
- Non-blocking fire-and-forget via asyncio.create_task so submissions never fail on email errors.
- TEAM_NOTIFY_EMAIL currently = delivered@resend.dev (TEST INBOX — replace with the real team address when provided; user selected "will reply with address" but none given yet).
- Verified: 6 sends (team + customer × 3 flows) returned HTTP 202 from the proxy.

## Testing notes
- curl verified: product quote, repair quote, repair status lookup, contact, email validation (422).
- Auth verified: /auth/me 200 with Bearer + 401 without; quote attaches user_id; /quotes/mine returns user's quotes; logout invalidates Bearer session (401 after); browser test with session cookie loads Account with history, logout returns to sign-in prompt. Full Google OAuth round-trip not exercised (requires a real Google account click-through) — test user was seeded in MongoDB per /app/auth_testing.md.
- Screenshot verified: home hero/marquee/parallax/repairs band, shop filters, full product wizard flow (reference IMQ-0091BD returned), account page.
