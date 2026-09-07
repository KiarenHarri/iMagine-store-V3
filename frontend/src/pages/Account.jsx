import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, PackageSearch, Wrench, ArrowRight, User as UserIcon, Check, Download, X } from "lucide-react";
import { useAuth, startGoogleLogin, passwordAuth, formatApiError } from "../lib/auth";
import PasswordChecklist, { passwordValid } from "../components/PasswordChecklist";
import { MaskedLine, Reveal } from "../components/motion";
import { STATUS_FLOWS } from "../lib/data";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const authInputCls =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-paper placeholder:text-paper/40 outline-none transition-colors focus:border-brand";

function SignInPanel() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = mode === "register" ? form : { email: form.email, password: form.password };
      const data = await passwordAuth(mode, payload);
      setUser(data);
      toast.success(mode === "register" ? "Account created — welcome!" : "Welcome back!");
      navigate(data.is_admin ? "/admin" : "/account", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const [forgotSent, setForgotSent] = useState(false);
  const forgotSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      if (!res.ok) throw new Error("Could not send the reset email. Please try again.");
      setForgotSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="account-signin" className="bg-paper">
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-8 lg:py-24">
        <div className="text-center">
          <MaskedLine delay={0.1}>
            <span className="eyebrow">Your account</span>
          </MaskedLine>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            <MaskedLine delay={0.2}>Sign in to</MaskedLine>
            <MaskedLine delay={0.32}>
              <span className="text-brand">iMagine.</span>
            </MaskedLine>
          </h1>
        </div>

        <div className="mt-10 rounded-3xl bg-ink p-7 text-paper grain relative overflow-hidden sm:p-9" data-testid="signin-card">
          {mode === "forgot" ? (
            <form onSubmit={forgotSubmit} className="mt-6 space-y-3" data-testid="forgot-form">
              <p className="text-sm text-paper/60">Enter your account email and we'll send you a reset link (valid 1 hour).</p>
              {forgotSent ? (
                <div className="rounded-2xl border border-brand/30 bg-brand/10 p-5 text-center" data-testid="forgot-success">
                  <p className="font-display text-base font-bold text-paper">Check your inbox.</p>
                  <p className="mt-1 text-sm text-paper/60">If that email is registered, a reset link is on its way.</p>
                </div>
              ) : (
                <>
                  <input
                    data-testid="forgot-email-input"
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Email address"
                    className={authInputCls}
                  />
                  {error && <p data-testid="forgot-error" className="text-sm text-red-400">{error}</p>}
                  <button
                    type="submit"
                    data-testid="forgot-submit-btn"
                    disabled={busy}
                    className="w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-hover disabled:opacity-50"
                  >
                    {busy ? "Sending…" : "Email me a reset link"}
                  </button>
                </>
              )}
              <button type="button" data-testid="forgot-back-btn" onClick={() => { setMode("login"); setForgotSent(false); setError(""); }} className="w-full pt-1 text-center text-xs font-semibold text-paper/50 transition-colors hover:text-brand">
                ← Back to sign in
              </button>
            </form>
          ) : (
            <>
          <div className="flex rounded-full border border-white/10 p-1" data-testid="signin-tabs">
            {[
              { id: "login", label: "Sign in" },
              { id: "register", label: "Create account" },
            ].map((t) => (
              <button
                key={t.id}
                data-testid={`signin-tab-${t.id}`}
                onClick={() => { setMode(t.id); setError(""); }}
                className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors duration-200 ${
                  mode === t.id ? "bg-brand text-white" : "text-paper/60 hover:text-paper"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-3" data-testid="password-auth-form">
            {mode === "register" && (
              <input
                data-testid="signin-name-input"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
                className={authInputCls}
              />
            )}
            <input
              data-testid="signin-email-input"
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email address"
              className={authInputCls}
            />
            <input
              data-testid="signin-password-input"
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={mode === "register" ? "Password (8+ chars, capital, number, symbol)" : "Password"}
              className={authInputCls}
            />
            {mode === "register" && <PasswordChecklist password={form.password} />}
            {mode === "login" && (
              <button type="button" data-testid="forgot-link" onClick={() => { setMode("forgot"); setError(""); }} className="text-xs font-semibold text-paper/50 transition-colors hover:text-brand">
                Forgot password?
              </button>
            )}
            {error && <p data-testid="signin-error" className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              data-testid="signin-submit-btn"
              disabled={busy || (mode === "register" && !passwordValid(form.password))}
              className="w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-hover disabled:opacity-50"
            >
              {busy ? "One moment…" : mode === "register" ? "Create my account" : "Sign in"}
            </button>
          </form>
            </>
          )}

          {mode !== "forgot" && (
            <>
          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-white/10" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-paper/40">or</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            onClick={startGoogleLogin}
            data-testid="google-signin-btn"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-white/15 py-3.5 text-sm font-semibold transition-colors duration-300 hover:border-brand hover:text-brand"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"/></svg>
            Continue with Google
          </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Account() {
  const { user, loading, logout } = useAuth();
  const [quotes, setQuotes] = useState(null);
  const [busy, setBusy] = useState("");

  const acceptQuote = async (ref) => {
    setBusy(ref);
    try {
      const res = await fetch(`${API}/quotes/${ref}/accept`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error();
      const { status } = await res.json();
      setQuotes((qs) => qs.map((q) => (q.reference === ref ? { ...q, status } : q)));
      toast.success("Quote accepted — the team has been notified.");
    } catch {
      toast.error("Could not accept this quote");
    } finally {
      setBusy("");
    }
  };

  const downloadPdf = async (ref) => {
    try {
      const res = await fetch(`${API}/quotes/${ref}/pdf`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${ref}-quote.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not download the PDF");
    }
  };

  const declineQuote = async (ref) => {
    setBusy(ref);
    try {
      const res = await fetch(`${API}/quotes/${ref}/decline`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error();
      setQuotes((qs) => qs.map((q) => (q.reference === ref ? { ...q, status: "Cancelled" } : q)));
      toast.success("Quote declined — the team has been notified to follow up.");
    } catch {
      toast.error("Could not decline this quote");
    } finally {
      setBusy("");
    }
  };

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const res = await fetch(`${API}/quotes/mine`, { credentials: "include" });
        if (!res.ok) throw new Error();
        setQuotes(await res.json());
      } catch {
        setQuotes([]);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-paper" data-testid="account-loading">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink/10 border-t-brand" />
      </div>
    );
  }

  if (!user) {
    return <SignInPanel />;
  }

  return (
    <div data-testid="account-page" className="bg-paper">
      <section className="relative overflow-hidden bg-ink py-14 text-paper grain lg:py-20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/15 blur-3xl" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div className="flex items-center gap-5">
            {user.picture ? (
              <img src={user.picture} alt={user.name} data-testid="account-avatar" className="h-16 w-16 rounded-full border-2 border-brand object-cover" />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand bg-white/10"><UserIcon size={24} /></span>
            )}
            <div>
              <p className="eyebrow !text-brand">Signed in</p>
              <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl" data-testid="account-name">{user.name}</h1>
              <p className="mt-0.5 text-sm text-paper/60" data-testid="account-email">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            data-testid="account-logout-btn"
            className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold transition-colors duration-300 hover:border-brand hover:text-brand"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8 lg:px-12 lg:py-16">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">History</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Your quotes &amp; repairs</h2>
            </div>
            <Link to="/quote/product" data-testid="account-new-quote-cta" className="group hidden items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover sm:flex">
              New quote <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        {quotes === null ? (
          <div className="mt-10 flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/10 border-t-brand" /></div>
        ) : quotes.length === 0 ? (
          <Reveal className="mt-8">
            <div data-testid="account-empty" className="rounded-3xl border border-dashed border-ink/15 bg-white p-10 text-center">
              <PackageSearch size={32} className="mx-auto text-mute" />
              <p className="mt-4 font-display text-lg font-bold text-ink">Nothing here yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink/60">Start a product quote or repair request while signed in and it will show up here.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/quote/product" data-testid="account-empty-product-cta" className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover">Product quote</Link>
                <Link to="/quote/repair" data-testid="account-empty-repair-cta" className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand">Repair quote</Link>
              </div>
            </div>
          </Reveal>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4" data-testid="account-quotes-list">
            {quotes.map((q) => (
              <div key={q.reference} data-testid={`account-quote-${q.reference}`} className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${q.type === "repair" ? "bg-brand-subtle text-brand" : "bg-ink text-white"}`}>
                    {q.type === "repair" ? <Wrench size={17} /> : <PackageSearch size={17} />}
                  </span>
                  <div>
                    <p className="font-mono text-xs tracking-[0.2em] text-brand">{q.reference}</p>
                    <p className="mt-1 font-display text-base font-bold text-ink">
                      {q.type === "repair" ? `${q.device} — ${q.issue}` : q.model || q.category}
                    </p>
                    <p className="mt-0.5 text-xs text-mute">{new Date(q.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</p>
                    {(() => {
                      const flow = STATUS_FLOWS[q.type] || [];
                      const cancelled = q.status === "Cancelled";
                      const idx = flow.indexOf(q.status);
                      return (
                        <div className="mt-3 flex items-center gap-1" data-testid={`status-tracker-${q.reference}`}>
                          {flow.map((s, i) => (
                            <span
                              key={s}
                              title={s}
                              className={`h-1.5 w-8 rounded-full transition-colors duration-500 ${
                                cancelled ? "bg-red-300" : i <= idx ? "bg-brand" : "bg-ink/10"
                              }`}
                            />
                          ))}
                          <span className={`ml-2 text-xs font-semibold ${cancelled ? "text-red-500" : "text-ink/70"}`}>{q.status}</span>
                        </div>
                      );
                    })()}
                    {q.quote_price && (
                      <div className="mt-3 w-fit rounded-xl bg-brand-subtle px-4 py-3" data-testid={`quote-price-${q.reference}`}>
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand">Quoted price</p>
                        <p className="mt-0.5 font-display text-lg font-extrabold text-ink">{q.quote_price}</p>
                        {q.quote_note && <p className="mt-1 max-w-xs text-xs leading-relaxed text-ink/60">{q.quote_note}</p>}
                      </div>
                    )}
                    {q.quote_price && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        {q.status === "Quote sent" && (
                          <>
                            <button
                              data-testid={`accept-quote-${q.reference}`}
                              onClick={() => acceptQuote(q.reference)}
                              disabled={busy === q.reference}
                              className="flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors duration-300 hover:bg-brand-hover disabled:opacity-50"
                            >
                              <Check size={13} /> {busy === q.reference ? "Accepting…" : "Accept quote"}
                            </button>
                            <button
                              data-testid={`decline-quote-${q.reference}`}
                              onClick={() => declineQuote(q.reference)}
                              disabled={busy === q.reference}
                              className="flex items-center gap-1.5 rounded-full border border-red-200 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-red-500 transition-colors duration-300 hover:border-red-400 hover:bg-red-50 disabled:opacity-50"
                            >
                              <X size={13} /> Decline
                            </button>
                          </>
                        )}
                        <button
                          data-testid={`download-pdf-${q.reference}`}
                          onClick={() => downloadPdf(q.reference)}
                          className="flex items-center gap-1.5 rounded-full border border-ink/15 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-ink transition-colors duration-300 hover:border-brand hover:text-brand"
                        >
                          <Download size={13} /> PDF
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
