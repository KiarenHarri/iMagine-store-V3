import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard, Reveal, SaleStrip } from "../components/Shared";
import { products, categories } from "../lib/data";

const PILLS = [{ slug: "all", name: "All" }, ...categories.filter((c) => c.slug !== "accessories")];

export default function Shop() {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    return products.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (q.trim() === "" || p.name.toLowerCase().includes(q.toLowerCase()))
    );
  }, [cat, q]);

  return (
    <div data-testid="shop-page" className="bg-paper">
      <section className="bg-ink py-16 text-paper grain relative overflow-hidden lg:py-24">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
          <Reveal>
            <p className="eyebrow !text-brand">Shop</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              The catalogue.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-paper/60 sm:text-base">
              New and pre-owned Apple devices. Pricing and availability change daily — every item is quoted personally by the iMagine team.
            </p>
            <Link to="/trade-in" data-testid="shop-tradein-link" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-hover">
              Trading in? Estimate your old device's value →
            </Link>
          </Reveal>
        </div>
      </section>

      <SaleStrip dark />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8 lg:px-12 lg:py-16">
        <Reveal>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2" data-testid="shop-filters">
              {PILLS.map((p) => (
                <button
                  key={p.slug}
                  data-testid={`filter-${p.slug}`}
                  onClick={() => setCat(p.slug)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                    cat === p.slug ? "bg-brand text-white" : "border border-ink/10 bg-white text-ink/70 hover:border-brand hover:text-brand"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <div className="relative w-full max-w-xs">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
              <input
                data-testid="shop-search-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search devices…"
                className="w-full rounded-full border border-ink/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand"
              />
            </div>
          </div>
        </Reveal>

        {list.length === 0 ? (
          <p data-testid="shop-empty" className="mt-16 text-center text-sm text-mute">No devices match your search.</p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" data-testid="shop-grid">
            {list.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard product={p} index={i} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
