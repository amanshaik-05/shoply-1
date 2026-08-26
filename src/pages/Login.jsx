import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { signIn } from "../lib/authClient";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: signInError } = await signIn.email({ email, password });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message || "Couldn't sign in.");
      return;
    }
    navigate(redirect, { replace: true });
  };

  return (
    <div className="page">
      <div className="auth-card">
        <h1>Sign in</h1>
        <form className="checkout-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary full-width" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to={`/signup?redirect=${encodeURIComponent(redirect)}`}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
