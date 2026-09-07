// SHARED UI — motion helpers, marquee, product/sale cards, wizard blocks, toaster, password meter.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, Circle, Tag, Timer } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { products, accessories } from "../lib/data";

// ---- Motion helpers ----
const EASE = [0.16, 1, 0.3, 1];

export const MaskedLine = ({ children, delay = 0, as: Tag = "span", className = "" }) => (
  <span className={`block overflow-hidden ${className}`}>
    <motion.span
      className="block will-change-transform"
      initial={{ y: "115%" }}
      animate={{ y: 0 }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      {children}
    </motion.span>
  </span>
);

export const Reveal = ({ children, delay = 0, y = 36, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-70px" }}
    transition={{ duration: 0.85, delay, ease: EASE }}
  >
    {children}
  </motion.div>
);

export const ease = EASE;

// ---- Marquee ----
export function Marquee({ items, dark = false }) {
  const row = [...items, ...items];
  return (
    <div
      data-testid="editorial-marquee"
      className={`relative overflow-hidden border-y py-4 ${
        dark ? "border-white/10 bg-ink text-paper" : "border-black/10 bg-white text-ink"
      }`}
    >
      <div className="animate-marquee flex w-max items-center whitespace-nowrap font-mono text-[11px] sm:text-xs uppercase tracking-[0.35em]">
        {row.map((t, i) => (
          <span key={i} className="flex items-center">
            <span className="px-6">{t}</span>
            <span className="text-brand">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ---- Password strength meter ----
const RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "A lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "A number", test: (p) => /\d/.test(p) },
  { id: "special", label: "A special character (!@#$…)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const LEVELS = [
  { label: "Very weak", color: "#EF4444" },
  { label: "Weak", color: "#F97316" },
  { label: "Fair", color: "#EAB308" },
  { label: "Good", color: "#84CC16" },
  { label: "Strong", color: "#16A34A" },
];

export const passwordValid = (p) => RULES.every((r) => r.test(p));

export const passwordScore = (p) => RULES.filter((r) => r.test(p)).length;

export function PasswordChecklist({ password }) {
  if (!password) return null;
  const score = passwordScore(password);
  const level = LEVELS[Math.max(0, score - 1)];
  return (
    <div>
      <div data-testid="password-strength-meter" className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {LEVELS.map((_, i) => (
            <span
              key={i}
              data-testid={`pwd-strength-segment-${i}`}
              className="h-1.5 flex-1 rounded-full transition-colors duration-300"
              style={{ backgroundColor: i < score ? level.color : "rgba(128,128,128,0.25)" }}
            />
          ))}
        </div>
        <span data-testid="password-strength-label" className="w-16 text-right text-[11px] font-bold" style={{ color: level.color }}>
          {level.label}
        </span>
      </div>
      <ul data-testid="password-checklist" className="mt-2 space-y-1">
        {RULES.map((r) => {
          const ok = r.test(password);
          return (
            <li
              key={r.id}
              data-testid={`pwd-rule-${r.id}`}
              className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors duration-200 ${ok ? "text-green-600" : "text-ink/40"}`}
            >
              {ok ? <Check size={11} strokeWidth={3} /> : <Circle size={8} />} {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---- Product card ----
export function ProductCard({ product, index = 0 }) {
  return (
    <div
      data-testid={`product-card-${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white transition-shadow duration-300 hover:shadow-xl hover:shadow-ink/10"
    >
      <div className="relative overflow-hidden bg-paper">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur">
          Price on request
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg font-bold text-ink">{product.name}</h3>
        <p className="mt-1 text-sm text-ink/60">{product.tagline}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {product.specs.map((s) => (
            <span key={s} className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-medium text-ink/70">{s}</span>
          ))}
        </div>
        <Link
          to={`/quote/product?cat=${product.category}&model=${encodeURIComponent(product.name)}`}
          data-testid={`product-quote-btn-${product.id}`}
          className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition-colors duration-300 group-hover:bg-brand"
        >
          Request quote <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  );
}

// ---- Sale strip ----
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const useNow = () => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
};

const countdownText = (endsAt, now) => {
  const diff = new Date(endsAt).getTime() - now;
  if (Number.isNaN(diff) || diff <= 0) return "Ending soon";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (d >= 2) return `Ends in ${d}d ${h}h`;
  const hh = String(d * 24 + h).padStart(2, "0");
  return `Ends in ${hh}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const findCategory = (name) => {
  const n = name.toLowerCase();
  const p = products.find((x) => x.name.toLowerCase() === n || n.includes(x.name.toLowerCase()));
  if (p) return p.category;
  if (accessories.some((a) => a.name.toLowerCase() === n || n.includes(a.name.toLowerCase()))) return "accessories";
  return "";
};

const saleQuoteLink = (s) => {
  const cat = findCategory(s.name);
  const qp = new URLSearchParams();
  if (cat) qp.set("cat", cat);
  qp.set("model", s.name);
  qp.set("sale", "1");
  if (s.price) qp.set("price", s.price);
  if (s.was_price) qp.set("was", s.was_price);
  if (s.description) qp.set("desc", s.description);
  if (!cat) qp.set("notes", `Sale enquiry: ${s.name}${s.price ? ` — ${s.price}` : ""}`);
  return `/quote/product?${qp.toString()}`;
};

export function SaleStrip({ dark = false }) {
  const [sales, setSales] = useState(null);
  const now = useNow();

  useEffect(() => {
    fetch(`${API}/sales`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setSales)
      .catch(() => setSales([]));
  }, []);

  if (!sales || sales.length === 0) return null;

  return (
    <section data-testid="sale-strip" className={`py-14 lg:py-20 ${dark ? "bg-ink text-paper grain relative overflow-hidden" : "bg-white"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <p className={`eyebrow flex items-center gap-2 ${dark ? "!text-brand" : ""}`}>
                <Tag size={13} className="text-brand" /> On sale now
              </p>
              <h2 className={`mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl ${dark ? "text-paper" : "text-ink"}`}>
                This week's deals.
              </h2>
            </div>
          </div>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sales.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.07}>
              <div
                data-testid={`sale-card-${s.id}`}
                className={`group flex h-full flex-col overflow-hidden rounded-3xl border transition-shadow duration-300 hover:shadow-xl ${
                  dark ? "border-white/10 bg-white/5 hover:shadow-black/40" : "border-black/5 bg-paper hover:shadow-ink/10"
                }`}
              >
                {s.image && (
                  <div className="overflow-hidden bg-white">
                    <img src={s.image} alt={s.name} className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className={`font-display text-lg font-bold ${dark ? "text-paper" : "text-ink"}`}>{s.name}</h3>
                  {s.description && <p className={`mt-1 text-sm ${dark ? "text-paper/60" : "text-ink/60"}`}>{s.description}</p>}
                  {s.ends_at && (
                    <span
                      data-testid={`sale-countdown-${s.id}`}
                      className={`mt-3 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${
                        dark ? "bg-brand/15 text-brand" : "bg-brand-subtle text-brand"
                      }`}
                    >
                      <Timer size={11} className="animate-pulse" /> {countdownText(s.ends_at, now)}
                    </span>
                  )}
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="font-display text-2xl font-extrabold text-brand">{s.price}</span>
                    {s.was_price && (
                      <span className={`text-sm line-through ${dark ? "text-paper/40" : "text-mute"}`}>{s.was_price}</span>
                    )}
                  </div>
                  <Link
                    to={saleQuoteLink(s)}
                    data-testid={`sale-quote-${s.id}`}
                    className="group/link mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white transition-colors duration-300 hover:bg-brand-hover"
                  >
                    Grab this deal <ArrowRight size={13} className="transition-transform duration-300 group-hover/link:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Wizard building blocks ----
export const WizardShell = ({ step, total, title, subtitle, children, onBack, onNext, nextDisabled, nextLabel = "Continue", testId }) => (
  <div data-testid={testId} className="mx-auto max-w-3xl px-4 py-14 sm:px-8 lg:py-20">
    <div className="mb-10">
      <div className="flex items-center justify-between">
        <p className="eyebrow">{title}</p>
        <p className="font-mono text-xs tracking-[0.25em] text-mute">
          {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </div>
      <div className="mt-4 flex gap-1.5" data-testid={`${testId}-progress`}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i < step ? "bg-brand" : "bg-ink/10"}`}
          />
        ))}
      </div>
      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{subtitle}</h1>
    </div>

    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.45, ease }}
      >
        {children}
      </motion.div>
    </AnimatePresence>

    <div className="mt-10 flex items-center justify-between">
      {step > 1 ? (
        <button onClick={onBack} data-testid={`${testId}-back-btn`} className="flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-brand hover:text-brand">
          <ArrowLeft size={15} /> Back
        </button>
      ) : (
        <span />
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        data-testid={`${testId}-next-btn`}
        className="group flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {nextLabel} <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </div>
  </div>
);

export const OptionCard = ({ selected, onClick, title, desc, testId }) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={testId}
    className={`group w-full rounded-2xl border p-5 text-left transition-all duration-200 ${
      selected ? "border-brand bg-brand-subtle shadow-lg shadow-brand/10" : "border-ink/10 bg-white hover:border-brand/50"
    }`}
  >
    <div className="flex items-center justify-between">
      <p className={`font-display text-base font-bold ${selected ? "text-brand" : "text-ink"}`}>{title}</p>
      <span className={`h-4 w-4 rounded-full border-2 transition-colors duration-200 ${selected ? "border-brand bg-brand" : "border-ink/20"}`} />
    </div>
    {desc && <p className="mt-1.5 text-sm text-ink/60">{desc}</p>}
  </button>
);

export const SuccessPanel = ({ reference, title, body, testId }) => (
  <div data-testid={testId} className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-8 lg:py-28">
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease }}>
      <div className="rounded-3xl bg-ink p-10 text-paper grain relative overflow-hidden lg:p-14">
        <CheckCircle2 size={48} className="mx-auto text-brand" />
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-paper/60">{body}</p>
        <div className="mt-8 inline-block rounded-2xl border border-brand/40 bg-brand/10 px-8 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-paper/50">Your reference</p>
          <p data-testid={`${testId}-reference`} className="mt-1 font-mono text-2xl font-bold tracking-widest text-brand">{reference}</p>
        </div>
        <p className="mt-6 text-xs text-paper/40">Keep this reference — you can use it to track progress.</p>
      </div>
    </motion.div>
  </div>
);

export const fieldCls =
  "w-full rounded-2xl border border-ink/10 bg-white px-5 py-3.5 text-sm outline-none transition-colors focus:border-brand";

// ---- Toaster ----
export const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props} />
  );
};
