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

Everything the visitor sees and clicks. 19 source files, each labeled at the top.

| File / folder | What it is |
|---|---|
| `src/index.js` | Boot file — mounts the app |
| `src/App.js` | The router — decides which page shows for each web address |
| `src/index.css` | All global styles and the brand theme |
| `src/lib/data.js` | The product catalogue data, images, iPhone model/colour lists |
| `src/lib/client.jsx` | API calls + sign-in state (auth) for the whole frontend |
| `src/components/Layout.jsx` | Navbar + footer (every page) |
| `src/components/Phone3D.jsx` | The animated 3D iPhone with live clock and colour switcher |
| `src/components/Shared.jsx` | Shared building blocks: motion helpers, marquee, product/sale cards, wizard parts, password meter, toasts |
| `src/pages/Home.jsx` | Homepage (hero, 3D phone, sale strip, chapters) |
| `src/pages/Shop.jsx` | Product catalogue grid |
| `src/pages/Category.jsx` | Per-category product pages |
| `src/pages/Accessories.jsx` | Accessories page |
| `src/pages/Repairs.jsx` | Repairs page with the blueprint parallax art |
| `src/pages/ProductQuote.jsx` | The product/sale quote wizard (incl. iPhone colour & storage picker) |
| `src/pages/RepairQuote.jsx` | The repair quote wizard |
| `src/pages/TradeIn.jsx` | Trade-in value calculator |
| `src/pages/Info.jsx` | About + Contact pages |
| `src/pages/Account.jsx` | Sign in / register / forgot password + reset password page |
| `src/pages/Admin.jsx` | Team console (quotes, statuses, sales, team, messages, stats) |
| `public/assets/` | Logo and blueprint images |
| `public/index.html` | The single HTML shell everything loads into |

## 2. BACKEND — `/app/backend` (Python / FastAPI)

The server. 8 files, each labeled at the top. The frontend never touches the database directly.

| File | What it is |
|---|---|
| `server.py` | Entry point — builds the app and mounts the routes (start here) |
| `database.py` | Environment settings + MongoDB connection + admin-membership check |
| `models.py` | The shape of every API request (quotes, sales, admins…) |
| `auth.py` | Sign-in & security: Google OAuth, email+password, sessions, reset links, password rules, lockout |
| `routes.py` | All endpoints: public, quotes, contact, admin |
| `mailer.py` | Sends the emails (team alerts, customer confirmations, password resets) |
| `pdfgen.py` | Generates the branded downloadable quote PDFs |
| `utils.py` | Small helpers (reference codes, timestamps, sale window) |
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
