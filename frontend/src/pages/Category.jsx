import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { MaskedLine, Reveal } from "../components/motion";
import ProductCard from "../components/ProductCard";
import Marquee from "../components/Marquee";
import { categories, products } from "../lib/data";

export default function Category() {
  const { slug } = useParams();
  const category = categories.find((c) => c.slug === slug && c.slug !== "accessories");
  if (!category) return <Navigate to="/shop" replace />;

  const list = products.filter((p) => p.category === slug);

  return (
    <div data-testid={`category-page-${slug}`} className="bg-paper">
      <section className="relative overflow-hidden bg-ink text-paper grain">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-24">
          <div>
            <MaskedLine delay={0.1}>
              <span className="eyebrow !text-brand">Collection</span>
            </MaskedLine>
            <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              <MaskedLine delay={0.2}>{category.name}</MaskedLine>
            </h1>
            <MaskedLine delay={0.35} className="mt-5 max-w-md">
              <span className="text-sm leading-relaxed text-paper/60 sm:text-base">{category.tagline} Every unit quoted personally — pricing and availability on request.</span>
            </MaskedLine>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8"
            >
              <Link
                to={`/quote/product?cat=${slug}`}
                data-testid="category-quote-cta"
                className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-hover"
              >
                Get a {category.name} quote <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
          <Reveal delay={0.2}>
            <div className="overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/50">
              <img src={category.image} alt={`${category.name} hero`} data-testid="category-hero-image" className="aspect-[4/3] w-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <Marquee items={[`${category.name}`, "New & Pre-Owned", "Price on Request", "Trade-In Welcome", "Westville, Durban"]} />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8 lg:px-12 lg:py-20">
        <Reveal>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">In this collection</h2>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" data-testid="category-grid">
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
      </section>
    </div>
  );
}
