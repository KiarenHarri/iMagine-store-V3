export default function Marquee({ items, dark = false }) {
  const row = [...items, ...items];
  return (
    <div
      data-testid="editorial-marquee"
      className={`relative overflow-hidden border-y py-4 ${
        dark ? "border-white/10 bg-ink text-paper" : "border-black/10 bg-white text-ink"
      }`}
    >
      <div className="animate-marquee flex w-max items-center whitespace-nowrap font-mono text-[11px] sm:text-xs uppercase tracking-[0.35em]">
        {row.map((t, i) => (
          <span key={i} className="flex items-center">
            <span className="px-6">{t}</span>
            <span className="text-brand">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
