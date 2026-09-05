import { useState } from "react";
import { motion, useTransform, useMotionValue, animate } from "framer-motion";
import { IMAGES } from "../lib/data";

const COLORS = [
  { id: "natural", label: "Natural Titanium", frame: "#9a9184", frameDark: "#6e675c", tint: "rgba(196,189,175,0.38)", swatch: "#c3bcae", wallpaper: "from-[#17171a] via-[#2b2620] to-brand/50" },
  { id: "blue", label: "Blue Titanium", frame: "#33445a", frameDark: "#22303f", tint: "rgba(51,68,90,0.55)", swatch: "#39485e", wallpaper: "from-[#10151d] via-[#1c2735] to-brand/40" },
  { id: "white", label: "White Titanium", frame: "#c9c6bc", frameDark: "#a09d93", tint: "rgba(235,232,224,0.45)", swatch: "#e3e0d9", wallpaper: "from-[#1a1a1e] via-[#2e2e33] to-brand/45" },
  { id: "black", label: "Black Titanium", frame: "#1d1d21", frameDark: "#101013", tint: "rgba(24,24,28,0.5)", swatch: "#2b2b30", wallpaper: "from-[#0f0f12] via-[#1d1d22] to-brand/45" },
];

const DEPTH = 8;

const AppleLogo = ({ className }) => (
  <svg viewBox="0 0 384 512" className={className} fill="currentColor" aria-hidden="true">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

const playSpinSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1400, t);
    og.gain.setValueAtTime(0.12, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(og).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
    const dur = 1;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = "bandpass";
    filt.Q.value = 1.1;
    filt.frequency.setValueAtTime(300, t + 0.05);
    filt.frequency.exponentialRampToValueAtTime(2400, t + 0.5);
    filt.frequency.exponentialRampToValueAtTime(380, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filt).connect(g).connect(ctx.destination);
    src.start(t + 0.05);
    src.stop(t + dur + 0.05);
    setTimeout(() => ctx.close(), (dur + 0.4) * 1000);
  } catch {}
};

export default function Phone3D({ progress }) {
  const [color, setColor] = useState(COLORS[0]);
  const spin = useMotionValue(0);
  const scrollRot = useTransform(progress, [0, 1], [-22, 698]);
  const rotY = useTransform([scrollRot, spin], ([a, b]) => a + b);
  const float = useTransform(progress, [0, 1], [10, -70]);

  const pick = (c) => {
    if (c.id === color.id) return;
    setColor(c);
    playSpinSound();
    animate(spin, spin.get() + 360, { duration: 1.1, ease: [0.16, 1, 0.3, 1] });
  };

  const edgeV = {
    position: "absolute",
    top: 12,
    bottom: 12,
    width: DEPTH * 2,
    background: `linear-gradient(90deg, ${color.frameDark}, ${color.frame}, ${color.frameDark})`,
    transition: "background 0.5s",
  };
  const edgeH = {
    position: "absolute",
    left: 12,
    right: 12,
    height: DEPTH * 2,
    background: `linear-gradient(180deg, ${color.frameDark}, ${color.frame}, ${color.frameDark})`,
    transition: "background 0.5s",
  };

  return (
    <div className="relative mx-auto w-52 sm:w-60 lg:w-64">
      <div style={{ perspective: 1400 }} data-testid="hero-iphone-3d">
        <motion.div
          style={{ rotateY: rotY, y: float, transformStyle: "preserve-3d" }}
          className="relative aspect-[9/19] w-full will-change-transform"
        >
          <div style={{ ...edgeV, left: -DEPTH, transform: "rotateY(90deg)", borderRadius: 8 }}>
            <span className="absolute left-1/2 top-14 h-9 w-[3px] -translate-x-1/2 rounded-full bg-black/40" />
            <span className="absolute left-1/2 top-28 h-12 w-[3px] -translate-x-1/2 rounded-full bg-black/40" />
          </div>
          <div style={{ ...edgeV, right: -DEPTH, transform: "rotateY(90deg)", borderRadius: 8 }}>
            <span className="absolute left-1/2 top-24 h-14 w-[3px] -translate-x-1/2 rounded-full bg-black/40" />
          </div>
          <div style={{ ...edgeH, top: -DEPTH, transform: "rotateX(90deg)", borderRadius: 8 }} />
          <div style={{ ...edgeH, bottom: -DEPTH, transform: "rotateX(90deg)", borderRadius: 8 }} />

          <div
            className="absolute inset-0 overflow-hidden rounded-[2.8rem] border-[5px] bg-black shadow-2xl shadow-ink/40"
            style={{ backfaceVisibility: "hidden", transform: `translateZ(${DEPTH}px)`, borderColor: color.frame, transition: "border-color 0.5s" }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-500 ${color.wallpaper}`} />
            <div className="absolute left-1/2 top-2.5 h-[22px] w-24 -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10" />
            <div className="absolute inset-0 flex flex-col items-center pt-16">
              <p className="font-display text-5xl font-extrabold tracking-tight text-white sm:text-6xl">9:41</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.25em] text-white/50">Friday 5 September</p>
              <div className="mt-auto mb-8 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
                <img src="/assets/logo.png" alt="iMagine" className="h-4 w-4 rounded-full object-cover" />
                <span className="text-[11px] font-semibold text-white/90">iMagine Store</span>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/10" />
          </div>

          <div
            className="absolute inset-0 overflow-hidden rounded-[2.8rem] border-[5px] shadow-2xl shadow-ink/40"
            style={{ backfaceVisibility: "hidden", transform: `rotateY(180deg) translateZ(${DEPTH}px)`, borderColor: color.frame, transition: "border-color 0.5s" }}
          >
            <img src={IMAGES.iphone15pro} alt="iPhone titanium back with camera system" className="h-full w-full object-cover" />
            <div className="absolute inset-0 transition-colors duration-500" style={{ background: color.tint, mixBlendMode: "multiply" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <AppleLogo className="h-10 w-10 text-white/60 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] sm:h-12 sm:w-12" />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20" />
          </div>
        </motion.div>
        <div className="mx-auto mt-8 h-5 w-3/4 rounded-[50%] bg-ink/15 blur-xl" />
      </div>

      <div className="mt-6 flex flex-col items-center gap-2.5" data-testid="hero-color-picker">
        <div className="flex items-center gap-3">
          {COLORS.map((c) => (
            <button
              key={c.id}
              data-testid={`hero-color-${c.id}`}
              onClick={() => pick(c)}
              aria-label={c.label}
              className={`h-8 w-8 rounded-full ring-1 ring-ink/15 transition-all duration-300 ${
                color.id === c.id ? "scale-110 ring-2 ring-brand shadow-lg shadow-brand/30" : "shadow hover:scale-105"
              }`}
              style={{ background: c.swatch }}
            />
          ))}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mute" data-testid="hero-color-label">{color.label}</p>
      </div>
    </div>
  );
}
