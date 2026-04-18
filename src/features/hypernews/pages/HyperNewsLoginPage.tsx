import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useHyperNewsAuth } from "../auth";

type Mode = "signin" | "register";

function useModeFromLocation(search: string): Mode {
  const params = new URLSearchParams(search);
  return params.get("mode") === "register" ? "register" : "signin";
}

export function HyperNewsLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useHyperNewsAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const mode: Mode = useModeFromLocation(location.search);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/hypernews", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  function switchMode(nextMode: Mode) {
    setError("");
    navigate(nextMode === "register" ? "/hypernews/login?mode=register" : "/hypernews/login", { replace: true });
  }

  const heading = useMemo(
    () => (mode === "signin" ? "Sign in to HyperNews" : "Create your HyperNews account"),
    [mode],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "register") {
        await register(email, password, displayName);
      }

      await login(email, password);
      navigate("/hypernews", { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="hn-login-wrap">
      <div className="hn-glass-card" style={{ width: "min(480px, 100%)", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
          <div>
            <div className="hn-muted-caption" style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>HyperNews</div>
            <h1 className="hn-login-title">{heading}</h1>
            <p className="hn-inline-note" style={{ marginTop: 10 }}>
              Personalized news with session memory, search reranking, and profile intelligence.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          <button type="button" className={`hn-mood-pill${mode === "signin" ? " active" : ""}`} onClick={() => switchMode("signin")}>Sign In</button>
          <button type="button" className={`hn-mood-pill${mode === "register" ? " active" : ""}`} onClick={() => switchMode("register")}>Register</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          {mode === "register" && (
            <label style={{ display: "grid", gap: 6 }}>
              <span className="hn-muted-caption">Display Name</span>
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="What should we call you?" style={inputStyle} />
            </label>
          )}

          <label style={{ display: "grid", gap: 6 }}>
            <span className="hn-muted-caption">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              style={inputStyle}
              required
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span className="hn-muted-caption">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              style={inputStyle}
              required
            />
          </label>

          {error && <div className="hn-error-box">{error}</div>}

          <button type="submit" disabled={submitting} className="hn-search-btn" style={{ marginTop: 4 }}>
            {submitting ? "Working..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function HyperNewsRegisterPage() {
  return <HyperNewsLoginPage />;
}

const inputStyle: CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid var(--hn-glass-border)",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 14,
  color: "var(--hn-text-primary)",
  outline: "none",
};
