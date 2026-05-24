import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthService } from "../utils/authService";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import "../styles/LoginPage.css";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await AuthService.login(email, password);
      navigate(from, { replace: true });
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background glows */}
      <div className="login-glow-primary" />
      <div className="login-glow-secondary" />

      <div className="login-card">
        {/* Logo / Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">▶</div>
          <h1 className="login-brand-name">SecurePlayer</h1>
        </div>

        <p className="login-tagline">Sign in to access your courses</p>

        {/* Demo hint */}
        <div className="login-demo-hint">
          <span className="demo-label">Demo</span>
          <span className="demo-creds">test@example.com · password123</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="login-field">
            <label className="login-label">Email</label>
            <div className="login-input-wrapper">
              <Mail size={16} className="login-input-icon" />
              <input
                type="email"
                className="login-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-input-wrapper">
              <Lock size={16} className="login-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <p className="login-error">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading || !email || !password}
          >
            {loading ? (
              <span className="login-spinner" />
            ) : (
              <>
                <LogIn size={16} /> Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
