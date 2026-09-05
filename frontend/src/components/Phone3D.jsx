import { motion, useTransform } from "framer-motion";
import { IMAGES } from "../lib/data";

export default function Phone3D({ progress }) {
  const rotY = useTransform(progress, [0, 1], [-22, 338]);
  const float = useTransform(progress, [0, 1], [10, -70]);

  return (
    <div style={{ perspective: 1200 }} className="relative mx-auto w-52 sm:w-60 lg:w-64" data-testid="hero-iphone-3d">
      <motion.div
        style={{ rotateY: rotY, y: float, transformStyle: "preserve-3d" }}
        className="relative aspect-[9/19] w-full will-change-transform"
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-[2.8rem] border-[5px] border-[#2b2b30] bg-black shadow-2xl shadow-ink/40"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#17171a] via-[#26262c] to-brand/50" />
          <div className="absolute left-1/2 top-2.5 h-[22px] w-24 -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10" />
          <div className="absolute inset-0 flex flex-col items-center pt-16">
            <p className="font-display text-5xl font-extrabold tracking-tight text-white sm:text-6xl">9:41</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.25em] text-white/50">Friday 5 September</p>
            <div className="mt-auto mb-8 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
              <img src="/assets/logo.png" alt="iMagine" className="h-4 w-4 rounded-full object-cover" />
              <span className="text-[11px] font-semibold text-white/90">iMagine Store</span>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15" />
        </div>
        <div
          className="absolute inset-0 overflow-hidden rounded-[2.8rem] border-[5px] border-[#2b2b30] shadow-2xl shadow-ink/40"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <img src={IMAGES.iphone15pro} alt="iPhone Pro back — titanium with camera system" className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
        </div>
        <div className="absolute -left-[7px] top-20 h-10 w-[3px] rounded-full bg-[#3a3a3f]" />
        <div className="absolute -left-[7px] top-32 h-14 w-[3px] rounded-full bg-[#3a3a3f]" />
        <div className="absolute -right-[7px] top-24 h-16 w-[3px] rounded-full bg-[#3a3a3f]" />
      </motion.div>
      <div className="mx-auto mt-8 h-5 w-3/4 rounded-[50%] bg-ink/15 blur-xl" />
    </div>
  );
}
