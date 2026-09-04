import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { WizardShell, OptionCard, SuccessPanel, fieldCls } from "../components/Wizard";
import { submitProductQuote } from "../lib/api";
import { categories, products, accessories } from "../lib/data";

const STORAGE = ["128GB", "256GB", "512GB", "1TB", "Not sure yet"];
const ADDONS = ["AirPods", "AppleCare-style cover", "Case & screen protector", "MagSafe charger", "Magic Keyboard", "Apple Pencil"];

export default function ProductQuote() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    category: params.get("cat") || "",
    model: params.get("model") || "",
    storage: "",
    trade_in: false,
    accessories: [],
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [done, setDone] = useState(null);
  const [sending, setSending] = useState(false);

  const models = useMemo(() => {
    if (!form.category) return [];
    if (form.category === "accessories") return accessories.map((a) => a.name);
    return products.filter((p) => p.category === form.category).map((p) => p.name);
  }, [form.category]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleAddon = (a) =>
    set("accessories", form.accessories.includes(a) ? form.accessories.filter((x) => x !== a) : [...form.accessories, a]);

  const canNext =
    (step === 1 && !!form.category) ||
    (step === 2 && !!form.model) ||
    step === 3 ||
    (step === 4 && form.name.trim() && /\S+@\S+\.\S+/.test(form.email) && !sending);

  const next = async () => {
    if (step < 4) return setStep(step + 1);
    setSending(true);
    try {
      const { data } = await submitProductQuote(form);
      setDone(data.reference);
    } catch {
      toast.error("Could not submit your quote. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="bg-paper">
        <SuccessPanel
          testId="product-quote-success"
          reference={done}
          title="Quote request received."
          body="The iMagine team in Westville, Durban will prepare your personalised quotation — including current pricing and availability — and get back to you."
        />
      </div>
    );
  }

  return (
    <div data-testid="product-quote-page" className="min-h-[70vh] bg-paper">
      <WizardShell
        testId="product-wizard"
        step={step}
        total={4}
        title="Product quote wizard"
        subtitle={["What are you after?", "Pick your model.", "Extras & trade-in.", "Where do we send the quote?"][step - 1]}
        onBack={() => setStep(step - 1)}
        onNext={next}
        nextDisabled={!canNext}
        nextLabel={step === 4 ? (sending ? "Submitting…" : "Submit quote request") : "Continue"}
      >
        {step === 1 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" data-testid="pq-step-category">
            {categories.map((c) => (
              <OptionCard
                key={c.slug}
                testId={`pq-cat-${c.slug}`}
                title={c.name}
                desc={c.tagline}
                selected={form.category === c.slug}
                onClick={() => setForm((f) => ({ ...f, category: c.slug, model: "" }))}
              />
            ))}
          </div>
        )}

        {step === 2 && (
          <div data-testid="pq-step-model">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {models.map((m) => (
                <OptionCard key={m} testId={`pq-model-${m.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} title={m} selected={form.model === m} onClick={() => set("model", m)} />
              ))}
              <OptionCard testId="pq-model-other" title="Something else / not sure" desc="Tell us in the notes at the end." selected={form.model === "Other"} onClick={() => set("model", "Other")} />
            </div>
            {form.category !== "accessories" && (
              <div className="mt-8">
                <p className="eyebrow mb-3">Storage preference</p>
                <div className="flex flex-wrap gap-2" data-testid="pq-storage-options">
                  {STORAGE.map((s) => (
                    <button
                      key={s}
                      type="button"
                      data-testid={`pq-storage-${s.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      onClick={() => set("storage", s)}
                      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                        form.storage === s ? "bg-brand text-white" : "border border-ink/10 bg-white text-ink/70 hover:border-brand hover:text-brand"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div data-testid="pq-step-extras">
            <div className="rounded-2xl border border-ink/10 bg-white p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-display text-base font-bold text-ink">Trading in a device?</p>
                  <p className="mt-1 text-sm text-ink/60">We'll include a trade-in evaluation with your quote.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.trade_in}
                  data-testid="pq-tradein-toggle"
                  onClick={() => set("trade_in", !form.trade_in)}
                  className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-300 ${form.trade_in ? "bg-brand" : "bg-ink/15"}`}
                >
                  <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all duration-300 ${form.trade_in ? "left-7" : "left-1"}`} />
                </button>
              </div>
            </div>
            <p className="eyebrow mb-3 mt-8">Add accessories to the quote</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" data-testid="pq-addons">
              {ADDONS.map((a) => (
                <OptionCard key={a} testId={`pq-addon-${a.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} title={a} selected={form.accessories.includes(a)} onClick={() => toggleAddon(a)} />
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-testid="pq-step-contact">
            <input data-testid="pq-name-input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name *" className={fieldCls} />
            <input data-testid="pq-email-input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email address *" className={fieldCls} />
            <input data-testid="pq-phone-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone (optional)" className={fieldCls} />
            <textarea data-testid="pq-notes-input" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Anything else we should know?" rows={1} className={`${fieldCls} resize-none`} />
            <div className="rounded-2xl bg-ink p-5 text-paper sm:col-span-2">
              <p className="eyebrow !text-brand">Summary</p>
              <p className="mt-2 text-sm" data-testid="pq-summary">
                {form.model || "—"} {form.storage ? `· ${form.storage}` : ""} {form.trade_in ? "· Trade-in" : ""}
                {form.accessories.length ? ` · +${form.accessories.length} accessory${form.accessories.length > 1 ? "ies" : ""}` : ""}
              </p>
              <p className="mt-1 text-xs text-paper/50">Pricing &amp; availability will be confirmed by the team — nothing is billed online.</p>
            </div>
          </div>
        )}
      </WizardShell>
    </div>
  );
}
