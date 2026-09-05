import { Link } from "react-router-dom";
import { Facebook, MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import { BRAND, categories } from "../lib/data";

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="relative overflow-hidden bg-ink text-paper grain">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <img src="/assets/logo.png" alt="iMagine logo" className="h-10 w-10 rounded-full object-cover" />
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
