import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function ProductCard({ product, index = 0 }) {
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
