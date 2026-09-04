import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WizardShell, OptionCard, SuccessPanel, fieldCls } from "../components/Wizard";
import { submitRepairQuote } from "../lib/api";
import { useAuth } from "../lib/auth";
import { repairDevices } from "../lib/data";

const ISSUES = ["Cracked / damaged screen", "Battery draining fast", "Won't turn on", "Liquid damage", "Software / slow performance", "Camera or speaker fault", "Something else"];
const MODES = [
  { id: "walk-in", t: "Walk-in — Westville Service Centre", d: "Bring your device to our Durban service centre." },
  { id: "pickup", t: "Collection / courier", d: "Arrange a collection — we'll confirm options with you." },
  { id: "on-site", t: "On-site visit (business & education)", d: "For fleets and scheduled support contracts." },
];

export default function RepairQuote() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    device: "",
    model: "",
    issue: "",
    description: "",
    serial: "",
    service_mode: "walk-in",
    name: "",
    email: "",
    phone: "",
  });
  const [done, setDone] = useState(null);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.name || "",
        email: f.email || user.email || "",
      }));
    }
  }, [user]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const canNext =
    (step === 1 && !!form.device) ||
    (step === 2 && !!form.issue) ||
    step === 3 ||
    (step === 4 && form.name.trim() && /\S+@\S+\.\S+/.test(form.email) && !sending);

  const next = async () => {
    if (step < 4) return setStep(step + 1);
    setSending(true);
    try {
      const { data } = await submitRepairQuote(form);
      setDone(data.reference);
    } catch {
      toast.error("Could not submit your repair request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="bg-paper">
        <SuccessPanel
          testId="repair-quote-success"
          reference={done}
          title="Repair request logged."
          body="Our certified technicians will assess your request and confirm the repair quote. Use your reference on the Repairs page to track status."
        />
      </div>
    );
  }

  return (
    <div data-testid="repair-quote-page" className="min-h-[70vh] bg-paper">
      <WizardShell
        testId="repair-wizard"
        step={step}
        total={4}
        title="Repair quote wizard"
        subtitle={["Which device needs care?", "What's the issue?", "Device & service details.", "Your contact details."][step - 1]}
        onBack={() => setStep(step - 1)}
        onNext={next}
        nextDisabled={!canNext}
        nextLabel={step === 4 ? (sending ? "Submitting…" : "Get my repair ticket") : "Continue"}
      >
        {step === 1 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" data-testid="rq-step-device">
            {repairDevices.map((d) => (
              <OptionCard key={d} testId={`rq-device-${d.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} title={d} selected={form.device === d} onClick={() => set("device", d)} />
            ))}
          </div>
        )}

        {step === 2 && (
          <div data-testid="rq-step-issue">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ISSUES.map((i) => (
                <OptionCard key={i} testId={`rq-issue-${i.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} title={i} selected={form.issue === i} onClick={() => set("issue", i)} />
              ))}
            </div>
            <textarea
              data-testid="rq-description-input"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe what happened (optional)…"
              rows={3}
              className={`${fieldCls} mt-6 resize-none`}
            />
          </div>
        )}

        {step === 3 && (
          <div data-testid="rq-step-details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input data-testid="rq-model-input" value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="Model (e.g. iPhone 13, MacBook Air M2)" className={fieldCls} />
              <input data-testid="rq-serial-input" value={form.serial} onChange={(e) => set("serial", e.target.value)} placeholder="Serial / IMEI (optional)" className={fieldCls} />
            </div>
            <p className="eyebrow mb-3 mt-8">How would you like service?</p>
            <div className="grid grid-cols-1 gap-3" data-testid="rq-service-modes">
              {MODES.map((m) => (
                <OptionCard key={m.id} testId={`rq-mode-${m.id}`} title={m.t} desc={m.d} selected={form.service_mode === m.id} onClick={() => set("service_mode", m.id)} />
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-testid="rq-step-contact">
            <input data-testid="rq-name-input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name *" className={fieldCls} />
            <input data-testid="rq-email-input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email address *" className={fieldCls} />
            <input data-testid="rq-phone-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone (optional)" className={fieldCls} />
            <div className="rounded-2xl bg-ink p-5 text-paper sm:col-span-2">
              <p className="eyebrow !text-brand">Summary</p>
              <p className="mt-2 text-sm" data-testid="rq-summary">
                {form.device} {form.model ? `(${form.model})` : ""} — {form.issue}
              </p>
              <p className="mt-1 text-xs text-paper/50">
                {MODES.find((m) => m.id === form.service_mode)?.t}. Warranty status will be checked on assessment.
              </p>
            </div>
          </div>
        )}
      </WizardShell>
    </div>
  );
}
