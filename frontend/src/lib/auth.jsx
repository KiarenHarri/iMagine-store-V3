import { createContext, useContext, useEffect, useState, useCallback } from "react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API}/auth/me`, { credentials: "include" });
      if (!res.ok) throw new Error("Not authenticated");
      setUser(await res.json());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    if (window.location.hash?.includes("session_id=")) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    const email = user?.email;
    await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    revokeGoogleGrant(email);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, setUser, loading, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

const GOOGLE_CLIENT_ID = "201274743812-k07hp14e6i6v43od3qhcdcvq8asqacls.apps.googleusercontent.com";

const revokeGoogleGrant = (email) => {
  try {
    const run = () => {
      if (!window.google?.accounts?.id || !email) return;
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID });
      window.google.accounts.id.disableAutoSelect();
      window.google.accounts.id.revoke(email, () => {});
    };
    if (window.google?.accounts?.id) return run();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.onload = run;
    document.head.appendChild(s);
  } catch {}
};

export const startGoogleLogin = () => {
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const redirectUrl = window.location.origin + "/account";
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}&prompt=select_account`;
};
