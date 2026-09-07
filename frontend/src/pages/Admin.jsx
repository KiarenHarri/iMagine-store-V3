import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldAlert, RefreshCw, Wrench, PackageSearch, Mail, Trash2, TrendingUp, Tag, ImagePlus, Percent, Inbox, UserPlus, ShieldCheck } from "lucide-react";
import { useAuth, startGoogleLogin } from "../lib/client";
import { MaskedLine, PasswordChecklist, passwordValid, Reveal } from "../components/Shared";
import { STATUS_FLOWS, CANCEL_STATUS } from "../lib/data";

// ---- Admin page ----
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TABS = [
  { id: "all", label: "All" },
  { id: "product", label: "Product quotes" },
  { id: "sale", label: "Sale quotes" },
  { id: "repair", label: "Repairs" },
  { id: "contact", label: "Messages" },
  { id: "sales", label: "Sales" },
  { id: "team", label: "Team" },
];

export default function Admin() {
  const { user, loading } = useAuth();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("all");
  const [saving, setSaving] = useState("");
  const [quoteForm, setQuoteForm] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState("");

  const deleteQuote = async (reference) => {
    setSaving(reference);
    try {
      const res = await fetch(`${API}/admin/quotes/${reference}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      setData((d) => ({ ...d, quotes: d.quotes.filter((q) => q.reference !== reference) }));
      toast.success(`${reference} deleted`);
    } catch {
      toast.error("Delete failed");
    } finally {
      setSaving("");
      setConfirmDelete("");
    }
  };

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

  const quotes = (data?.quotes || []).filter((q) => {
    if (tab === "all") return true;
    if (tab === "sale") return q.type === "product" && q.is_sale;
    if (tab === "product") return q.type === "product" && !q.is_sale;
    return q.type === tab;
  });
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

        {tab === "team" ? (
          <div className="mt-8"><TeamPanel /></div>
        ) : tab === "sales" ? (
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
                          <p className="mt-1 flex flex-wrap items-center gap-2 font-display text-base font-bold text-ink">
                            {q.type === "repair" ? `${q.device} — ${q.issue}` : `${q.model || q.category}${q.color ? ` · ${q.color}` : ""}${q.storage ? ` · ${q.storage}` : ""}`}
                            {q.condition === "pre-owned" && (
                              <span data-testid={`admin-preowned-tag-${q.reference}`} className="rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white">
                                Pre-owned
                              </span>
                            )}
                            {q.is_sale && (
                              <span data-testid={`admin-sale-tag-${q.reference}`} className="rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white">
                                Sale
                              </span>
                            )}
                          </p>
                          {q.is_sale && q.sale_price && (
                            <p className="mt-0.5 text-xs font-semibold text-brand" data-testid={`admin-sale-price-${q.reference}`}>
                              Sale price {q.sale_price}{q.sale_was_price ? ` · was ${q.sale_was_price}` : ""}
                            </p>
                          )}
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
                        {confirmDelete === q.reference ? (
                          <button
                            type="button"
                            data-testid={`admin-delete-confirm-${q.reference}`}
                            disabled={saving === q.reference}
                            onClick={() => deleteQuote(q.reference)}
                            className="rounded-full bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition-colors duration-200 hover:bg-red-700 disabled:opacity-50"
                          >
                            {saving === q.reference ? "Deleting…" : "Confirm delete"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            data-testid={`admin-delete-btn-${q.reference}`}
                            aria-label={`Delete ${q.reference}`}
                            onClick={() => {
                              setConfirmDelete(q.reference);
                              setTimeout(() => setConfirmDelete((c) => (c === q.reference ? "" : c)), 4000);
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/40 transition-colors duration-200 hover:border-red-300 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
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

// ---- Admin panels (stats, sales, team) ----

export function TeamPanel() {
  const [admins, setAdmins] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState("");

  const load = async () => {
    try {
      const res = await fetch(`${API}/admin/admins`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch {
      toast.error("Could not load team admins");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${API}/admin/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Could not add admin");
      toast.success(password ? `${email.trim()} can now sign in with email + password` : `${email.trim()} can now open the team console`);
      setEmail("");
      setPassword("");
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (target) => {
    setBusy(true);
    try {
      const res = await fetch(`${API}/admin/admins/${encodeURIComponent(target)}`, { method: "DELETE", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Could not remove admin");
      toast.success(`${target} removed from the team`);
      setConfirmRemove("");
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const slug = (e) => e.replace(/[^a-z0-9]+/gi, "-");

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 lg:p-8" data-testid="team-panel">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand"><ShieldCheck size={18} /></span>
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Team admins</h2>
          <p className="text-xs text-mute">These accounts can open the team console. They sign in with Google, or with an email + password you set below.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            data-testid="team-email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@example.com"
            className="w-full flex-1 rounded-2xl border border-ink/10 bg-paper px-5 py-3.5 text-sm outline-none transition-colors focus:border-brand"
          />
          <input
            type="password"
            data-testid="team-password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (optional, min 8 chars)"
            className="w-full flex-1 rounded-2xl border border-ink/10 bg-paper px-5 py-3.5 text-sm outline-none transition-colors focus:border-brand"
          />
          <button
            type="button"
            data-testid="team-add-btn"
            disabled={busy || !/\S+@\S+\.\S+/.test(email) || (password.length > 0 && !passwordValid(password))}
            onClick={add}
            className="flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <UserPlus size={15} /> {busy ? "Adding…" : "Add admin"}
          </button>
        </div>
        <PasswordChecklist password={password} />
        <p className="text-xs text-mute">Leave the password blank for Google sign-in, or set one so they can log in with email + password instead.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3" data-testid="team-admin-list">
        {(admins || []).map((a) => (
          <div key={a.email} data-testid={`team-admin-row-${slug(a.email)}`} className="flex items-center justify-between gap-4 rounded-2xl border border-black/5 bg-paper px-5 py-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{a.email}</p>
              <p className="mt-0.5 text-xs text-mute">
                {a.builtin ? "Built-in admin" : `Added by ${a.added_by || "team"}${a.created_at ? ` · ${new Date(a.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}` : ""}`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {a.builtin && (
                <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white">Built-in</span>
              )}
              {confirmRemove === a.email ? (
                <button
                  type="button"
                  data-testid={`team-remove-confirm-${slug(a.email)}`}
                  disabled={busy}
                  onClick={() => remove(a.email)}
                  className="shrink-0 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white transition-colors duration-200 hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm remove
                </button>
              ) : (
                <button
                  type="button"
                  data-testid={`team-remove-${slug(a.email)}`}
                  aria-label={`Remove ${a.email}`}
                  onClick={() => {
                    setConfirmRemove(a.email);
                    setTimeout(() => setConfirmRemove((c) => (c === a.email ? "" : c)), 4000);
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/40 transition-colors duration-200 hover:border-red-300 hover:text-red-600"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
        {admins === null && <p className="py-6 text-center text-sm text-mute">Loading…</p>}
      </div>
    </div>
  );
}

export function StatsStrip() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API}/admin/stats`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const cards = [
    { icon: Inbox, label: "New this week", value: stats?.new_this_week, testId: "stat-new-week" },
    { icon: Wrench, label: "Pending repairs", value: stats?.pending_repairs, testId: "stat-pending-repairs" },
    { icon: Percent, label: "Acceptance rate", value: stats ? `${stats.acceptance_rate}%` : null, testId: "stat-acceptance" },
    { icon: Tag, label: "Active sales", value: stats?.active_sales, testId: "stat-sales" },
  ];

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4" data-testid="admin-stats-strip">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border border-black/5 bg-white p-5">
          <c.icon size={17} className="text-brand" />
          <p className="mt-3 font-display text-3xl font-extrabold text-ink" data-testid={c.testId}>
            {c.value ?? "—"}
          </p>
          <p className="mt-1 text-xs font-medium text-mute">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

export function SalesPanel() {
  const salePhase = (s) => {
    const now = new Date().toISOString();
    if (s.ends_at && s.ends_at < now) return { t: "Ended", cls: "bg-red-50 text-red-500 border-red-200" };
    if (s.starts_at && s.starts_at > now) return { t: "Scheduled", cls: "bg-brand-subtle text-brand border-brand/30" };
    return { t: "Live now", cls: "bg-green-50 text-green-600 border-green-200" };
  };

  const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

  const [sales, setSales] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", was_price: "", description: "", image: "", starts_at: "", ends_at: "" });
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    fetch(`${API}/admin/sales/all`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setSales)
      .catch(() => setSales([]));

  useEffect(() => {
    load();
  }, []);

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const imgEl = new Image();
      imgEl.onload = () => {
        const size = 500;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        const side = Math.min(imgEl.width, imgEl.height);
        const sx = (imgEl.width - side) / 2;
        const sy = (imgEl.height - side) / 2;
        ctx.drawImage(imgEl, sx, sy, side, side, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
        setForm((f) => ({ ...f, image: dataUrl }));
        setPreview(dataUrl);
      };
      imgEl.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const createSale = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : "",
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : "",
      };
      const res = await fetch(`${API}/admin/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(typeof d.detail === "string" ? d.detail : "Could not create the sale");
      }
      toast.success("Sale is live on the store");
      setForm({ name: "", price: "", was_price: "", description: "", image: "" });
      setPreview("");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const removeSale = async (id) => {
    try {
      const res = await fetch(`${API}/admin/sales/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      toast.success("Sale removed");
      setSales((s) => s.filter((x) => x.id !== id));
    } catch {
      toast.error("Could not remove the sale");
    }
  };

  const inputCls = "w-full rounded-2xl border border-ink/10 bg-paper px-5 py-3 text-sm outline-none transition-colors focus:border-brand";

  return (
    <div data-testid="sales-panel">
      <form onSubmit={createSale} className="rounded-3xl border border-black/5 bg-white p-7" data-testid="sale-form">
        <p className="eyebrow flex items-center gap-2"><Tag size={13} className="text-brand" /> Create a sale</p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input data-testid="sale-name-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Item name, e.g. iPhone 15 Pro 256GB" className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <input data-testid="sale-price-input" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Now: R 17 999" className={inputCls} />
            <input data-testid="sale-was-input" value={form.was_price} onChange={(e) => setForm({ ...form, was_price: e.target.value })} placeholder="Was: R 21 999" className={inputCls} />
          </div>
          <input data-testid="sale-desc-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description (optional)" className={`${inputCls} sm:col-span-2`} />
          <div className="grid grid-cols-2 gap-3 sm:col-span-2">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-mute">Starts (optional)</span>
              <input data-testid="sale-starts-input" type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-mute">Ends (optional)</span>
              <input data-testid="sale-ends-input" type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} className={inputCls} />
            </label>
          </div>
          <label data-testid="sale-image-label" className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-ink/20 bg-paper px-5 py-3 text-sm text-ink/60 transition-colors hover:border-brand sm:col-span-2">
            <ImagePlus size={17} className="text-brand" />
            {preview ? "Photo attached (auto-cropped to 500×500) — click to change" : "Add a photo of the item — auto-cropped to 500×500"}
            <input data-testid="sale-image-input" type="file" accept="image/*" onChange={pickImage} className="hidden" />
            {preview && <img src={preview} alt="Sale preview" className="ml-auto h-10 w-10 rounded-lg object-cover" />}
          </label>
        </div>
        <button type="submit" data-testid="sale-submit-btn" disabled={busy} className="mt-5 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-hover disabled:opacity-50">
          {busy ? "Publishing…" : "Publish sale"}
        </button>
      </form>

      <div className="mt-8 grid grid-cols-1 gap-4" data-testid="sales-list">
        {(sales || []).map((s) => (
          <div key={s.id} data-testid={`sale-row-${s.id}`} className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4">
            {s.image ? (
              <img src={s.image} alt={s.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-paper"><Tag size={18} className="text-mute" /></span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-bold text-ink">{s.name}</p>
              <p className="mt-0.5 text-sm">
                <span className="font-bold text-brand">{s.price}</span>
                {s.was_price && <span className="ml-2 text-mute line-through">{s.was_price}</span>}
              </p>
              {(s.starts_at || s.ends_at) && (
                <p className="mt-1 text-xs text-mute">
                  {s.starts_at ? `From ${fmtDate(s.starts_at)}` : "Starts immediately"}
                  {s.ends_at ? ` · until ${fmtDate(s.ends_at)}` : ""}
                </p>
              )}
            </div>
            <span data-testid={`sale-phase-${s.id}`} className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${salePhase(s).cls}`}>
              {salePhase(s).t}
            </span>
            <button data-testid={`sale-delete-${s.id}`} onClick={() => removeSale(s.id)} className="rounded-full border border-red-200 p-2.5 text-red-500 transition-colors hover:border-red-400 hover:bg-red-50" aria-label="Remove sale">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {sales && sales.length === 0 && (
          <p data-testid="sales-empty" className="py-8 text-center text-sm text-mute">No sales live right now — create the first one above.</p>
        )}
      </div>
    </div>
  );
}
