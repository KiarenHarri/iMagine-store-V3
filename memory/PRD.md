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

## Implemented (2026-09-05, update 4 — Quote status updates)
- Admin/team role: ADMIN_EMAILS env allowlist checked against Google-authenticated email; /auth/me returns is_admin; non-admins get 403 on admin endpoints.
- Team console at /admin: all product quotes, repairs and contact messages with filter tabs; status dropdown per submission (validated per type: product flow Received→Quoting→Quote sent→Confirmed→Completed; repair flow Received→Assessing→Quote sent→Approved— in repair→Ready for collection→Completed; plus Cancelled).
- PATCH /api/admin/quotes/{reference} updates status and auto-emails the customer the new status (notify_status in mailer.py).
- Customers see live progress: orange step tracker per quote on Account page, and repair status lookup on Repairs page reflects flips instantly.
- Verified: curl PATCH (200/400 invalid/403 non-admin), customer endpoint reflects flip, UI select flip + tracker render, 2 status emails HTTP 202.

## Implemented (2026-09-05, update 5 — Priced quote notes + real team inbox)
- TEAM_NOTIFY_EMAIL switched to real team inbox: seni@imaginestore.co.za.
- "Quote sent" now opens an inline editor in the team console: attach price (e.g. R 24 999) + note; saved as quote_price/quote_note on the submission.
- Customers see the quoted price card on their Account page; the status email includes price + note.
- Verified: PATCH with price/note persists and shows on /quotes/mine; UI editor → send → customer price card renders; emails HTTP 202 routed to the real inbox.

## Implemented (2026-09-05, update 6 — Accept quote, Quote PDF, 3D hero)
- Customers can accept a sent quote from their Account page (POST /api/quotes/{ref}/accept; ownership-checked by user_id or email; product → Confirmed, repair → Approved — in repair; team + customer emailed).
- Branded PDF quotations: GET /api/quotes/{ref}/pdf (reportlab, /app/backend/pdfgen.py) — dark header, item details, orange price block, footer; auth + ownership enforced (401/404 verified).
- Homepage hero iPhone is now a 3D scroll parallax edit: scroll-driven rotateY/rotateX/scale on the frame, orbiting dashed orange ring + glow layer moving at different speeds, on top of existing mouse tilt.
- Team access: user deferred — ADMIN_EMAILS keeps only test.user@example.com for now.
- Verified: accept flow (200/400 double-accept/404 ownership), valid %PDF bytes, UI accept → toast + status flip, PDF button, hero scroll frames.

## Implemented (2026-09-05, update 7 — Decline quote + Trade-in estimator)
- Decline button next to Accept on Account page (POST /api/quotes/{ref}/decline, ownership-checked, Quote sent → Cancelled; team emailed "follow up" alert; tracker renders red for cancelled).
- Trade-in estimator at /trade-in: 3-tap flow (device → generation → condition multiplier) with animated indicative range, explicit "placeholder estimate — not a store offer" disclaimer (keeps no-invented-prices rule), CTA deep-links to /quote/product?tradein=1 which pre-ticks the trade-in toggle.
- Entry links added on Shop hero and wizard step 3.
- Verified: decline 200/400/404 via curl + cancelled tracker render; estimator range math (iPhone 13/14, Good → R 4 300–R 7 700); wizard prefill confirmed.

## Implemented (2026-09-05, update 8 — Product-matched imagery + iMagine's own assets)
- Every product card now shows a photo matching its name, each visually verified: iPhone 16 Pro (titanium studio shot), iPhone 16 (blue dual-cam), iPhone 15 Pro (renamed from "iPhone 15" so the Pro photo matches), Pre-Owned iPhone (iPhone 14 Pro dark shot), MacBook Air (midnight M4), Mac mini (M4 with display), iPad Pro (with Magic Keyboard), iPad Air (with Pencil), iPad, iPad mini (handheld), Watch Series 10, Watch SE, AirPods Pro 2 (2026 studio shot).
- Apple Watch Ultra 2 and iMac cards + About page now use iMagine's OWN published device imagery from imaginestore.co.za (their Watch Ultra render, Mac family lineup, ecosystem lineup).
- Hero and category landing heroes updated to the matching hero shots.
- NOTE: iMagine publishes NO real store/team photos publicly — checked the full site. Used their own product imagery instead; real store/team photos can be dropped in when supplied.

## Implemented (2026-09-05, update 9 — Rotating 3D iPhone hero, admin email, old-site links removed, About parallax)
- Hero static image replaced with a CSS-3D iPhone (/app/frontend/src/components/Phone3D.jsx): full 360° scroll-driven rotation, front face = iOS-style lock screen (9:41, Dynamic Island, iMagine pill), back face = titanium camera photo, side buttons, orbiting dashed ring; mouse tilt layered on top.
- ayushsukhnandan28@gmail.com added to ADMIN_EMAILS — signing in with that Google account grants the Team console (/admin).
- Removed all links to the old imaginestore.co.za website (footer + contact page).
- About page blurry lineup image replaced with a crisp parallax edit: Mac family main frame + floating Watch Ultra and iPhone 16 Pro cards moving at different scroll speeds.
- Verified: hero front/back faces rotate across scroll frames; About parallax renders; footer/contact website links gone; backend healthy; is_admin true for allowlisted test admin.

## Implemented (2026-09-05, update 10 — Hero colour modes)
- Hero iPhone now has 4 titanium colour swatches (Natural, Blue, White, Black): tapping one triggers a 360° spin (motion-value tween layered on scroll rotation) and re-skins the phone — CSS-rendered titanium back with camera module (3 lenses + flash), colour-tinted lock screen wallpaper, and label under the swatches.
- Verified: swatch taps switch labels and active ring; spin completes to the recoloured front; scroll to ~180° shows the Natural Titanium CSS back.

## Implemented (2026-09-05, update 11 — Sign-in account chooser hint + hero spin sound)
- Sign-in URL now carries prompt=select_account (verified it survives the Emergent auth redirect chain to /oauth/) so Google is asked to show the account picker instead of silently re-using the last account. Note: with only ONE Google account signed into the browser, Google may still skip the chooser — that's Google-side behavior.
- Hero colour spin now plays a WebAudio click + filtered-noise whoosh (generated in code, no assets) on every colour tap.
- Fixed: Natural Titanium swatch invisible on light bg + "Now quoting" badge overlapping the swatches (badge moved up, swatches got visible rings).
- Verified: all 4 swatches clickable (Natural/Blue/White/Black labels switch), spins + sound calls run without console errors.

## Implemented (2026-09-05, update 12 — True sign-out)
- Sign-out now also revokes the Google grant for the signed-in email (GSI revoke + disableAutoSelect, loaded with the platform's Google client ID) — so the next "Continue with Google" must show the account picker instead of silently re-signing the last account. Combined with the prompt=select_account hint from update 11.
- Verified in browser: logout clears session and shows the sign-in prompt, GSI library loads and revoke executes without console errors. Final chooser behavior needs one real-account check by the user.

## Testing notes
- curl verified: product quote, repair quote, repair status lookup, contact, email validation (422).
- Auth verified: /auth/me 200 with Bearer + 401 without; quote attaches user_id; /quotes/mine returns user's quotes; logout invalidates Bearer session (401 after); browser test with session cookie loads Account with history, logout returns to sign-in prompt. Full Google OAuth round-trip not exercised (requires a real Google account click-through) — test user was seeded in MongoDB per /app/auth_testing.md.
- Screenshot verified: home hero/marquee/parallax/repairs band, shop filters, full product wizard flow (reference IMQ-0091BD returned), account page.
