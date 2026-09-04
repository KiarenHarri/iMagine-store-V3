import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { ease } from "../components/motion";

export const WizardShell = ({ step, total, title, subtitle, children, onBack, onNext, nextDisabled, nextLabel = "Continue", testId }) => (
  <div data-testid={testId} className="mx-auto max-w-3xl px-4 py-14 sm:px-8 lg:py-20">
    <div className="mb-10">
      <div className="flex items-center justify-between">
        <p className="eyebrow">{title}</p>
        <p className="font-mono text-xs tracking-[0.25em] text-mute">
          {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </div>
      <div className="mt-4 flex gap-1.5" data-testid={`${testId}-progress`}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i < step ? "bg-brand" : "bg-ink/10"}`}
          />
        ))}
      </div>
      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{subtitle}</h1>
    </div>

    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.45, ease }}
      >
        {children}
      </motion.div>
    </AnimatePresence>

    <div className="mt-10 flex items-center justify-between">
      {step > 1 ? (
        <button onClick={onBack} data-testid={`${testId}-back-btn`} className="flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:border-brand hover:text-brand">
          <ArrowLeft size={15} /> Back
        </button>
      ) : (
        <span />
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        data-testid={`${testId}-next-btn`}
        className="group flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {nextLabel} <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </div>
  </div>
);

export const OptionCard = ({ selected, onClick, title, desc, testId }) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={testId}
    className={`group w-full rounded-2xl border p-5 text-left transition-all duration-200 ${
      selected ? "border-brand bg-brand-subtle shadow-lg shadow-brand/10" : "border-ink/10 bg-white hover:border-brand/50"
    }`}
  >
    <div className="flex items-center justify-between">
      <p className={`font-display text-base font-bold ${selected ? "text-brand" : "text-ink"}`}>{title}</p>
      <span className={`h-4 w-4 rounded-full border-2 transition-colors duration-200 ${selected ? "border-brand bg-brand" : "border-ink/20"}`} />
    </div>
    {desc && <p className="mt-1.5 text-sm text-ink/60">{desc}</p>}
  </button>
);

export const SuccessPanel = ({ reference, title, body, testId }) => (
  <div data-testid={testId} className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-8 lg:py-28">
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease }}>
      <div className="rounded-3xl bg-ink p-10 text-paper grain relative overflow-hidden lg:p-14">
        <CheckCircle2 size={48} className="mx-auto text-brand" />
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-paper/60">{body}</p>
        <div className="mt-8 inline-block rounded-2xl border border-brand/40 bg-brand/10 px-8 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-paper/50">Your reference</p>
          <p data-testid={`${testId}-reference`} className="mt-1 font-mono text-2xl font-bold tracking-widest text-brand">{reference}</p>
        </div>
        <p className="mt-6 text-xs text-paper/40">Keep this reference — you can use it to track progress.</p>
      </div>
    </motion.div>
  </div>
);

export const fieldCls =
  "w-full rounded-2xl border border-ink/10 bg-white px-5 py-3.5 text-sm outline-none transition-colors focus:border-brand";
