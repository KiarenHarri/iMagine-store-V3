import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, PackageSearch, Wrench, ArrowRight, User as UserIcon } from "lucide-react";
import { useAuth, startGoogleLogin } from "../lib/auth";
import { MaskedLine, Reveal } from "../components/motion";
import { STATUS_FLOWS } from "../lib/data";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Account() {
  const { user, loading, logout } = useAuth();
  const [quotes, setQuotes] = useState(null);

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
    return (
      <div data-testid="account-signin" className="bg-paper">
        <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-8">
          <MaskedLine delay={0.1}>
            <span className="eyebrow">Your account</span>
          </MaskedLine>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            <MaskedLine delay={0.2}>Sign in to</MaskedLine>
            <MaskedLine delay={0.32}>
              <span className="text-brand">iMagine.</span>
            </MaskedLine>
          </h1>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-ink/60">
            Track your quotes and repair tickets in one place. Sign in securely with your Google account.
          </p>
          <button
            onClick={startGoogleLogin}
            data-testid="google-signin-btn"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
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
