import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";

/* ─── Brand tokens (mirrored from LandingPage) ─── */
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:      #1b3a6b;
    --navy-dark: #122850;
    --blue:      #2563eb;
    --green:     #16a34a;
    --text:      #1e293b;
    --muted:     #64748b;
    --border:    #e2e8f0;
    --bg:        #f8fafc;
    --white:     #ffffff;
    --error:     #ef4444;
  }

  body {
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
    background: var(--bg);
  }

  /* ── Layout ── */
  .login-root {
    min-height: 100vh;
    display: flex;
  }

  /* Left brand panel */
  .login-brand {
    flex: 1;
    background: var(--navy);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px 52px;
    position: relative;
    overflow: hidden;
  }
  .login-brand::before {
    content: '';
    position: absolute;
    width: 480px; height: 480px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
    bottom: -160px; right: -120px;
  }
  .login-brand::after {
    content: '';
    position: absolute;
    width: 280px; height: 280px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
    top: -80px; right: 60px;
  }

  .brand-logo {
    display: flex;
    align-items: center;
    gap: 11px;
    text-decoration: none;
  }
  .brand-logo-icon {
    width: 40px; height: 40px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .brand-logo-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    color: white;
    letter-spacing: 0.01em;
  }

  .brand-tagline {
    z-index: 1;
  }
  .brand-tagline h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    color: white;
    line-height: 1.2;
    margin-bottom: 16px;
  }
  .brand-tagline h2 span { color: #60a5fa; }
  .brand-tagline p {
    color: rgba(255,255,255,0.62);
    font-size: 0.95rem;
    line-height: 1.7;
    max-width: 360px;
  }

  .brand-trust {
    display: flex;
    gap: 24px;
    z-index: 1;
    flex-wrap: wrap;
  }
  .brand-trust-item {
    display: flex;
    flex-direction: column;
  }
  .brand-trust-val {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem;
    color: white;
    font-weight: 700;
  }
  .brand-trust-label {
    font-size: 0.68rem;
    color: rgba(255,255,255,0.45);
    text-transform: uppercase;
    letter-spacing: 0.09em;
    margin-top: 2px;
  }

  /* Right form panel */
  .login-form-panel {
    width: 480px;
    flex-shrink: 0;
    background: var(--white);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 56px 52px;
  }

  .login-heading {
    font-family: 'Playfair Display', serif;
    font-size: 1.9rem;
    color: var(--navy);
    margin-bottom: 6px;
  }
  .login-subheading {
    color: var(--muted);
    font-size: 0.9rem;
    margin-bottom: 36px;
  }

  /* Form elements */
  .form-group {
    margin-bottom: 20px;
  }
  .form-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 7px;
  }
  .form-control-wrap {
    position: relative;
  }
  .form-input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid var(--border);
    border-radius: 8px;
    font-size: 0.92rem;
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
    background: var(--white);
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }
  .form-input:focus {
    border-color: var(--navy);
    box-shadow: 0 0 0 3px rgba(27,58,107,0.1);
  }
  .form-input.has-error {
    border-color: var(--error);
  }
  .form-input.has-error:focus {
    box-shadow: 0 0 0 3px rgba(239,68,68,0.12);
  }
  .form-input-password {
    padding-right: 44px;
  }
  .toggle-password {
    position: absolute;
    right: 13px;  top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--muted);
    display: flex;
    padding: 2px;
    transition: color 0.2s;
  }
  .toggle-password:hover { color: var(--navy); }

  .field-error {
    font-size: 0.75rem;
    color: var(--error);
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    font-size: 0.82rem;
  }
  .remember-label {
    display: flex;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    color: var(--text);
    font-weight: 500;
    -webkit-user-select: none;
    user-select: none;
  }
  .remember-label input[type="checkbox"] {
    width: 16px; height: 16px;
    accent-color: var(--navy);
    cursor: pointer;
  }
  .forgot-link {
    color: var(--blue);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
  }
  .forgot-link:hover { color: var(--navy); text-decoration: underline; }

  .btn-login {
    width: 100%;
    background: var(--navy);
    color: white;
    border: none;
    padding: 13px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    letter-spacing: 0.01em;
  }
  .btn-login:hover:not(:disabled)  { background: var(--navy-dark); }
  .btn-login:active:not(:disabled) { transform: scale(0.99); }
  .btn-login:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  /* Spinner */
  .spinner {
    width: 18px; height: 18px;
    border: 2.5px solid rgba(255,255,255,0.35);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* API error alert */
  .login-api-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 11px 14px;
    font-size: 0.83rem;
    color: #b91c1c;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 22px 0;
    color: var(--muted);
    font-size: 0.78rem;
  }
  .divider::before, .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .register-cta {
    text-align: center;
    font-size: 0.85rem;
    color: var(--muted);
    margin-top: 24px;
  }
  .register-cta a {
    color: var(--navy);
    font-weight: 700;
    text-decoration: none;
    transition: color 0.2s;
  }
  .register-cta a:hover { color: var(--blue); text-decoration: underline; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .login-brand { display: none; }
    .login-form-panel { width: 100%; padding: 48px 28px; }
  }
  @media (max-width: 480px) {
    .login-form-panel { padding: 36px 20px; }
    .login-heading { font-size: 1.65rem; }
  }
`;



/* Saturn logo SVG (same as LandingPage) */
const SaturnLogo = ({ size = 24 }) => (
  <img src="/logo.png" alt="Bank of Saturn Logo" width={size} height={size} style={{ objectFit: "contain", borderRadius: "20%" }} />
);

/* Eye icons */
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* Validation schema */
const loginSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(4, "Password must be at least 4 characters")
    .required("Password is required"),
});

/* ─── Login component ─── */
export default function Login({onLogin}) {

  let cookies = new Cookies()
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [rateLock, setRateLock] = useState(null); // Date when authLimiter block expires
  const [rateLockSecs, setRateLockSecs] = useState(0);

  useEffect(() => {
    if (!rateLock) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((rateLock - Date.now()) / 1000));
      setRateLockSecs(left);
      if (left === 0) { setRateLock(null); clearInterval(id); }
    }, 1000);
    return () => clearInterval(id);
  }, [rateLock]);

  const formik = useFormik({
    initialValues: { email: "", password: "", rememberMe: false },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setApiError("");
      try {
        const response = await axios.post("https://bank-web-app-eight.vercel.app/api/v1/login", {
          email: values.email,
          password: values.password,
        });

        const decoded = jwtDecode(response.data.token); 
        cookies.set("token", response.data.token, {
          path: "/",
          expires: new Date(decoded.exp * 1000),
        });

        onLogin();
        navigate("/dashboard");

      } catch (e) {
        const status = e?.response?.status;
        const msg = e?.response?.data?.message || e?.response?.data?.error || "Network error. Please check your connection and try again.";
        if (status === 429) {
          setApiError(""); // clear regular error — show lockout banner instead
          setRateLock(Date.now() + 15 * 60 * 1000);
          setRateLockSecs(900);
        } else {
          setApiError(msg);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : null;

  return (
    <>
      <style>{style}</style>

      <div className="login-root">
        {/* ── LEFT BRAND PANEL ── */}
        <aside className="login-brand">
          <Link to="/" className="brand-logo">
            <div className="brand-logo-icon">
              <SaturnLogo size={24} />
            </div>
            <span className="brand-logo-name">Bank of Saturn</span>
          </Link>

          <div className="brand-tagline">
            <h2>
              Banking That<br />
              Works <span>For You</span>,<br />
              Not Against You.
            </h2>
            <p>
              Manage your money, pay bills, save smarter, and track your finances — all in one secure place.
            </p>
          </div>

          <div className="brand-trust">
            {[
              { val: "₦2.4B+", label: "Total Deposits" },
              { val: "250K+", label: "Active Customers" },
              { val: "99.9%", label: "Uptime SLA" },
            ].map((s) => (
              <div className="brand-trust-item" key={s.label}>
                <div className="brand-trust-val">{s.val}</div>
                <div className="brand-trust-label">{s.label}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── RIGHT FORM PANEL ── */}
        <main className="login-form-panel">
          <h1 className="login-heading">Welcome back</h1>
          <p className="login-subheading">Sign in to your Bank of Saturn account</p>

          {/* Rate-limit lockout banner */}
          {rateLock && (
            <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", color: "#92400e", borderRadius: 8, padding: "12px 14px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 10, fontSize: ".83rem", lineHeight: 1.5 }}>
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>🔒</span>
              <div>
                <strong>Too many login attempts.</strong> Please wait{" "}
                <strong>{Math.floor(rateLockSecs / 60)}:{String(rateLockSecs % 60).padStart(2, "0")}</strong>{" "}
                before trying again.
              </div>
            </div>
          )}

          {apiError && (
            <div className="login-api-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {apiError}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); formik.handleSubmit(e); }} noValidate>
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`form-input${fieldError("email") ? " has-error" : ""}`}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {fieldError("email") && (
                <div className="field-error" role="alert">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                  {fieldError("email")}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="form-control-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`form-input form-input-password${fieldError("password") ? " has-error" : ""}`}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {fieldError("password") && (
                <div className="field-error" role="alert">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                  {fieldError("password")}
                </div>
              )}
            </div>

            {/* Options row */}
            <div className="form-options">
              <label className="remember-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formik.values.rememberMe}
                  onChange={formik.handleChange}
                />
                Remember me
              </label>
             <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-login"
              disabled={formik.isSubmitting || !!rateLock}
            >
              {formik.isSubmitting ? (
                <>
                  <span className="spinner" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="divider">or</div>

          <p className="register-cta">
            Don't have an account?{" "}
            <a href="/register">Open an account — it's free</a>
          </p>
        </main>
      </div>
    </>
  );
}