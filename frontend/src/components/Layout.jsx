// LAYOUT — navbar and footer rendered on every page.
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Facebook, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { startGoogleLogin, useAuth } from "../lib/client";
import { BRAND, categories } from "../lib/data";

// ---- Navbar ----
const LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/repairs", label: "Repairs" },
  { to: "/accessories", label: "Accessories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <header data-testid="site-header" className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-12 h-16 sm:h-20">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="iMagine logo" className="h-12 w-12 rounded-full object-cover sm:h-14 sm:w-14" />
          <span className="font-display text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            iMagine<span className="text-brand">.</span>
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-0.5" data-testid="nav-desktop">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors duration-200 ${
                  isActive ? "bg-brand-subtle text-brand" : "text-ink/70 hover:bg-ink/5 hover:text-ink"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden xl:flex items-center gap-2">
          <Link
            to="/quote/repair"
            data-testid="nav-repair-quote-btn"
            className="rounded-full border border-ink/15 px-4 py-2 text-[13px] font-semibold text-ink transition-colors duration-200 hover:border-brand hover:text-brand"
          >
            Repair Quote
          </Link>
          <Link
            to="/quote/product"
            data-testid="nav-product-quote-btn"
            className="group flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-brand-hover"
          >
            Get a Quote
            <ArrowUpRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          {user ? (
            <>
              {user.is_admin && (
                <Link to="/admin" data-testid="nav-admin-link" className="rounded-full border border-brand/40 bg-brand-subtle px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand transition-colors duration-200 hover:bg-brand hover:text-white">
                  Team
                </Link>
              )}
              <Link to="/account" data-testid="nav-account-link" className="flex items-center gap-2 rounded-full border border-ink/10 py-1 pl-1 pr-3 transition-colors duration-200 hover:border-brand">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {(user.name || "U")[0]}
                </span>
              )}
              <span className="max-w-[90px] truncate text-xs font-semibold text-ink">{user.name?.split(" ")[0]}</span>
              </Link>
            </>
          ) : (
            <button
              onClick={startGoogleLogin}
              data-testid="nav-signin-btn"
              className="text-sm font-semibold text-ink/70 transition-colors duration-200 hover:text-brand"
            >
              Sign in
            </button>
          )}
        </div>

        <button
          data-testid="nav-mobile-toggle"
          onClick={() => setOpen(!open)}
          className="xl:hidden rounded-full border border-ink/10 p-2.5 text-ink"
          aria-label="Toggle menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            data-testid="nav-mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-black/5 bg-white xl:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-5">
              {LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-3 font-display text-lg font-bold ${isActive ? "text-brand" : "text-ink"}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="mt-3 flex gap-3">
                <Link to="/quote/repair" onClick={() => setOpen(false)} data-testid="nav-mobile-repair-btn" className="flex-1 rounded-full border border-ink/15 px-4 py-3 text-center text-sm font-semibold">
                  Repair Quote
                </Link>
                <Link to="/quote/product" onClick={() => setOpen(false)} data-testid="nav-mobile-quote-btn" className="flex-1 rounded-full bg-brand px-4 py-3 text-center text-sm font-semibold text-white">
                  Get a Quote
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

// ---- Footer ----
export function Footer() {
  return (
    <footer data-testid="site-footer" className="relative overflow-hidden bg-ink text-paper grain">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <img src="/assets/logo.png" alt="iMagine logo" className="h-14 w-14 rounded-full object-cover" />
              <span className="font-display text-2xl font-extrabold tracking-tight">iMagine<span className="text-brand">.</span></span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper/60">
              {BRAND.legal} — {BRAND.role}. South African ICT company established {BRAND.established}. {BRAND.philosophy}
            </p>
            <a
              href={BRAND.facebook}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-facebook-link"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors duration-200 hover:border-brand hover:text-brand"
            >
              <Facebook size={14} /> Facebook
            </a>
          </div>

          <div className="md:col-span-3">
            <p className="eyebrow !text-paper/40">Shop</p>
            <ul className="mt-4 space-y-2.5">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to={`/shop/${c.slug}`} data-testid={`footer-link-${c.slug}`} className="text-sm text-paper/70 transition-colors duration-200 hover:text-brand">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow !text-paper/40">Company</p>
            <ul className="mt-4 space-y-2.5 text-sm text-paper/70">
              <li><Link to="/about" data-testid="footer-link-about" className="transition-colors duration-200 hover:text-brand">About</Link></li>
              <li><Link to="/repairs" data-testid="footer-link-repairs" className="transition-colors duration-200 hover:text-brand">Repairs</Link></li>
              <li><Link to="/contact" data-testid="footer-link-contact" className="transition-colors duration-200 hover:text-brand">Contact</Link></li>
              <li><Link to="/quote/product" data-testid="footer-link-quote" className="transition-colors duration-200 hover:text-brand">Get a Quote</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow !text-paper/40">Visit</p>
            <div className="mt-4 space-y-3 text-sm text-paper/70">
              <p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-brand" />{BRAND.location}</p>
              <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} data-testid="footer-phone-link" className="flex items-center gap-2 transition-colors duration-200 hover:text-brand">
                <Phone size={15} className="text-brand" /> {BRAND.phone}
              </a>
              <a href={`mailto:${BRAND.email}`} data-testid="footer-email-link" className="flex items-center gap-2 transition-colors duration-200 hover:text-brand">
                <Mail size={15} className="text-brand" /> {BRAND.email}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 select-none overflow-hidden">
          <p className="text-stroke-dark whitespace-nowrap font-display text-[18vw] md:text-[11vw] font-black leading-none tracking-tighter">
            iMagine
          </p>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-paper/40 sm:flex-row sm:items-center">
          <p data-testid="footer-copyright">© {new Date().getFullYear()} {BRAND.legal}. Apple Reseller concept site — prices & availability on request.</p>
          <Link to="/quote/product" data-testid="footer-cta" className="group flex items-center gap-1 font-semibold uppercase tracking-widest text-paper/70 transition-colors hover:text-brand">
            Start a quote <ArrowUpRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
