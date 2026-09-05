import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, KeyRound } from "lucide-react";
import { MaskedLine } from "../components/motion";
import { formatApiError } from "../lib/auth";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(formatApiError(data.detail));
      setDone(true);
      toast.success("Password updated");
      setTimeout(() => navigate("/account"), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="reset-password-page" className="bg-paper">
      <div className="mx-auto max-w-md px-4 py-20 sm:px-8 lg:py-28">
        <div className="text-center">
          <MaskedLine delay={0.1}>
            <span className="eyebrow flex items-center justify-center gap-2"><KeyRound size={13} className="text-brand" /> Password reset</span>
          </MaskedLine>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            <MaskedLine delay={0.2}>Choose a new password.</MaskedLine>
          </h1>
        </div>

        <div className="mt-10 rounded-3xl bg-ink p-8 text-paper grain relative overflow-hidden">
          {done ? (
            <div className="py-6 text-center" data-testid="reset-success">
              <CheckCircle2 size={40} className="mx-auto text-brand" />
              <p className="mt-4 font-display text-xl font-bold">Password updated.</p>
              <p className="mt-2 text-sm text-paper/60">Taking you to sign in…</p>
            </div>
          ) : !token ? (
            <p className="py-6 text-center text-sm text-paper/60" data-testid="reset-no-token">
              This link is missing its token. Request a fresh reset link from the sign-in page.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-3" data-testid="reset-form">
              <input
                data-testid="reset-password-input"
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password (8+ characters)"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-paper placeholder:text-paper/40 outline-none transition-colors focus:border-brand"
              />
              <input
                data-testid="reset-confirm-input"
                required
                type="password"
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-paper placeholder:text-paper/40 outline-none transition-colors focus:border-brand"
              />
              {error && <p data-testid="reset-error" className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                data-testid="reset-submit-btn"
                disabled={busy}
                className="w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-hover disabled:opacity-50"
              >
                {busy ? "Updating…" : "Set new password"}
              </button>
            </form>
          )}
        </div>
        <p className="mt-6 text-center">
          <Link to="/account" data-testid="reset-back-link" className="text-sm font-semibold text-brand hover:text-brand-hover">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
