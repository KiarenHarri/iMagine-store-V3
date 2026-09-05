import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, RotateCcw, Info } from "lucide-react";
import { MaskedLine, Reveal, ease } from "../components/motion";
import { TRADE_IN, CONDITION_MULTIPLIERS } from "../lib/data";

const money = (n) => `R ${(Math.round(n / 100) * 100).toLocaleString("en-ZA")}`;

export default function TradeIn() {
  const [device, setDevice] = useState("");
  const [gen, setGen] = useState(null);
  const [cond, setCond] = useState(null);

  const estimate = device && gen && cond
    ? [money(gen.base[0] * cond.m), money(gen.base[1] * cond.m)]
    : null;

  const pill = (active) =>
    `rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200 ${
      active ? "bg-brand text-white" : "border border-ink/10 bg-white text-ink/70 hover:border-brand hover:text-brand"
    }`;

  return (
    <div data-testid="tradein-page" className="bg-paper">
      <section className="relative overflow-hidden bg-ink py-16 text-paper grain lg:py-24">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
          <MaskedLine delay={0.1}>
            <span className="eyebrow !text-brand flex items-center gap-2"><RotateCcw size={13} /> Trade-in estimator</span>
          </MaskedLine>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <MaskedLine delay={0.2}>What's your old</MaskedLine>
            <MaskedLine delay={0.32}>
              <span className="text-brand">device worth?</span>
            </MaskedLine>
          </h1>
          <MaskedLine delay={0.45} className="mt-5 max-w-xl">
            <span className="text-sm leading-relaxed text-paper/60 sm:text-base">
              Three taps for an instant indication — then lock in an official valuation with your quote.
            </span>
          </MaskedLine>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-8 lg:py-20">
        <Reveal>
          <p className="eyebrow mb-4">01 — Your device</p>
          <div className="flex flex-wrap gap-2" data-testid="tradein-devices">
            {Object.keys(TRADE_IN).map((d) => (
              <button key={d} data-testid={`tradein-device-${d.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} onClick={() => { setDevice(d); setGen(null); }} className={pill(device === d)}>
                {d}
              </button>
            ))}
          </div>
        </Reveal>

        {device && (
          <Reveal className="mt-10">
            <p className="eyebrow mb-4">02 — Generation</p>
            <div className="flex flex-wrap gap-2" data-testid="tradein-gens">
              {TRADE_IN[device].map((g) => (
                <button key={g.label} data-testid={`tradein-gen-${g.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} onClick={() => setGen(g)} className={pill(gen?.label === g.label)}>
                  {g.label}
                </button>
              ))}
            </div>
          </Reveal>
        )}

        {gen && (
          <Reveal className="mt-10">
            <p className="eyebrow mb-4">03 — Condition</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" data-testid="tradein-conditions">
              {CONDITION_MULTIPLIERS.map((c) => (
                <button
                  key={c.id}
                  data-testid={`tradein-cond-${c.id}`}
                  onClick={() => setCond(c)}
                  className={`rounded-2xl border p-5 text-left transition-all duration-200 ${
                    cond?.id === c.id ? "border-brand bg-brand-subtle shadow-lg shadow-brand/10" : "border-ink/10 bg-white hover:border-brand/50"
                  }`}
                >
                  <p className={`font-display text-base font-bold ${cond?.id === c.id ? "text-brand" : "text-ink"}`}>{c.label}</p>
                  <p className="mt-1 text-sm text-ink/60">{c.desc}</p>
                </button>
              ))}
            </div>
          </Reveal>
        )}

        <AnimatePresence>
          {estimate && (
            <motion.div
              data-testid="tradein-result"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease }}
              className="mt-12 overflow-hidden rounded-3xl bg-ink p-8 text-paper grain relative lg:p-10"
            >
              <p className="eyebrow !text-brand">Indicative trade-in value</p>
              <p className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl" data-testid="tradein-estimate">
                {estimate[0]} <span className="text-paper/40">–</span> {estimate[1]}
              </p>
              <p className="mt-3 text-sm text-paper/60">
                {device} · {gen.label} · {cond.label}
              </p>
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-paper/50" data-testid="tradein-disclaimer">
                <Info size={14} className="mt-0.5 shrink-0 text-brand" />
                Placeholder estimate for illustration only — not a store offer. The iMagine team confirms the final trade-in value after a physical assessment.
              </p>
              <Link
                to="/quote/product?tradein=1"
                data-testid="tradein-quote-cta"
                className="group mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-hover"
              >
                Get my official trade-in quote <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
