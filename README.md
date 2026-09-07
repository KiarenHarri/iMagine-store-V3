# iMagine Store — Code Map

How the website is organised, in plain language. Three parts: **Frontend** (what visitors see), **Backend** (the server that does the work), **Database** (where everything is stored).

## Put it live on the internet (xneelo Cloud)

xneelo's ordinary **web hosting plans cannot run this website** — they only support PHP/MySQL, with no Python and no MongoDB. **xneelo Cloud** (self-managed server) can run everything, and this repo ships with Docker packaging so the whole site starts with one command.

### What you need
1. An **xneelo Cloud server** — Ubuntu 24.04 LTS (smallest size is fine to start)
2. Your **domain's DNS** pointing at the server: `A` records for `yourdomain.co.za` and `www.yourdomain.co.za` → the server's IP (done wherever your domain is registered)
3. A **free MongoDB Atlas** database (5-minute setup below) — this is where all website data lives
4. This code **on GitHub** (use the "Save to Github" button)

### Step 1 — Create the free database (MongoDB Atlas, ~5 minutes)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → sign up free → create an **M0 (Free)** cluster
2. **Database → Database Users** → add a user with a strong password (save it)
3. **Database → Network Access** → Add IP Address → **Allow access from anywhere** (safe — the database still requires the password)
4. **Connect → Drivers** → copy the connection string, it looks like `mongodb+srv://user:<password>@cluster0.xxxxx.mongodb.net/...`
5. Replace `<password>` with the real password — that whole string is your `MONGO_URL`

### Step 2 — Install the website on the server (~10 minutes)
SSH into the server from your computer (`ssh root@SERVER-IP` — the IP is in the xneelo dashboard), then:

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh

# 2. Get the code from your GitHub repo
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git imagine-store
cd imagine-store

# 3. Configure it
cp backend/.env.example backend/.env
nano backend/.env     # paste your MONGO_URL from Atlas, set your domain, add email keys
nano Caddyfile        # replace yourdomain.co.za with your real domain

# 4. Start everything — frontend + backend + automatic free HTTPS
docker compose up -d --build
```

Open `https://yourdomain.co.za` — done. The HTTPS certificate is created automatically the first time the domain loads (~1 minute; your DNS must already point at the server first).

| Everyday command (run inside `imagine-store/`) | What it does |
|---|---|
| `docker compose logs -f` | Watch live logs (Ctrl+C to stop watching) |
| `git pull && docker compose up -d --build` | Update the website after pushing new code to GitHub |
| `docker compose restart` | Restart after changing `backend/.env` |
| `docker compose down` / `docker compose up -d` | Stop / start the website |

**Note:** sign-in only works over `https://` (secure cookies) — Caddy sets this up for you.

### Alternative: manual setup without Docker

```bash
# 1. Install Node 20, Python 3.11+, nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs python3-venv nginx

# 2. Get the code and configure (same as Docker steps 2-3 above)
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git imagine-store
cd imagine-store
cp backend/.env.example backend/.env && nano backend/.env

# 3. Backend (keep this running — use systemd or tmux for permanence)
cd backend
python3 -m venv venv
venv/bin/pip install -r requirements.prod.txt
venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001

# 4. Frontend (in a second terminal)
cd frontend && npm install -g yarn
yarn install && REACT_APP_BACKEND_URL="" yarn build

# 5. nginx: serve frontend/build and proxy /api to 127.0.0.1:8001
#    (copy the proxy rules from frontend/nginx.conf into your nginx site config)

# 6. Free HTTPS certificate
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.co.za -d www.yourdomain.co.za
```

### The files that make deployment work

| File | What it is |
|---|---|
| `docker-compose.yml` | Starts all 3 parts (backend, frontend, HTTPS) together |
| `backend/Dockerfile` + `backend/requirements.prod.txt` | Backend container, minimal portable dependencies |
| `frontend/Dockerfile` + `frontend/nginx.conf` | Builds the React site, serves it, forwards `/api` to the backend |
| `Caddyfile` | Your domain + automatic free HTTPS |
| `backend/.env.example` | Settings template — copy to `backend/.env` and fill in |

---

## Run it yourself for development (self-hosting)

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
