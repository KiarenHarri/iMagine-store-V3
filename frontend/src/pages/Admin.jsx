import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldAlert, RefreshCw, Wrench, PackageSearch, Mail } from "lucide-react";
import { useAuth, startGoogleLogin } from "../lib/auth";
import { MaskedLine, Reveal } from "../components/motion";
import { STATUS_FLOWS, CANCEL_STATUS } from "../lib/data";
import { StatsStrip, SalesPanel } from "../components/AdminExtras";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TABS = [
  { id: "all", label: "All" },
  { id: "product", label: "Product quotes" },
  { id: "repair", label: "Repairs" },
  { id: "contact", label: "Messages" },
  { id: "sales", label: "Sales" },
];

export default function Admin() {
  const { user, loading } = useAuth();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("all");
  const [saving, setSaving] = useState("");
  const [quoteForm, setQuoteForm] = useState(null);

  const load = async () => {
    try {
      const res = await fetch(`${API}/admin/submissions`, { credentials: "include" });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      toast.error("Could not load submissions");
    }
  };

  useEffect(() => {
    if (user?.is_admin) load();
  }, [user]);

  const updateStatus = async (reference, status, extras = {}) => {
    setSaving(reference);
    try {
      const res = await fetch(`${API}/admin/quotes/${reference}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, ...extras }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setData((d) => ({ ...d, quotes: d.quotes.map((q) => (q.reference === reference ? updated : q)) }));
      setQuoteForm(null);
      toast.success(`${reference} → ${status}. Customer emailed.`);
    } catch {
      toast.error("Status update failed");
    } finally {
      setSaving("");
    }
  };

  const pickStatus = (q, status) => {
    if (status === "Quote sent") {
      setQuoteForm({ reference: q.reference, price: q.quote_price || "", note: q.quote_note || "" });
    } else {
      updateStatus(q.reference, status);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-paper" data-testid="admin-loading">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink/10 border-t-brand" />
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return (
      <div data-testid="admin-denied" className="bg-paper">
        <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-8">
          <ShieldAlert size={40} className="mx-auto text-brand" />
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Team access only.</h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-ink/60">
            {user
              ? "This Google account is not on the team allowlist. Ask the site owner to add your email."
              : "Sign in with an authorised team Google account to manage quotes and repairs."}
          </p>
          {!user && (
            <button onClick={startGoogleLogin} data-testid="admin-signin-btn" className="mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand">
              Continue with Google
            </button>
          )}
        </div>
      </div>
    );
  }

  const quotes = (data?.quotes || []).filter((q) => tab === "all" || q.type === tab);
  const messages = tab === "all" || tab === "contact" ? data?.messages || [] : [];

  return (
    <div data-testid="admin-page" className="bg-paper">
      <section className="relative overflow-hidden bg-ink py-14 text-paper grain lg:py-18">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/15 blur-3xl" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div>
            <MaskedLine delay={0.1}>
              <span className="eyebrow !text-brand">Team console</span>
            </MaskedLine>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Submissions &amp; statuses</h1>
            <p className="mt-2 text-sm text-paper/60">Flip a status and the customer is emailed automatically.</p>
          </div>
          <button onClick={load} data-testid="admin-refresh-btn" className="flex w-fit items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold transition-colors duration-300 hover:border-brand hover:text-brand">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8 lg:px-12 lg:py-14">
        <StatsStrip />
        <div className="mt-8 flex flex-wrap gap-2" data-testid="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-testid={`admin-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                tab === t.id ? "bg-brand text-white" : "border border-ink/10 bg-white text-ink/70 hover:border-brand hover:text-brand"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "sales" ? (
          <div className="mt-8"><SalesPanel /></div>
        ) : data === null ? (
          <div className="mt-10 flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/10 border-t-brand" /></div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4" data-testid="admin-quotes-list">
              {quotes.map((q) => (
                <Reveal key={q.reference}>
                  <div data-testid={`admin-quote-${q.reference}`} className="rounded-2xl border border-black/5 bg-white p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${q.type === "repair" ? "bg-brand-subtle text-brand" : "bg-ink text-white"}`}>
                          {q.type === "repair" ? <Wrench size={17} /> : <PackageSearch size={17} />}
                        </span>
                        <div>
                          <p className="font-mono text-xs tracking-[0.2em] text-brand">{q.reference}</p>
                          <p className="mt-1 font-display text-base font-bold text-ink">
                            {q.type === "repair" ? `${q.device} — ${q.issue}` : `${q.model || q.category}${q.storage ? ` · ${q.storage}` : ""}`}
                          </p>
                          <p className="mt-0.5 text-xs text-mute">
                            {q.name} · {q.email}{q.phone ? ` · ${q.phone}` : ""} · {new Date(q.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          data-testid={`admin-status-select-${q.reference}`}
                          value={q.status}
                          disabled={saving === q.reference}
                          onChange={(e) => pickStatus(q, e.target.value)}
                          className="rounded-full border border-ink/10 bg-paper px-4 py-2.5 text-sm font-semibold text-ink outline-none transition-colors focus:border-brand disabled:opacity-50"
                        >
                          {[...(STATUS_FLOWS[q.type] || []), CANCEL_STATUS].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {quoteForm?.reference === q.reference && (
                      <div data-testid={`quote-editor-${q.reference}`} className="mt-5 rounded-2xl border border-brand/30 bg-brand-subtle p-5">
                        <p className="eyebrow !text-brand">Attach the quote</p>
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <input
                            data-testid={`quote-price-input-${q.reference}`}
                            value={quoteForm.price}
                            onChange={(e) => setQuoteForm({ ...quoteForm, price: e.target.value })}
                            placeholder="Price, e.g. R 24 999"
                            className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-brand"
                          />
                          <input
                            data-testid={`quote-note-input-${q.reference}`}
                            value={quoteForm.note}
                            onChange={(e) => setQuoteForm({ ...quoteForm, note: e.target.value })}
                            placeholder="Note, e.g. includes MagSafe case, valid 7 days"
                            className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-brand"
                          />
                        </div>
                        <div className="mt-4 flex gap-3">
                          <button
                            data-testid={`quote-send-btn-${q.reference}`}
                            disabled={saving === q.reference || !quoteForm.price.trim()}
                            onClick={() => updateStatus(q.reference, "Quote sent", { price: quoteForm.price, note: quoteForm.note })}
                            className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-hover disabled:opacity-40"
                          >
                            {saving === q.reference ? "Sending…" : "Send quote to customer"}
                          </button>
                          <button
                            data-testid={`quote-cancel-btn-${q.reference}`}
                            onClick={() => setQuoteForm(null)}
                            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
              {quotes.length === 0 && tab !== "contact" && (
                <p data-testid="admin-empty" className="py-10 text-center text-sm text-mute">No submissions in this view yet.</p>
              )}
            </div>

            {messages.length > 0 && (
              <div className="mt-10" data-testid="admin-messages-list">
                <p className="eyebrow mb-4">Contact messages</p>
                <div className="grid grid-cols-1 gap-4">
                  {messages.map((m) => (
                    <div key={m.reference} data-testid={`admin-message-${m.reference}`} className="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-6">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper text-ink"><Mail size={17} /></span>
                      <div>
                        <p className="font-mono text-xs tracking-[0.2em] text-brand">{m.reference}</p>
                        <p className="mt-1 font-display text-base font-bold text-ink">{m.subject || "General enquiry"}</p>
                        <p className="mt-1 text-sm text-ink/70">{m.message}</p>
                        <p className="mt-1.5 text-xs text-mute">{m.name} · {m.email}{m.phone ? ` · ${m.phone}` : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
