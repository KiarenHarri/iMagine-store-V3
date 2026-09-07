import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Marquee, MaskedLine, Reveal } from "../components/Shared";
import { accessories } from "../lib/data";

export default function Accessories() {
  return (
    <div data-testid="accessories-page" className="bg-paper">
      <section className="relative overflow-hidden bg-white py-16 lg:py-24">
        <div className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
          <MaskedLine delay={0.1}>
            <span className="eyebrow">Accessories</span>
          </MaskedLine>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            <MaskedLine delay={0.2}>Finish the</MaskedLine>
            <MaskedLine delay={0.32}>
              <span className="text-brand">ecosystem.</span>
            </MaskedLine>
          </h1>
          <MaskedLine delay={0.45} className="mt-5 max-w-xl">
            <span className="text-sm leading-relaxed text-ink/65 sm:text-base">
              Genuine Apple accessories and Beats audio — cases, chargers, pencils, straps and more. All pricing on request.
            </span>
          </MaskedLine>
        </div>
      </section>

      <Marquee items={["AirPods", "Beats", "Apple Pencil", "Magic Keyboard", "MagSafe", "Straps & Cases", "Price on Request"]} />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" data-testid="accessories-grid">
          {accessories.map((a, i) => (
            <motion.div
              key={a.id}
              data-testid={`accessory-card-${a.id}`}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="group overflow-hidden rounded-3xl border border-black/5 bg-white transition-shadow duration-300 hover:shadow-xl hover:shadow-ink/10"
            >
              <div className="relative overflow-hidden">
                <img src={a.image} alt={a.name} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink backdrop-blur">{a.group}</span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-bold text-ink">{a.name}</h3>
                <p className="mt-1 text-sm text-ink/60">{a.tagline}</p>
                <Link
                  to={`/quote/product?cat=accessories&model=${encodeURIComponent(a.name)}`}
                  data-testid={`accessory-quote-btn-${a.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand transition-colors hover:text-brand-hover"
                >
                  Request quote <ArrowUpRight size={13} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <Reveal className="mt-16">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-ink p-8 text-paper sm:flex-row sm:items-center lg:p-10 grain relative overflow-hidden">
            <div>
              <p className="eyebrow !text-brand">Not sure what fits?</p>
              <p className="mt-2 max-w-md font-display text-xl font-bold sm:text-2xl">Tell us your device — we'll match the right accessories.</p>
            </div>
            <Link to="/quote/product" data-testid="accessories-quote-cta" className="group flex shrink-0 items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-hover">
              Start a quote <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
