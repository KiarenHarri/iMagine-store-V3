# iMagine Store — Code Map

How the website is organised, in plain language. Three parts: **Frontend** (what visitors see), **Backend** (the server that does the work), **Database** (where everything is stored).

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
| `server.py` | All API endpoints: quotes, contact, auth (Google + email/password), admin (statuses, sales, team), PDFs, stats |
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
