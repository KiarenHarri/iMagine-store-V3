import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useAuth, startGoogleLogin } from "../lib/auth";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/repairs", label: "Repairs" },
  { to: "/accessories", label: "Accessories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/account", label: "Account" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <header data-testid="site-header" className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-12 h-16 sm:h-20">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="iMagine logo" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">
            iMagine<span className="text-brand">.</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7" data-testid="nav-desktop">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors duration-200 hover:text-brand ${
                  isActive ? "text-brand" : "text-ink/70"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/quote/repair"
            data-testid="nav-repair-quote-btn"
            className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:border-brand hover:text-brand"
          >
            Repair Quote
          </Link>
          <Link
            to="/quote/product"
            data-testid="nav-product-quote-btn"
            className="group flex items-center gap-1.5 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-hover"
          >
            Get a Quote
            <ArrowUpRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          {user ? (
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
          className="lg:hidden rounded-full border border-ink/10 p-2.5 text-ink"
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
            className="overflow-hidden border-t border-black/5 bg-white lg:hidden"
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
