
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Login failed. Please try again."
        );
      }

      // Store a token only if your Flask API returns one.
      if (data.access_token) {
        localStorage.setItem("scamlens_token", data.access_token);
      } else if (data.token) {
        localStorage.setItem("scamlens_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("scamlens_user", JSON.stringify(data.user));
      }

      setSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        navigate("/");
      }, 700);
    } catch (err) {
      setError(
        err.message ||
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <header className="auth-topbar">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon">
            <ShieldCheck size={23} />
          </span>
          <span>
            ScamLens<span className="auth-accent"> AI</span>
          </span>
        </Link>

        <a href="/" className="auth-back-link">
          Back to Home
        </a>
      
      </header>

      <main className="auth-main">
        <section className="auth-card">
          <div className="auth-icon">
            <ShieldCheck size={30} />
          </div>

          <p className="auth-eyebrow">WELCOME BACK</p>
          <h1>Sign in to ScamLens AI</h1>
          <p className="auth-subtitle">
            Sign in to continue your security journey.
          </p>

          {error && (
            <div className="auth-message auth-error" role="alert">
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-message auth-success" role="status">
              {success}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>

              <div className="auth-input-wrap">
                <Mail size={18} />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password">Password</label>
              </div>

              <div className="auth-input-wrap">
                <LockKeyhole size={18} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="auth-eye-button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>

          <div className="auth-security-note">
            <LockKeyhole size={15} />
            <span>Your security matters. Never share your password or OTP.</span>
          </div>
        </section>
      </main>

      <footer className="auth-footer">
        ScamLens AI · Pause. Verify. Protect.
      </footer>
    </div>
  );
}
