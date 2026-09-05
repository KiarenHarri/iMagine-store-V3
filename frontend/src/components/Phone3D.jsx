import { useState } from "react";
import { motion, useTransform, useMotionValue, animate } from "framer-motion";

const COLORS = [
  { id: "natural", label: "Natural Titanium", body: "linear-gradient(160deg,#ddd7cb 0%,#c3bcae 45%,#a89f8f 100%)", module: "linear-gradient(160deg,#cfc8ba,#b0a795)", swatch: "#c3bcae", wallpaper: "from-[#17171a] via-[#2b2620] to-brand/50", text: "text-white" },
  { id: "blue", label: "Blue Titanium", body: "linear-gradient(160deg,#4d607a 0%,#39485e 45%,#26303f 100%)", module: "linear-gradient(160deg,#42546c,#2e3a4b)", swatch: "#39485e", wallpaper: "from-[#10151d] via-[#1c2735] to-brand/40", text: "text-white" },
  { id: "white", label: "White Titanium", body: "linear-gradient(160deg,#f4f2ee 0%,#e3e0d9 45%,#cfccc2 100%)", module: "linear-gradient(160deg,#e9e6df,#d4d1c7)", swatch: "#e3e0d9", wallpaper: "from-[#1a1a1e] via-[#2e2e33] to-brand/45", text: "text-white" },
  { id: "black", label: "Black Titanium", body: "linear-gradient(160deg,#3c3c42 0%,#2b2b30 45%,#19191d 100%)", module: "linear-gradient(160deg,#343439,#232327)", swatch: "#2b2b30", wallpaper: "from-[#0f0f12] via-[#1d1d22] to-brand/45", text: "text-white" },
];

const Lens = ({ className }) => (
  <span
    className={`absolute h-[26%] w-[44%] rounded-full ${className}`}
    style={{
      background: "radial-gradient(circle at 35% 30%, #4a5568 0%, #1a202c 45%, #05070a 100%)",
      boxShadow: "0 0 0 3px rgba(0,0,0,0.35), inset 0 0 6px rgba(255,255,255,0.15)",
    }}
  />
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
  const scrollRot = useTransform(progress, [0, 1], [-22, 338]);
  const rotY = useTransform([scrollRot, spin], ([a, b]) => a + b);
  const float = useTransform(progress, [0, 1], [10, -70]);

  const pick = (c) => {
    if (c.id === color.id) return;
    setColor(c);
    playSpinSound();
    animate(spin, spin.get() + 360, { duration: 1.1, ease: [0.16, 1, 0.3, 1] });
  };

  return (
    <div className="relative mx-auto w-52 sm:w-60 lg:w-64">
      <div style={{ perspective: 1200 }} data-testid="hero-iphone-3d">
        <motion.div
          style={{ rotateY: rotY, y: float, transformStyle: "preserve-3d" }}
          className="relative aspect-[9/19] w-full will-change-transform"
        >
          <div
            className="absolute inset-0 overflow-hidden rounded-[2.8rem] border-[5px] border-[#2b2b30] bg-black shadow-2xl shadow-ink/40"
            style={{ backfaceVisibility: "hidden" }}
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
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15" />
          </div>
          <div
            className="absolute inset-0 overflow-hidden rounded-[2.8rem] border-[5px] border-[#2b2b30] shadow-2xl shadow-ink/40 transition-all duration-500"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: color.body }}
          >
            <div
              className="absolute left-[8%] top-[5%] aspect-square w-[42%] rounded-[30%] transition-all duration-500"
              style={{ background: color.module, boxShadow: "0 4px 14px rgba(0,0,0,0.35)" }}
            >
              <Lens className="left-[6%] top-[6%]" />
              <Lens className="right-[6%] top-[22%]" />
              <Lens className="bottom-[6%] left-[6%]" />
              <span className="absolute bottom-[12%] right-[16%] h-[10%] w-[18%] rounded-full bg-[#f5e9c8]/90 shadow" />
            </div>
            <p className="absolute bottom-[7%] left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.35em] text-white/40">
              {color.label}
            </p>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20" />
          </div>
          <div className="absolute -left-[7px] top-20 h-10 w-[3px] rounded-full bg-[#3a3a3f]" />
          <div className="absolute -left-[7px] top-32 h-14 w-[3px] rounded-full bg-[#3a3a3f]" />
          <div className="absolute -right-[7px] top-24 h-16 w-[3px] rounded-full bg-[#3a3a3f]" />
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
