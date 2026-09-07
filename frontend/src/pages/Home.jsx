import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, ArrowUpRight, Wrench, BadgeCheck, MapPin, RotateCcw } from "lucide-react";
import { ease, Marquee, MaskedLine, Reveal, SaleStrip } from "../components/Shared";
import Phone3D from "../components/Phone3D";
import { categories, chapters, IMAGES, MARQUEE_ITEMS, BRAND } from "../lib/data";

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const sScale = useTransform(scrollYProgress, [0, 1], [1, 1.07]);
  const ringY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const ringRot = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const chipY = useTransform(scrollYProgress, [0, 1], [0, -70]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 120, damping: 16 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 120, damping: 16 });

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section ref={ref} data-testid="hero-section" className="relative overflow-hidden bg-paper">
      <motion.div style={{ y: bgY }} className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full bg-brand/10 blur-3xl" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 pb-20 pt-14 sm:px-8 lg:grid-cols-12 lg:px-12 lg:pb-28 lg:pt-24">
        <div className="lg:col-span-7">
          <MaskedLine delay={0.1}>
            <span className="eyebrow flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
              {BRAND.role} — Est. {BRAND.established}
            </span>
          </MaskedLine>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            <MaskedLine delay={0.2}>Apple,</MaskedLine>
            <MaskedLine delay={0.32}>
              <span className="text-brand">reimagined</span>
            </MaskedLine>
            <MaskedLine delay={0.44}>for South Africa.</MaskedLine>
          </h1>
          <MaskedLine delay={0.6} className="mt-7 max-w-xl">
            <span className="text-base leading-relaxed text-ink/70 sm:text-lg">
              {BRAND.legal} brings the full Apple ecosystem to {BRAND.location} — new &amp; pre-owned devices, certified repairs, and consulting under one roof.
            </span>
          </MaskedLine>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75, ease }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/shop"
              data-testid="hero-shop-cta"
              className="group flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand"
            >
              Shop the collections
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/quote/repair"
              data-testid="hero-repair-cta"
              className="group flex items-center gap-2 rounded-full border border-ink/15 px-7 py-3.5 text-sm font-semibold text-ink transition-colors duration-300 hover:border-brand hover:text-brand"
            >
              <Wrench size={15} /> Instant repair quote
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.95 }}
            className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.25em] text-mute"
          >
            <span data-testid="hero-fact-1">New devices</span>
            <span data-testid="hero-fact-2">Pre-owned devices</span>
            <span data-testid="hero-fact-3">Certified service centre</span>
          </motion.div>
        </div>

        <div className="lg:col-span-5" onMouseMove={onMove} onMouseLeave={() => { mx.set(0); my.set(0); }}>
          <motion.div
            style={{ y: imgY, scale: sScale, transformStyle: "preserve-3d" }}
            className="relative will-change-transform"
            data-testid="hero-3d-frame"
          >
            <motion.div
              style={{ y: ringY, rotate: ringRot }}
              className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] border-2 border-dashed border-brand/30"
            />
            <motion.div
              style={{ y: chipY }}
              className="pointer-events-none absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-brand/20 blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.35, ease }}
              className="relative"
            >
              <Phone3D progress={scrollYProgress} rx={rx} ry={ry} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.9, ease }}
              className="absolute -left-4 bottom-32 rounded-2xl border border-white/40 bg-white/70 px-5 py-4 shadow-xl backdrop-blur-xl sm:-left-8"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mute">Now quoting</p>
              <p className="mt-1 font-display text-sm font-bold text-ink">iPhone, Mac, iPad &amp; Watch</p>
              <p className="mt-0.5 text-xs text-brand font-semibold">Price on request</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.05, ease }}
              className="absolute -right-3 top-8 flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2.5 shadow-lg backdrop-blur-xl sm:-right-6"
            >
              <BadgeCheck size={15} className="text-brand" />
              <span className="text-xs font-semibold text-ink">Apple Reseller</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CategoryRail() {
  return (
    <section data-testid="category-rail" className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">The collections</p>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">Shop by device.</h2>
            </div>
            <Link to="/shop" data-testid="rail-view-all" className="group hidden items-center gap-1 text-sm font-semibold text-ink transition-colors hover:text-brand sm:flex">
              View all <ArrowUpRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.07}>
              <Link
                to={c.slug === "accessories" ? "/accessories" : `/shop/${c.slug}`}
                data-testid={`rail-card-${c.slug}`}
                className="group relative block overflow-hidden rounded-3xl bg-paper"
              >
                <div className="overflow-hidden">
                  <img src={c.image} alt={c.name} loading="lazy" className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="font-display text-xl font-bold text-white">{c.name}</p>
                  <p className="mt-1 text-xs text-white/70">{c.tagline}</p>
                  <span className="mt-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors duration-300 group-hover:bg-brand">
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ParallaxEdit() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [90, -140]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-60, 110]);
  const y3 = useTransform(scrollYProgress, [0, 1], [150, -70]);
  const r1 = useTransform(scrollYProgress, [0, 1], [-4, 5]);
  const r3 = useTransform(scrollYProgress, [0, 1], [6, -5]);

  return (
    <section ref={ref} data-testid="parallax-edit" className="relative overflow-hidden bg-ink py-24 text-paper grain lg:py-36">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <p className="text-stroke-dark select-none font-display text-[22vw] font-black leading-none tracking-tighter">EDIT</p>
      </div>
      <div className="relative mx-auto grid max-w-7xl grid-cols-3 items-center gap-4 px-4 sm:px-8 lg:px-12">
        <motion.div style={{ y: y1, rotate: r1 }} className="overflow-hidden rounded-3xl shadow-2xl shadow-black/50">
          <img src={IMAGES.macbook} alt="MacBook — layered parallax" loading="lazy" className="aspect-[3/4] w-full object-cover" />
        </motion.div>
        <motion.div style={{ y: y2 }} className="relative z-10 -mx-6 overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/60 sm:-mx-10">
          <img src={IMAGES.storefront} alt="Apple devices — parallax edit centre frame" data-testid="parallax-center-image" loading="lazy" className="aspect-[3/4] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
          <div className="absolute bottom-0 p-5 sm:p-7">
            <p className="font-display text-lg font-bold leading-snug sm:text-2xl">Every device, staged like a studio shot.</p>
          </div>
        </motion.div>
        <motion.div style={{ y: y3, rotate: r3 }} className="overflow-hidden rounded-3xl shadow-2xl shadow-black/50">
          <img src={IMAGES.watch} alt="Apple Watch — layered parallax" loading="lazy" className="aspect-[3/4] w-full object-cover" />
        </motion.div>
      </div>
      <div className="relative mx-auto mt-16 max-w-7xl px-4 text-center sm:px-8 lg:px-12">
        <Reveal>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-paper/60 sm:text-base">
            Scroll the edit — depth, rotation and light move with you. The same care we give this page, our certified technicians give your devices.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <section data-testid="manifesto" className="bg-paper py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <Reveal>
          <p className="eyebrow">What drives us</p>
          <h2 className="mt-3 max-w-2xl font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Four chapters. One philosophy — <span className="text-brand">{BRAND.philosophy}</span>
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-black/10 bg-black/10 md:grid-cols-2 lg:grid-cols-4">
          {chapters.map((c, i) => (
            <Reveal key={c.n} delay={i * 0.08} className="h-full">
              <div data-testid={`chapter-${c.n}`} className="group relative h-full bg-white p-7 transition-colors duration-300 hover:bg-ink">
                <p className="font-mono text-xs tracking-[0.3em] text-brand">{c.n}</p>
                <h3 className="mt-5 font-display text-xl font-bold text-ink transition-colors duration-300 group-hover:text-white">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/60 transition-colors duration-300 group-hover:text-white/60">{c.body}</p>
                <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand transition-all duration-500 group-hover:w-full" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function RepairsBand() {
  return (
    <section data-testid="repairs-band" className="border-y border-black/5 bg-[#EBEBEE] py-16 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-8 lg:grid-cols-12 lg:px-12">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="eyebrow flex items-center gap-2"><Wrench size={13} className="text-brand" /> Apple Service Centre — Westville</p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
              Broken? Our certified technicians have you covered.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink/65 sm:text-base">
              From warranty and out-of-warranty repairs on Mac, iPhone, iPad, Watch and Beats, to on-site fleet support for schools and business — {BRAND.name} is a leading KwaZulu-Natal Apple Service Provider.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/quote/repair" data-testid="band-repair-quote-cta" className="group flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-hover">
                Get a repair quote <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link to="/repairs" data-testid="band-repairs-cta" className="flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors duration-300 hover:border-brand hover:text-brand">
                Explore repairs
              </Link>
            </div>
          </Reveal>
        </div>
        <div className="lg:col-span-6">
          <Reveal delay={0.15}>
            <div className="relative overflow-hidden rounded-[2rem]">
              <img src={IMAGES.headphones} alt="Device service and care" loading="lazy" className="aspect-[16/10] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink/50 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2">
                {["Mac", "iPhone", "iPad", "Watch", "Beats"].map((d) => (
                  <span key={d} className="rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur">{d}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section data-testid="final-cta" className="relative overflow-hidden bg-ink py-20 text-center text-paper grain lg:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-8">
        <Reveal>
          <p className="eyebrow !text-brand">Ready when you are</p>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
            Get a quote in under two minutes.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-paper/60 sm:text-base">
            Tell us what you need — a new device, a pre-owned gem, or a repair — and the {BRAND.name} team in Westville, Durban will come back to you.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link to="/quote/product" data-testid="final-product-quote-cta" className="group flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-hover">
              Product quote <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link to="/contact" data-testid="final-contact-cta" className="flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold transition-colors duration-300 hover:border-brand hover:text-brand">
              <MapPin size={15} /> Talk to us
            </Link>
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-paper/40">
            <RotateCcw size={12} /> Trade-in evaluation available
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div data-testid="home-page">
      <Hero />
      <Marquee items={MARQUEE_ITEMS} />
      <CategoryRail />
      <SaleStrip />
      <ParallaxEdit />
      <Manifesto />
      <Marquee items={["Warranty Repairs", "Out-of-Warranty Repairs", "On-Site Support", "Quick Training", "Managed Services", "Trade-In Evaluation"]} />
      <RepairsBand />
      <FinalCta />
    </div>
  );
}
