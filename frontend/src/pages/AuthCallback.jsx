import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    const sessionId = location.hash.split("session_id=")[1]?.split("&")[0];
    const run = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ session_id: sessionId }),
        });
        if (!res.ok) throw new Error("Session exchange failed");
        const user = await res.json();
        setUser(user);
        navigate("/account", { replace: true, state: { user } });
      } catch {
        navigate("/", { replace: true });
      }
    };
    run();
  }, [location, navigate, setUser]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-paper" data-testid="auth-callback-loading">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink/10 border-t-brand" />
    </div>
  );
}
