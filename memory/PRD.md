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

## Implemented (2026-09-05, update 13 — Kiaren admin + admin landing)
- kiarenh666@gmail.com added to ADMIN_EMAILS; /auth/session now returns is_admin; after Google sign-in, admins land directly on /admin (all quotes/repairs/messages), customers on /account.
- RCA on persistent auto sign-in: the hosted auth page (auth.emergentagent.com) uses its own platform session (Supabase) in the browser — while signed into the Emergent platform, that session short-circuits Google entirely, which no app code can clear cross-origin. Our side is fully clean (session deleted, Google grant revoked, auto-select disabled). To see the picker: use a browser profile not signed into the Emergent platform (e.g. incognito).

## Implemented (2026-09-05, update 14 — Email & password login)
- POST /api/auth/register + /api/auth/login: bcrypt password hashing, email normalized/lowercased, unique-email enforcement, 8-char minimum, issues the same session_token cookie as Google auth so Account/quotes/admin work identically for both login types.
- Brute-force protection: login_attempts per email, 5 failures → 15-minute lockout (429). Indexes on users.email (unique) + login_attempts.
- Sign-in card on the Account page redesigned: Sign in / Create account tabs + email & password form, Google button below. Admins land on /admin either way.
- Verified: register (400 dup / 400 short pw), login sets cookie + /me works, 5×wrong → 429 lockout, UI register → auto sign-in → logout → re-login all in browser.
- Test accounts: shopper@test.com / TestPass123, uitest@example.com / UiTestPass9.

## Implemented (2026-09-05, update 15 — Forgot password, dashboard stats, iPhone 17 lineup, sales manager)
- Forgot password: "Forgot password?" link on the sign-in card → emails a 1-hour reset link (branded, Resend) → /reset-password page sets the new password; tokens single-use, TTL-indexed; unknown emails get the same response (no enumeration).
- Admin dashboard stats strip: new submissions this week, pending repairs, quote acceptance rate, active sales.
- Catalogue now leads with the iPhone 17 family — iPhone 17 Pro Max (Cosmic Orange), iPhone 17 Pro (deep blue), iPhone 17 (lavender) — with launch-window photos verified to match each model; 16 Pro/16/15 Pro/pre-owned kept.
- Sales manager: admins create sales (name, now/was prices, description, photo upload up to 3MB stored inline) in the new Sales tab; live sales render as a "This week's deals" strip on Home and Shop with strikethrough pricing and a "Grab this deal" button that prefills the quote wizard.
- Verified: reset flow end-to-end (issue → reset → reuse blocked → login with new password); stats values; sale create/list/delete + 403 for non-admin; forgot UI; sale strip + iPhone 17 grid in browser.

## Implemented (2026-09-05, update 16 — Sale scheduling)
- Sales now carry optional start/end date-times (datetime-local pickers in the Sales tab); the public deals strip and the "active sales" stat only count sales inside their window, so deals publish and expire automatically.
- Admin Sales list shows every sale (including future/past) with Live now / Scheduled / Ended chips and the schedule window; new GET /api/admin/sales/all for the unfiltered view.
- Verified: scheduled (tomorrow) and expired (yesterday) sales hidden from public /sales and the stats count, visible in admin with correct chips; user's own "iphone 17 pro" sale (with uploaded photo) shows Live now.

## Implemented (2026-09-05, update 17 — Square sale images)
- Deal cards render sale photos in a square frame (aspect-square) so 500×500 uploads fit edge-to-edge without cropping; verified with the live iphone 17 pro sale photo.

## Implemented (2026-09-05, update 18 — Real contact details)
- Contact page placeholders replaced with owner-provided details: phone +27 83 777 3051 (tappable tel:), email seni@imaginestore.co.za (mailto:), trading hours Mon–Fri 09:00–16:30, Sat & Sun closed. Phone + email also added to the footer. Stored centrally in BRAND (data.js).

## Implemented (2026-09-05, update 19 — True 3D hero phone + real back)
- Hero phone rebuilt as a genuine 3D object: titanium frame edges on all four sides (thickness visible during rotation), side buttons on the frame, photographic titanium back tinted per colour mode, Apple logo centered on the back.
- Fixed mid-rotation rendering glitch (blank slab) by adding preserve-3d through the wrapper chain; softened front glare.
- Retuned scroll mapping to two full turns (720°) so the back face with the Apple logo appears early in the scroll while the phone is fully in frame.
- Verified: front/edge/back frames all render cleanly on scroll; back shows photo + Apple logo + tinted frame.

## Implemented (2026-09-05, update 20 — Hero phone reverted to clean version)
- Removed the thick 3D edge strips and heavy multiply tint (user feedback: looked worse). Back to the clean two-face phone: front lock screen + real titanium photo back with Apple logo overlay, colour-matched frame border and side buttons, soft-light colour tint, swatches + spin + sound retained, glitch-free wrappers kept (preserve-3d fix from update 19 retained).

## Implemented (2026-09-05, update 21 — CSS-generated phone back + sale image auto-crop)
- Hero phone back is now fully code-generated (no photo): per-colour titanium gradient with brushed-metal texture, a camera plateau with three realistic layered lenses + flash + lidar dot, and the Apple logo centered. Verified at full 180° — clean and realistic.
- Sale photo uploads are auto-cropped client-side to exactly 500×500 (center square crop, canvas, JPEG 0.88) before saving; upload limit raised to 8MB pre-crop; label confirms the crop. Verified: 1400×700 upload → 500×500 stored preview.

## Implemented (2026-09-05, update 22 — Repairs blueprint image)
- Repairs page side visual replaced with the user-supplied iPhone Pro technical blueprint (/assets/blueprint.png), framed at its native 3:2 ratio so the full drawing is visible.

## Implemented (2026-09-05, update 23 — Blueprint optimization + colour-flip fix + 17 Pro Max camera)
- Blueprint image optimized: 1926KB PNG → 145KB progressive JPEG (verified 145KB transfer), lazy-loaded.
- Colour switcher now obvious: tapping a swatch flips the phone to its BACK (new colour fully visible), holds ~0.4s, then spins back to front (keyframes [0,190,190,360] with dwell). Root cause of "not working": spins always landed on the front where colour change was subtle.
- Camera module redesigned to the iPhone 17 Pro Max style: full-width camera bar with three lenses in a row + flash, LiDAR and mic on the right.
- Verified in browser: black-swatch tap shows the black 17 Pro Max-style back mid-animation; blueprint loads fast and crisp.

## Implemented (2026-09-05, update 24 — Single camera)
- Hero phone camera bar now has one large lens (iPhone Air style) with flash/sensor on the right; verified at full back view.

## Implemented (2026-09-05, update 25 — Blueprint parallax edit on Repairs)
- The blueprint is now a full-width parallax showpiece on the Repairs page ("Every repair, down to the millimetre."): blueprint-blue band, giant ghost "PRECISION" outline, scroll-driven drift + tilt on the blueprint frame, mouse-move 3D tilt, and three floating glass spec chips (Board-level diagnostics, Certified technicians, OEM-grade parts) moving at different scroll speeds. The old side image became a dark "Service modes" card.

## Implemented (2026-09-05, update 26 — Site-wide performance pass)
- Fonts moved from blocking CSS @import to preconnected <link> with display=swap; added preconnect to images.unsplash.com; proper title/meta/favicon.
- All Unsplash imagery downsized (w=1200/q=80 → w=900/q=70, ~40% lighter per image); lazy-loading added to all below-fold images (category rail, parallax layers, repairs band, About stack); blueprint already 145KB.
- Route-level code splitting: every page except Home is lazy-loaded with a branded spinner fallback, so first load ships a much smaller bundle.
- Verified: home, shop, repairs, trade-in all render after the split with no console errors.

## Testing notes
- curl verified: product quote, repair quote, repair status lookup, contact, email validation (422).
- Auth verified: /auth/me 200 with Bearer + 401 without; quote attaches user_id; /quotes/mine returns user's quotes; logout invalidates Bearer session (401 after); browser test with session cookie loads Account with history, logout returns to sign-in prompt. Full Google OAuth round-trip not exercised (requires a real Google account click-through) — test user was seeded in MongoDB per /app/auth_testing.md.
- Screenshot verified: home hero/marquee/parallax/repairs band, shop filters, full product wizard flow (reference IMQ-0091BD returned), account page.

## Implemented (2026-09-05, update 27 — Prefilled quote wizard + sale enquiries)
- Quote wizard now prefills from entry links: ?cat=&model= starts at the Extras & trade-in step (step 3); ?cat= only starts at the model step (step 2); blank links unchanged.
- Prefilled wizard shows a compact summary banner (category · model, plus ON SALE badge with sale price + struck-through was-price when applicable) on the extras and details steps, with a "Change device" button that jumps back to the model step. Back button still walks through model/category steps.
- SaleStrip "Grab this deal" links now build /quote/product?cat=&model=&sale=1&price=&was= via catalogue name matching (products + accessories, case-insensitive); unmatched sale names fall back to model+sale params with a notes prefill so no info is lost.
- Backend: ProductQuote model gains is_sale / sale_price / sale_was_price (stored in Mongo); team alert email subject prefixed "SALE — " and body includes sale deal row; customer confirmation email includes the sale deal row.
- Admin dashboard quote cards show an orange "SALE" tag plus "Sale price X · was Y" line for sale enquiries (older quotes without the field render unchanged).
- Verified: API submit with sale fields stores them (IMQ-66658F) and both emails accepted (202); browser e2e — home sale card click lands on step 3 with banner+badge, category-only entry starts at model step, Back returns to model step, step-4 summary shows "On sale R26,999".

## Implemented (2026-09-05, update 28 — Admin quote deletion)
- DELETE /api/admin/quotes/{reference} — admin-only, removes the quote/repair from MongoDB; 403 for non-admins, 404 for unknown references.
- Admin dashboard quote cards now have a trash icon that turns into a red "Confirm delete" button (auto-resets after 4s) to prevent accidental deletion; card disappears from the list on success.
- Verified: curl (non-admin 403, admin delete 200, repeat 404) + browser e2e signed in as test admin — delete button, confirm state, card removal all working.

## Implemented (2026-09-05, update 29 — iPhone X→17 Pro Max picker with colours & storage)
- data.js: new IPHONE_MODELS catalogue — 32 models from iPhone X to iPhone 17 Pro Max, each with its real colour list (name + hex) and storage options per Apple specs. OLDER_IPHONE = "iPhone 8 or older" sentinel.
- Quote wizard iPhone step: New/Pre-owned toggle at top (same model list both ways); picking a model reveals visual colour swatch circles (real colour names, selected colour labelled) and that model's storage pills (+ "Not sure yet"). Continue stays disabled until model + colour + storage chosen.
- "iPhone 8 or older" card reveals three required free-text fields (model, colour, storage); submitted as the model/storage values with colour.
- "Pre-Owned iPhone" shop card now lands on the model step with the Pre-owned toggle pre-selected (instead of skipping ahead with a generic model).
- iPhone entries with a specific model param (shop cards, sale links) start at the model step with that model pre-selected so colour/storage are always captured; other categories unchanged (still skip to extras).
- Backend: ProductQuote gains color + condition fields (stored in Mongo, shown in team + customer emails); admin cards show colour and a "Pre-owned" badge.
- Verified in browser: 33 model cards, per-model swatches/storage, validation gating, older-iPhone fields, summary "iPhone 7 Plus · Pre-owned · Rose Gold · 128GB"; API test IMQ-5CED31 stored color+condition.

## Implemented (2026-09-05, update 30 — Microsoft Services page; store plan dropped)
- New /microsoft-services page: dark hero ("Microsoft Services." + cloud/AI/data/collaboration subhead + Book a consultation CTA), services marquee, 5 categorized groups with eyebrow headers and 22 icon cards (Cloud & Infrastructure, AI & Innovation, Data & Analytics, Business Applications & Collaboration, Integration & Development), closing CTA band. Matches existing design system.
- Every service card has "Enquire about this" → /contact?service=<name> which prefills the contact form subject ("Microsoft Services — <name>") and message, with a visible prefill banner; submissions save to Mongo and notify the team inbox as normal.
- Contact details on the page use the standard iMagine details (BRAND: +27 83 777 3051, seni@imaginestore.co.za) — user initially gave a separate contact (Shuan Govender / whizkids.tech) then changed to the iMagine details.
- Nav (desktop + mobile) gains "Microsoft" link; footer Company column gains "Microsoft Services".
- Earlier Microsoft store/catalogue data (products, category, images) was fully reverted from data.js — nothing Microsoft in Shop.
- Verified in browser: page loads, 5 groups / 22 cards, enquire → contact prefill (subject + message + banner), form submits (IMC-055A7A stored with Microsoft subject), closing CTA + footer link present.

## Implemented (2026-09-05, update 31 — Navbar fit + aesthetic + Microsoft colours)
- Nav links are now compact pill buttons (13px, rounded-full, hover grey pill, active brand-tinted pill); redundant "Account" link removed (account/sign-in already on the right cluster).
- Right cluster buttons slimmed (Repair Quote / Get a Quote at 13px, tighter padding) so everything fits.
- Full nav now shows from xl (1280px) instead of lg — below that the hamburger menu takes over, so nothing is ever cut off.
- "Microsoft" nav item carries the four Microsoft brand squares (#F25022/#7FBA00/#00A4EF/#FFB900) plus gradient text in those colours, on desktop and mobile menu.
- Verified at 1280px (all 7 links + CTAs + sign-in fit, no overflow), 1920px, and 768px mobile (menu opens, Microsoft mark renders).

## Implemented (2026-09-05, update 32 — Removed "The parallax edit" labels)
- Removed the "The parallax edit" eyebrow label from the Home layered-image section and the Repairs blueprint section; animations/effects unchanged. Verified in browser: neither page shows the label, both sections render cleanly.

## Implemented (2026-09-05, update 33 — Microsoft-themed services page)
- /microsoft-services restyled with the Microsoft identity: navy gradient hero (#002050→#00122B) with soft four-colour glows, Microsoft squares mark, Surface laptop hero image framed in a four-colour gradient border, and a four-colour divider strip.
- Per-category accent colours (Cloud=blue #0078D4, AI=purple #5C2D91, Data=green #107C10, Business Apps=red #D83B01, Integration=gold #8A6D00) on eyebrow labels, icon tiles, card accent bars and Enquire links.
- Added a full-width image band ("One Westville team for your Apple and Microsoft worlds.") with navy overlay before the closing CTA; CTA buttons in Microsoft blue; closing headline has four-colour gradient text.
- Verified at 1920/768/390px: all 5 groups and 22 cards render, no horizontal overflow, hero + band images load, closing CTA reachable, enquire→contact prefill still works (Microsoft Fabric subject verified).

## Implemented (2026-09-06, update 34 — Sale quotes separated from normal enquiries)
- Bug fix: changing the device after clicking a sale deal kept the ON SALE flag/pricing on a different product. Now picking any other category or model clears the sale state — only the actual sale item shows "On sale"; everything else is a normal price-on-request enquiry.
- Prefill summary banner now also shows on the model step (step 2) so an iPhone sale deal is visibly marked while picking colour/storage; the "Change device" button hides when already on that step.
- Admin dashboard: new "Sale quotes" tab showing only sale enquiries (with SALE tag + prices); "Product quotes" tab now shows only normal (non-sale) enquiries, so the two never mix.
- Verified in browser: sale badge clears when switching from MacBook pro deal to MacBook Air (summary shows plain "MacBook Air"); iPhone sale badge shows at step 2 and clears when switching to iPhone 13; admin Sale quotes tab shows only the sale quote, Product quotes only the normal one (seeded IMQ-E5F23E sale + IMQ-C9F5BF normal for the check).

## Implemented (2026-09-06, update 35 — Sale state restores when re-selecting the deal)
- Switching away from a sale device clears the sale flag; switching back to the exact sale device (same category + model as the deal link) now restores the ON SALE badge with its prices. Verified in browser: badge shows initially, clears on iPhone 13, restores on iPhone 17 Pro ("ON SALE · R23000 R28000"), persists through extras step.

## Implemented (2026-09-06, update 36 — Sale deals are their own special quote)
- "Grab this deal" now opens a dedicated 3-step Sale Quote flow ("Your deal." → "Extras & trade-in." → "Where do we send the quote?") — no category/device selection at all, Back never reaches the device grids.
- Deal step shows a sale card built from the sale itself: name, sale price, struck-through was-price and the sale description (SaleStrip now passes desc). Customer only picks a colour: real swatches when the sale matches a known iPhone (case-insensitive), otherwise an optional colour text field.
- Sale description is included in the submission notes so the team sees it ("Sale description: ...").
- Verified in browser: iPhone deal (3 swatches, colour required, summary "iphone 17 pro · Silver · On sale R23000"); MacBook deal clicked from the live homepage sale strip, description shown, submitted end-to-end (IMQ-9812FC stored with is_sale, prices, colour, description in notes); normal quote flow regression passed (4 steps, no sale badge).

## Implemented (2026-09-07, update 37 — Microsoft page removed + admin-managed team)
- Microsoft Services page fully removed: page file deleted, route gone (old URL falls through to Home), nav link and four-colour styling removed from desktop+mobile nav (pill nav design kept), footer link removed, contact form service-prefill reverted.
- Admin management: new "Team" tab in the admin dashboard lists all admins and lets an admin add a teammate's Google email (they then sign in with Google to reach the console) or remove added admins with a confirm step.
- Backend: admins now = ADMIN_EMAILS env list (built-in, "Owner" badge, cannot be removed from UI) + MongoDB admins collection. New endpoints GET/POST/DELETE /api/admin/admins (admin-only). Guards: duplicate add → 400, removing built-in → 400, removing yourself → 400, non-admin → 403.
- Verified: curl (add/duplicate/remove/access-grant 200 → revoked 403, builtin protected) + browser (Team tab lists 3 owners, add ui-admin@example.com, remove it, nav clean of Microsoft, /microsoft-services redirects Home).

## Implemented (2026-09-07, update 38 — Sale countdown + removable built-in admins)
- Sale cards (home + shop strips) now show a live countdown pill when a sale has an end date: "Ends in Xd Yh" for 2+ days out, ticking HH:MM:SS under that, with a pulsing timer icon. Sales with no end date show no pill.
- Built-in (env-listed) admins can now be removed from the dashboard Team tab: removal writes a revocation record (admin_removals collection) that overrides the env list; re-adding the email clears the revocation and restores access. Self-removal remains blocked so the console can never be fully locked out.
- Verified: countdown ticking live in browser (flash test deal 02:27:21 → decremented; real deals show days), temp sale deleted after; full admin lifecycle via curl (db admin added → removed builtin → builtin lost access 403 → re-added → restored 200 → self-removal 400 → cleanup → baseline 3 builtin admins); UI shows remove buttons on all rows.

## Implemented (2026-09-07, update 39 — Performance pass 2 + live phone clock)
- Hero phone screen now shows the real current time and date, ticking live (en-ZA format), replacing the hardcoded 9:41.
- Performance: logo.png 53KB→13KB (resized to 128px, still retina-crisp at display size); repair blueprint converted to WebP 148KB→88KB with lazy+async loading (old jpg deleted); trimmed unused Outfit 300 font weight from the Google Fonts request.
- Baseline measured via production build: main chunk 165KB gz, every route split into its own small chunk (2-18KB), all below-fold images already lazy-loaded from the previous pass.
- Verified in browser: live clock matches real time on the hero phone, logo renders crisp, blueprint.webp loads on Repairs, home renders clean.

## Implemented (2026-09-07, update 40 — 3D phone colour fix + email/password admins)
- 3D iPhone colour switcher fixed (recurring bug): root cause was the hero mouse-tilt 3D rotation wrapping the colour swatches — once the mouse moved over the hero, the tilted plane moved the swatches away from the cursor so clicks landed on the frame. The tilt (rx/ry) now applies only to the phone visual inside Phone3D; the colour picker sits flat outside it. Also isolated the live clock into a ClockFace child so its 1s tick never re-renders the motion tree. Verified: 5 sequential colour changes all apply (blue→white→black→natural→blue) with mouse tilt engaged, clock still live.
- Team tab admins can now be added with email + password (no Google needed): POST /admin/admins accepts optional password/name — creates the password account (bcrypt) or sets a password on an existing account, then grants admin. Password min 8 chars. TeamPanel UI gained an optional password field with hint text.
- Verified: created teammate-test@example.com with password via API, logged in via /auth/login (is_admin: true), accessed admin data (200), short password rejected (400), removal revoked access (403), cleaned up.
- Note: owner (kiarenh666) used the Team tab live and removed the test admin mid-session — feature confirmed working in real use; test.user@example.com was restored (admin_removals entry cleared).

## Implemented (2026-09-07, update 41 — Password strength rules)
- All password creation now requires: 8+ chars, uppercase, lowercase, number, special character (max 72 for bcrypt). Shared backend validator returns a specific message listing exactly what's missing. Applied to: customer registration, password reset, and Team-tab admin creation.
- Live checklist UI (PasswordChecklist component) on the register form, reset-password form, and Team tab password field — rules tick green as you type; submit/add buttons stay disabled until all rules pass.
- Verified: API rejects "password"/"Password1" with precise messages, accepts "Password1!" (register + login work); browser shows 1/5 rules green for weak input with disabled submit, 5/5 with enabled submit for strong input. Test account cleaned up.

## Implemented (2026-09-07, update 42 — Strength meter, forgot-password check, code map)
- Password strength meter: coloured 5-segment bar + label (Very weak → Strong) above the rules checklist, live as you type; shared across register, reset-password and Team-tab forms (PasswordChecklist.jsx).
- Forgot password: feature already existed — made the sign-in link bolder/more visible and re-verified the full flow end-to-end (request → 1h token → weak passwords rejected → strong reset → old password dead, new works → "Check your inbox" UI).
- Code organization: rewrote /app/README.md as a labeled code map in plain language — FRONTEND (/frontend), BACKEND (/backend), DATABASE (MongoDB collections), config files, and how requests flow. No code moved (safe before deployment).

## Implemented (2026-09-07, update 43 — Backend restructure + labeled code map)
- server.py (807-line monolith) split into labeled modules: config.py (env/constants), database.py (Mongo + admin check), models.py (Pydantic shapes), security.py (hashing/strength/lockout), auth.py (sessions + sign-in routes + guards), routes/{public,quotes,contact,admin}.py. server.py is now a thin entrypoint exposing app (supervisor unchanged: uvicorn server:app).
- Behavior preserved verbatim — full API regression passed: health, product/repair quote submit, repair status, contact, register/login/me, my quotes, admin submissions/stats/admins, public sales; frontend smoke (sale strip + phone colours) fine.
- README.md code map updated to the new backend layout.
- INCIDENT HANDLED: during live Team-tab use, both owner accounts (ayushsukhnandan28, kiarenh666) had been removed as admins by the owner-added test admin (imaginetestadmin@gmail.com). Both owners were restored (admin_removals cleared). Active admins now: ayush, kiarenh666, test.user (test), imaginetestadmin.
