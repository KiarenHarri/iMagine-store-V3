import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Tag } from "lucide-react";
import { Reveal } from "./motion";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SaleStrip({ dark = false }) {
  const [sales, setSales] = useState(null);

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
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="font-display text-2xl font-extrabold text-brand">{s.price}</span>
                    {s.was_price && (
                      <span className={`text-sm line-through ${dark ? "text-paper/40" : "text-mute"}`}>{s.was_price}</span>
                    )}
                  </div>
                  <Link
                    to={`/quote/product?model=${encodeURIComponent(s.name)}`}
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
