import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { MaskedLine, Reveal } from "../components/motion";
import Marquee from "../components/Marquee";
import { BRAND, IMAGES } from "../lib/data";

const VALUES = [
  { n: "01", t: "Accessible", d: "Our Apple Service Centre in Westville, Durban puts certified technicians close by — for Mac, iPhone, iPad, Watch, Beats and accessories." },
  { n: "02", t: "Reliable", d: "Honest advice on upgrades and accessories that won't void your warranty, plus quick training options in our service centre." },
  { n: "03", t: "Flexible", d: "On-site visits, scheduled fleet repairs and school-holiday clean-ups — a service model shaped around your requirements." },
  { n: "04", t: "Adaptable", d: "Service Level Agreements, managed services partnerships and flexible payment options that suit your budget." },
];

export default function About() {
  return (
    <div data-testid="about-page" className="bg-paper">
      <section className="relative overflow-hidden bg-ink py-16 text-paper grain lg:py-24">
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-brand/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
          <MaskedLine delay={0.1}>
            <span className="eyebrow !text-brand">About us — Est. {BRAND.established}</span>
          </MaskedLine>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <MaskedLine delay={0.2}>Educate.</MaskedLine>
            <MaskedLine delay={0.32}>
              <span className="text-brand">Innovate.</span>
            </MaskedLine>
            <MaskedLine delay={0.44}>Entertain.</MaskedLine>
          </h1>
          <MaskedLine delay={0.58} className="mt-6 max-w-2xl">
            <span className="text-sm leading-relaxed text-paper/65 sm:text-base">
              {BRAND.legal} is a South African company providing creative ICT tools for enterprises, professionals, education and consumers — reimagining the computer store concept, online and through educational consultancy.
            </span>
          </MaskedLine>
        </div>
      </section>

      <Marquee items={["Apple Reseller", "Adobe", "Promise", "Education Brands", "Software Development", "IT Consultancy"]} />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Who we are</h2>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink/70 sm:text-base">
                <p>
                  iMagine represents Apple, Adobe, Promise and other leading educational brands. The iMagine Store serves as a dedicated Apple Reseller, giving customers access to the latest Apple products and technologies.
                </p>
                <p>
                  Beyond retail, iMagine offers software development — a full range of application development and IT consultancy services — delivering end-to-end solutions for the creative, education and professional industries.
                </p>
                <p>
                  Our passion for all things Apple doesn't stop at great products. As a leading KwaZulu-Natal Apple Service Provider, our certified service team handles everything from general maintenance to warranty and out-of-warranty repairs.
                </p>
              </div>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-black/10 bg-black/10 sm:grid-cols-2" data-testid="about-values">
              {VALUES.map((v, i) => (
                <Reveal key={v.n} delay={i * 0.06} className="h-full">
                  <div className="group h-full bg-white p-6 transition-colors duration-300 hover:bg-ink">
                    <p className="font-mono text-xs tracking-[0.3em] text-brand">{v.n}</p>
                    <h3 className="mt-4 font-display text-lg font-bold text-ink transition-colors duration-300 group-hover:text-white">{v.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/60 transition-colors duration-300 group-hover:text-white/60">{v.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <Reveal delay={0.15}>
              <div className="overflow-hidden rounded-[2rem]">
                <img src={IMAGES.ecosystem} alt="Apple ecosystem on a desk" className="aspect-[4/5] w-full object-cover" />
              </div>
              <div className="mt-6 rounded-3xl bg-ink p-7 text-paper grain relative overflow-hidden">
                <p className="eyebrow !text-brand">Why choose iMagine</p>
                <p className="mt-3 text-sm leading-relaxed text-paper/70">
                  An exclusive gateway to the world of Apple — a seamless experience for professionals, educators and anyone looking to enhance their digital lifestyle.
                </p>
                <Link to="/quote/product" data-testid="about-quote-cta" className="group mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-hover">
                  Start a quote <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-black/5 bg-white py-14 lg:py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-8 lg:px-12">
          <Reveal>
            <p className="eyebrow">Find us</p>
            <p className="mt-2 flex items-center gap-2 font-display text-xl font-bold text-ink sm:text-2xl">
              <MapPin size={20} className="text-brand" /> {BRAND.location}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link to="/contact" data-testid="about-contact-cta" className="rounded-full border border-ink/15 px-7 py-3.5 text-sm font-semibold text-ink transition-colors duration-300 hover:border-brand hover:text-brand">
              Contact the team
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
