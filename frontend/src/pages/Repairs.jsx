import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Wrench, BadgeCheck, Search, Building2, GraduationCap, Clock } from "lucide-react";
import { Marquee, MaskedLine, Reveal } from "../components/Shared";
import { lookupRepair } from "../lib/client";
import { repairServices, repairDevices, BRAND, IMAGES } from "../lib/data";

function StatusLookup() {
  const [ref, setRef] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const check = async (e) => {
    e.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await lookupRepair(ref);
      setResult(data);
    } catch {
      setError("No repair found for that reference. Check the code on your confirmation (e.g. IMR-AB12CD).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="repair-status-lookup" className="rounded-3xl border border-black/5 bg-white p-7 lg:p-9">
      <p className="eyebrow">Track a repair</p>
      <h3 className="mt-2 font-display text-xl font-bold text-ink">Enter your repair reference</h3>
      <form onSubmit={check} className="mt-5 flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
          <input
            data-testid="repair-status-input"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="IMR-XXXXXX"
            className="w-full rounded-full border border-ink/10 bg-paper py-3 pl-10 pr-4 text-sm uppercase outline-none transition-colors focus:border-brand"
          />
        </div>
        <button
          type="submit"
          data-testid="repair-status-submit"
          disabled={loading}
          className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand disabled:opacity-50"
        >
          {loading ? "…" : "Check"}
        </button>
      </form>
      {result && (
        <div data-testid="repair-status-result" className="mt-5 rounded-2xl bg-paper p-5 text-sm">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand">{result.reference}</p>
          <p className="mt-2 font-semibold text-ink">{result.device} — {result.issue}</p>
          <p className="mt-1 text-ink/60">Status: <span className="font-semibold text-ink">{result.status}</span></p>
        </div>
      )}
      {error && <p data-testid="repair-status-error" className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function BlueprintEdit() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const imgR = useTransform(scrollYProgress, [0, 1], [-2.5, 2.5]);
  const chipY1 = useTransform(scrollYProgress, [0, 1], [120, -140]);
  const chipY2 = useTransform(scrollYProgress, [0, 1], [-60, 90]);
  const chipY3 = useTransform(scrollYProgress, [0, 1], [90, -60]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 120, damping: 16 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 120, damping: 16 });

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const chips = [
    { t: "Board-level diagnostics", y: chipY1, cls: "left-4 top-[55%] sm:left-10" },
    { t: "Certified technicians", y: chipY2, cls: "right-4 top-1/3 sm:right-12" },
    { t: "OEM-grade parts", y: chipY3, cls: "bottom-12 left-1/4" },
  ];

  return (
    <section
      ref={ref}
      data-testid="blueprint-edit"
      onMouseMove={onMove}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      className="relative overflow-hidden bg-[#0b3d91] py-20 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <p className="select-none whitespace-nowrap font-display text-[20vw] font-black leading-none tracking-tighter" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.12)", color: "transparent" }}>
          PRECISION
        </p>
      </div>
      <div className="relative mx-auto max-w-5xl px-4 sm:px-8">
        <Reveal>
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Every repair, down to the millimetre.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
              Scroll and move your cursor — the drawing floats with you. That's the level of detail our technicians work at.
            </p>
          </div>
        </Reveal>
        <motion.div
          style={{ y: imgY, rotate: imgR, rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
          className="relative z-10 mt-12 will-change-transform"
        >
          <div className="overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl shadow-black/50">
            <img
              src="/assets/blueprint.webp"
              alt="iPhone Pro technical blueprint — front, side, back and camera views"
              data-testid="blueprint-parallax-image"
              loading="lazy"
              decoding="async"
              className="w-full object-cover"
            />
          </div>
        </motion.div>
        {chips.map((c) => (
          <motion.span
            key={c.t}
            style={{ y: c.y }}
            className={`absolute z-20 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white backdrop-blur-md sm:text-xs ${c.cls}`}
          >
            {c.t}
          </motion.span>
        ))}
      </div>
    </section>
  );
}

export default function Repairs() {
  return (
    <div data-testid="repairs-page" className="bg-paper">
      <section className="relative overflow-hidden bg-white py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-8 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-7">
            <MaskedLine delay={0.1}>
              <span className="eyebrow flex items-center gap-2"><Wrench size={13} className="text-brand" /> Repairs &amp; Service</span>
            </MaskedLine>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              <MaskedLine delay={0.2}>Certified care</MaskedLine>
              <MaskedLine delay={0.32}>for every Apple device.</MaskedLine>
            </h1>
            <MaskedLine delay={0.45} className="mt-5 max-w-xl">
              <span className="text-sm leading-relaxed text-ink/65 sm:text-base">
                {BRAND.name} is a leading KwaZulu-Natal Apple Service Provider. Our industry-certified technicians in Westville, Durban handle warranty and out-of-warranty repairs, upgrades and maintenance.
              </span>
            </MaskedLine>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/quote/repair" data-testid="repairs-quote-cta" className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-hover">
                Get a repair quote <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link to="/contact" data-testid="repairs-contact-cta" className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-7 py-3.5 text-sm font-semibold text-ink transition-colors duration-300 hover:border-brand hover:text-brand">
                Book a visit
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <Reveal delay={0.2}>
              <StatusLookup />
            </Reveal>
          </div>
        </div>
      </section>

      <Marquee items={repairDevices.map((d) => `${d} Service`)} />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">What we service</h2>
            </Reveal>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2" data-testid="repair-services-grid">
              {repairServices.map((s, i) => (
                <Reveal key={s} delay={i * 0.05}>
                  <div className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-5">
                    <BadgeCheck size={18} className="mt-0.5 shrink-0 text-brand" />
                    <p className="text-sm font-medium text-ink/80">{s}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { icon: Building2, t: "On-site fleet support", d: "Scheduled repair visits for business fleets." },
                  { icon: GraduationCap, t: "Education specialists", d: "Spring-clean programmes during school holidays." },
                  { icon: Clock, t: "Flexible rates", d: "Hourly, half-day and full-day support options." },
                ].map((f) => (
                  <div key={f.t} className="rounded-2xl bg-ink p-5 text-paper">
                    <f.icon size={18} className="text-brand" />
                    <p className="mt-3 text-sm font-bold">{f.t}</p>
                    <p className="mt-1 text-xs leading-relaxed text-paper/60">{f.d}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-5">
            <Reveal delay={0.15}>
              <div className="rounded-[2rem] bg-ink p-8 text-paper grain relative overflow-hidden">
                <p className="eyebrow !text-brand">Service modes</p>
                <p className="mt-4 font-display text-xl font-bold">Walk-ins welcome at the Westville service centre.</p>
                <p className="mt-2 text-sm leading-relaxed text-paper/60">
                  Collection and courier options available, plus scheduled on-site visits for business and education fleets.
                </p>
                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-paper/40">Devices we service</p>
                  <p className="mt-2 text-sm font-semibold tracking-wide text-paper/80">Mac · iPhone · iPad · iPod · Apple Watch · Beats</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <BlueprintEdit />
    </div>
  );
}
