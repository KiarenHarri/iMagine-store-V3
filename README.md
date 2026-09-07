# iMagine Store — Code Map

How the website is organised, in plain language. Three parts: **Frontend** (what visitors see), **Backend** (the server that does the work), **Database** (where everything is stored).

## Run it yourself (self-hosting)

The project is fully self-contained — no platform-specific services required.

```bash
# Backend (Python 3.11+)
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001

# Frontend (Node 18+)
cd frontend
yarn install
yarn start          # development
yarn build          # production bundle in build/
```

Prerequisites: a MongoDB instance (`MONGO_URL`), and the environment variables below.

### Environment variables

**`backend/.env`**

| Key | Purpose |
|---|---|
| `MONGO_URL` / `DB_NAME` | MongoDB connection |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `FRONTEND_URL` | Public site URL (used for OAuth + email links) |
| `RESEND_API_KEY` | Transactional email ([resend.com](https://resend.com), free tier) |
| `EMAIL_FROM` | Sender, e.g. `iMagine Store <noreply@yourdomain.co.za>` |
| `EMAIL_FROM_NAME` / `EMAIL_REPLY_TO` / `TEAM_NOTIFY_EMAIL` | Email display + team inbox |
| `ADMIN_EMAILS` | Comma-separated built-in owner accounts |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` | Google OAuth (see setup below) |

**`frontend/.env`**

| Key | Purpose |
|---|---|
| `REACT_APP_BACKEND_URL` | Public URL of the backend (no trailing slash) |

### Google sign-in setup (Google Cloud Console, ~10 minutes)

1. console.cloud.google.com → create a project (e.g. "iMagine Store")
2. APIs & Services → OAuth consent screen → External → fill in your brand details
3. Credentials → Create OAuth client ID → Web application
4. Add authorized redirect URI: `https://yourdomain.co.za/api/auth/google/callback`
5. Copy the client ID/secret into `backend/.env` and set `GOOGLE_REDIRECT_URI` to the same callback URL

Until these are set, email + password sign-in works fully (create admin logins from the Team tab).

---

```
Visitor's browser
      │
      ▼
┌─────────────────────────┐
│  FRONTEND  (/frontend)  │  React + JavaScript — pages, design, animations
└───────────┬─────────────┘
            │ calls /api/...
            ▼
┌─────────────────────────┐
│  BACKEND  (/backend)    │  Python + FastAPI — logins, quotes, sales, emails, PDFs
└───────────┬─────────────┘
            │ reads & writes
            ▼
┌─────────────────────────┐
│  DATABASE  (MongoDB)    │  Collections: users, user_sessions, quotes,
│                         │  contact_messages, sales, admins, admin_removals,
│                         │  login_attempts, password_reset_tokens
└─────────────────────────┘
```

---

## 1. FRONTEND — `/app/frontend` (JavaScript / React)

Everything the visitor sees and clicks.

| File / folder | What it is |
|---|---|
| `src/App.js` | The router — decides which page shows for each web address |
| `src/pages/Home.jsx` | Homepage (hero, 3D phone, sale strip, chapters) |
| `src/pages/Shop.jsx`, `Category.jsx` | Product catalogue and per-category pages |
| `src/pages/ProductQuote.jsx` | The product/sale quote wizard (incl. iPhone colour & storage picker) |
| `src/pages/RepairQuote.jsx` | The repair quote wizard |
| `src/pages/Repairs.jsx` | Repairs page with the blueprint parallax art |
| `src/pages/TradeIn.jsx` | Trade-in value calculator |
| `src/pages/Account.jsx` | Sign in / register / forgot password |
| `src/pages/ResetPassword.jsx` | "Set new password" page from email links |
| `src/pages/Admin.jsx` | Team console (quotes, statuses, messages) |
| `src/pages/About.jsx`, `Contact.jsx`, `Accessories.jsx` | Content pages |
| `src/components/Nav.jsx`, `Footer.jsx` | Navbar and footer on every page |
| `src/components/Phone3D.jsx` | The animated 3D iPhone with live clock and colour switcher |
| `src/components/SaleStrip.jsx` | Sale cards with live countdown |
| `src/components/AdminExtras.jsx` | Admin stats, sales manager, Team (admin) panel |
| `src/components/PasswordChecklist.jsx` | Password strength meter + rules checklist |
| `src/components/Wizard.jsx`, `motion.jsx`, `Marquee.jsx`, `ProductCard.jsx` | Shared building blocks |
| `src/lib/data.js` | The product catalogue data, images, iPhone model/colour lists |
| `src/lib/auth.jsx` | Sign-in state and login/logout helpers |
| `src/lib/api.js` | The functions the pages use to talk to the backend |
| `public/assets/` | Logo and blueprint images |
| `public/index.html` | The single HTML shell everything loads into |

## 2. BACKEND — `/app/backend` (Python / FastAPI)

The server. The frontend never touches the database directly — it always asks the backend.

| File | What it is |
|---|---|
| `server.py` | Entry point — builds the app and mounts the routes (start here) |
| `config.py` | Environment settings + constants (owner emails, status flows) |
| `database.py` | The MongoDB connection + the admin-membership check |
| `models.py` | The shape of every API request (quotes, sales, admins…) |
| `security.py` | Password hashing, strength rules, brute-force lockout |
| `auth.py` | Sign-in: Google exchange, email+password, sessions, reset links, access guards |
| `routes/public.py` | Health check + the live sales shown on the site |
| `routes/quotes.py` | Product/repair quotes, customer accept/decline, PDF downloads |
| `routes/contact.py` | Contact form submissions |
| `routes/admin.py` | Team console APIs: statuses, deletes, admins, sales, stats |
| `mailer.py` | Sends the emails (team alerts, customer confirmations, password resets) |
| `pdfgen.py` | Generates the branded downloadable quote PDFs |
| `requirements.txt` | The Python packages the backend needs |

## 3. DATABASE — MongoDB

Where everything is permanently stored. Key collections:

| Collection | What it holds |
|---|---|
| `quotes` | Product & repair quote requests, statuses, prices |
| `contact_messages` | Contact form messages |
| `users` | Customer and team accounts (passwords stored as secure bcrypt hashes) |
| `user_sessions` | Who is currently signed in |
| `sales` | The deals shown on the homepage/shop |
| `admins` / `admin_removals` | Extra team admins added from the dashboard, and removed built-ins |
| `login_attempts` | Brute-force lockout tracking |
| `password_reset_tokens` | One-hour password reset links |

## Configuration (the `.env` files)

- `frontend/.env` — where the frontend finds the backend (`REACT_APP_BACKEND_URL`)
- `backend/.env` — database connection (`MONGO_URL`, `DB_NAME`), team owner emails (`ADMIN_EMAILS`), email sender settings

## How it runs

- Frontend serves the site; any address starting with `/api` is forwarded to the backend
- The backend connects to MongoDB using `MONGO_URL`
