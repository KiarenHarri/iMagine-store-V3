import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Tag, Timer } from "lucide-react";
import { Reveal } from "./motion";
import { products, accessories } from "../lib/data";

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

export default function SaleStrip({ dark = false }) {
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
