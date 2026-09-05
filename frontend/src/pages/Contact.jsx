import { useState } from "react";
import { MapPin, Facebook, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import { MaskedLine, Reveal } from "../components/motion";
import { submitContact } from "../lib/api";
import { BRAND } from "../lib/data";

const inputCls =
  "w-full rounded-2xl border border-ink/10 bg-paper px-5 py-3.5 text-sm outline-none transition-colors focus:border-brand";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [done, setDone] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await submitContact(form);
      setDone(data);
    } catch {
      setError("Something went wrong sending your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="contact-page" className="bg-paper">
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <MaskedLine delay={0.1}>
              <span className="eyebrow">Contact</span>
            </MaskedLine>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              <MaskedLine delay={0.2}>Reach out.</MaskedLine>
            </h1>
            <MaskedLine delay={0.35} className="mt-5 max-w-md">
              <span className="text-sm leading-relaxed text-ink/65 sm:text-base">
                Questions about a device, a repair or a fleet rollout? Send a message and the Westville team will get back to you.
              </span>
            </MaskedLine>

            <div className="mt-10 space-y-4" data-testid="contact-info">
              <div className="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-5">
                <MapPin size={18} className="mt-0.5 shrink-0 text-brand" />
                <div>
                  <p className="text-sm font-bold text-ink">Visit the store</p>
                  <p className="mt-1 text-sm text-ink/60">{BRAND.location}</p>
                </div>
              </div>
              <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} data-testid="contact-phone-link" className="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-5 transition-colors duration-200 hover:border-brand">
                <Phone size={18} className="mt-0.5 shrink-0 text-brand" />
                <div>
                  <p className="text-sm font-bold text-ink">Phone</p>
                  <p className="mt-1 text-sm text-ink/60">{BRAND.phone}</p>
                </div>
              </a>
              <a href={`mailto:${BRAND.email}`} data-testid="contact-email-link" className="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-5 transition-colors duration-200 hover:border-brand">
                <Mail size={18} className="mt-0.5 shrink-0 text-brand" />
                <div>
                  <p className="text-sm font-bold text-ink">Email</p>
                  <p className="mt-1 text-sm text-ink/60">{BRAND.email}</p>
                </div>
              </a>
              <div className="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-5" data-testid="contact-hours">
                <Clock size={18} className="mt-0.5 shrink-0 text-brand" />
                <div>
                  <p className="text-sm font-bold text-ink">Trading hours</p>
                  <p className="mt-1 text-sm text-ink/60">{BRAND.hours}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={BRAND.facebook} target="_blank" rel="noopener noreferrer" data-testid="contact-facebook-link" className="flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-xs font-semibold text-ink transition-colors duration-200 hover:border-brand hover:text-brand">
                  <Facebook size={14} /> facebook.com/imaginestoreza
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={0.2}>
              {done ? (
                <div data-testid="contact-success" className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-3xl bg-ink p-10 text-center text-paper grain relative overflow-hidden">
                  <CheckCircle2 size={44} className="text-brand" />
                  <h2 className="mt-5 font-display text-2xl font-bold sm:text-3xl">Message sent.</h2>
                  <p className="mt-3 max-w-sm text-sm text-paper/60">
                    Thanks {done && form.name.split(" ")[0]} — your reference is <span className="font-mono text-brand">{done.reference}</span>. The team will be in touch shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} data-testid="contact-form" className="rounded-3xl border border-black/5 bg-white p-7 lg:p-10">
                  <p className="eyebrow">Send a message</p>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input data-testid="contact-name-input" required value={form.name} onChange={set("name")} placeholder="Full name *" className={inputCls} />
                    <input data-testid="contact-email-input" required type="email" value={form.email} onChange={set("email")} placeholder="Email address *" className={inputCls} />
                    <input data-testid="contact-phone-input" value={form.phone} onChange={set("phone")} placeholder="Phone (optional)" className={inputCls} />
                    <input data-testid="contact-subject-input" value={form.subject} onChange={set("subject")} placeholder="Subject" className={inputCls} />
                  </div>
                  <textarea
                    data-testid="contact-message-input"
                    required
                    value={form.message}
                    onChange={set("message")}
                    placeholder="How can we help? *"
                    rows={5}
                    className={`${inputCls} mt-4 resize-none`}
                  />
                  {error && <p data-testid="contact-error" className="mt-3 text-sm text-red-600">{error}</p>}
                  <button
                    type="submit"
                    data-testid="contact-submit-btn"
                    disabled={loading}
                    className="group mt-6 flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-hover disabled:opacity-50"
                  >
                    {loading ? "Sending…" : "Send message"}
                    <Send size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
