import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API = "http://localhost:9000/api/v1";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy: #1b3a6b; --navy-dark: #122850; --blue: #2563eb;
    --green: #16a34a; --text: #1e293b; --muted: #64748b;
    --border: #e2e8f0; --bg: #f8fafc; --white: #ffffff; --error: #ef4444;
  }
  body { font-family: 'DM Sans', sans-serif; color: var(--text); background: var(--bg); }

  /* ── Layout ── */
  .fp-root { min-height: 100vh; display: flex; }

  /* Left brand panel — identical to Login */
  .fp-brand {
    flex: 1; background: var(--navy);
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 48px 52px; position: relative; overflow: hidden;
  }
  .fp-brand::before {
    content: ''; position: absolute;
    width: 480px; height: 480px; border-radius: 50%;
    background: rgba(255,255,255,.04); bottom: -160px; right: -120px;
  }
  .fp-brand::after {
    content: ''; position: absolute;
    width: 280px; height: 280px; border-radius: 50%;
    background: rgba(255,255,255,.04); top: -80px; right: 60px;
  }
  .fp-brand-logo { display: flex; align-items: center; gap: 11px; text-decoration: none; }
  .fp-brand-logo-icon {
    width: 40px; height: 40px; background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.2); border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .fp-brand-logo-name { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: white; }
  .fp-brand-tagline { z-index: 1; }
  .fp-brand-tagline h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 3vw, 2.6rem); color: white; line-height: 1.2; margin-bottom: 16px;
  }
  .fp-brand-tagline h2 span { color: #60a5fa; }
  .fp-brand-tagline p { color: rgba(255,255,255,.62); font-size: .95rem; line-height: 1.7; max-width: 360px; }
  .fp-brand-trust { display: flex; gap: 24px; z-index: 1; flex-wrap: wrap; }
  .fp-brand-trust-item { display: flex; flex-direction: column; }
  .fp-brand-trust-val { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: white; font-weight: 700; }
  .fp-brand-trust-label { font-size: .68rem; color: rgba(255,255,255,.45); text-transform: uppercase; letter-spacing: .09em; margin-top: 2px; }

  /* Right panel */
  .fp-panel {
    width: 480px; flex-shrink: 0; background: var(--white);
    display: flex; flex-direction: column; justify-content: center;
    padding: 56px 52px;
  }

  /* Step indicator */
  .fp-steps {
    display: flex; align-items: center; gap: 0;
    margin-bottom: 36px;
  }
  .fp-step-item { display: flex; align-items: center; gap: 0; flex: 1; }
  .fp-step-dot {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: .72rem; font-weight: 700; transition: all .3s;
    border: 2px solid var(--border); background: var(--white); color: var(--muted);
    position: relative; z-index: 1;
  }
  .fp-step-dot.done { background: var(--green); border-color: var(--green); color: white; }
  .fp-step-dot.active { background: var(--navy); border-color: var(--navy); color: white; }
  .fp-step-line {
    flex: 1; height: 2px; background: var(--border);
    margin: 0 4px; transition: background .3s;
  }
  .fp-step-line.done { background: var(--green); }

  /* Step header */
  .fp-step-icon {
    width: 56px; height: 56px; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 18px;
  }
  .fp-heading {
    font-family: 'Playfair Display', serif;
    font-size: 1.75rem; color: var(--navy); margin-bottom: 6px;
  }
  .fp-sub { color: var(--muted); font-size: .9rem; margin-bottom: 28px; line-height: 1.6; }
  .fp-sub strong { color: var(--navy); font-weight: 700; }

  /* Form elements */
  .fp-form-group { margin-bottom: 20px; }
  .fp-label { display: block; font-size: .82rem; font-weight: 600; color: var(--text); margin-bottom: 7px; }
  .fp-input {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid var(--border); border-radius: 8px;
    font-size: .92rem; font-family: 'DM Sans', sans-serif;
    color: var(--text); background: var(--white); outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .fp-input:focus { border-color: var(--navy); box-shadow: 0 0 0 3px rgba(27,58,107,.1); }
  .fp-input.err { border-color: var(--error); }
  .fp-input.err:focus { box-shadow: 0 0 0 3px rgba(239,68,68,.12); }
  .fp-input-wrap { position: relative; }
  .fp-input-pw { padding-right: 44px; }
  .fp-eye {
    position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: var(--muted);
    display: flex; padding: 2px; transition: color .2s;
  }
  .fp-eye:hover { color: var(--navy); }

  /* OTP inputs */
  .fp-otp-row { display: flex; gap: 10px; margin-bottom: 8px; width: 100%; }
  .fp-otp-input {
    width: 0; flex: 1; min-width: 0; height: 58px; text-align: center;
    font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700;
    color: var(--navy); border: 2px solid var(--border); border-radius: 12px;
    background: var(--bg); outline: none; caret-color: var(--navy);
    transition: border-color .2s, box-shadow .2s, background .2s;
  }
  .fp-otp-input:focus {
    border-color: var(--navy); background: var(--white);
    box-shadow: 0 0 0 3px rgba(27,58,107,.1);
  }
  .fp-otp-input.filled { border-color: var(--navy); background: var(--white); }
  .fp-otp-input.err { border-color: var(--error); box-shadow: 0 0 0 3px rgba(239,68,68,.12); }

  /* Password strength */
  .fp-strength-row { display: flex; gap: 4px; margin: 8px 0 4px; }
  .fp-strength-bar {
    flex: 1; height: 3px; border-radius: 2px; background: var(--border); transition: background .3s;
  }
  .fp-strength-label { font-size: .72rem; color: var(--muted); margin-bottom: 14px; }

  /* Field error */
  .fp-field-err {
    font-size: .75rem; color: var(--error); margin-top: 5px;
    display: flex; align-items: center; gap: 4px;
  }

  /* Alert */
  .fp-alert {
    border-radius: 8px; padding: 11px 14px;
    font-size: .83rem; display: flex; align-items: flex-start;
    gap: 8px; margin-bottom: 20px; line-height: 1.5;
  }
  .fp-alert.error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }
  .fp-alert.success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }

  /* Buttons */
  .fp-btn {
    width: 100%; background: var(--navy); color: white; border: none;
    padding: 13px; border-radius: 8px; font-size: .95rem; font-weight: 700;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: background .2s, transform .1s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .fp-btn:hover:not(:disabled) { background: var(--navy-dark); }
  .fp-btn:active:not(:disabled) { transform: scale(.99); }
  .fp-btn:disabled { opacity: .6; cursor: not-allowed; }
  .fp-btn.green { background: var(--green); }
  .fp-btn.green:hover:not(:disabled) { background: #15803d; }

  /* Resend */
  .fp-resend {
    text-align: center; margin-top: 16px;
    font-size: .84rem; color: var(--muted);
  }
  .fp-resend button {
    background: none; border: none; color: var(--navy);
    font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif;
    font-size: .84rem; transition: color .2s; padding: 0;
  }
  .fp-resend button:hover { color: var(--blue); }
  .fp-resend button:disabled { color: var(--muted); cursor: not-allowed; }

  /* Back link */
  .fp-back {
    display: flex; align-items: center; gap: 6px;
    color: var(--muted); font-size: .84rem; font-weight: 600;
    text-decoration: none; margin-bottom: 28px;
    transition: color .2s; background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; padding: 0;
  }
  .fp-back:hover { color: var(--navy); }

  /* Success screen */
  .fp-success {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; padding: 8px 0;
  }
  .fp-success-icon {
    width: 80px; height: 80px; border-radius: 50%;
    background: #f0fdf4; border: 3px solid #bbf7d0;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 22px;
    animation: popIn .4s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes popIn { from{opacity:0;transform:scale(.6)} to{opacity:1;transform:scale(1)} }
  .fp-success h2 { font-family: 'Playfair Display', serif; font-size: 1.7rem; color: var(--navy); margin-bottom: 10px; }
  .fp-success p { color: var(--muted); font-size: .9rem; line-height: 1.7; margin-bottom: 28px; }

  /* Spinner */
  .fp-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2.5px solid rgba(255,255,255,.35); border-top-color: white;
    animation: spin .7s linear infinite; flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Slide animation */
  .fp-slide { animation: slideIn .28s cubic-bezier(.4,0,.2,1); }
  @keyframes slideIn { from{opacity:0;transform:translateX(18px)} to{opacity:1;transform:translateX(0)} }

  /* Responsive */
  @media (max-width: 900px) {
    .fp-brand { display: none; }
    .fp-panel { width: 100%; padding: 48px 28px; }
  }
  @media (max-width: 480px) {
    .fp-panel { padding: 36px 20px; }
    .fp-heading { font-size: 1.5rem; }
    .fp-otp-input { height: 52px; font-size: 1.3rem; }
  }
`;

import logoImg from "../assets/logo.png";

/* ── SVG helpers ── */
const SaturnLogo = ({ size = 24 }) => (
  <img src={logoImg} alt="Bank of Saturn Logo" width={size} height={size} style={{ objectFit: "contain", borderRadius: "20%" }} />
);
const IconMail = ({ size = 26, color = "#2563eb" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconShield = ({ size = 26, color = "#7c3aed" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconLock = ({ size = 26, color = "#d97706" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconCheck = ({ size = 36, color = "#16a34a" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

/* ── Password strength ── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak", color: "#ef4444" };
  if (score <= 2) return { score, label: "Fair", color: "#d97706" };
  if (score <= 3) return { score, label: "Good", color: "#2563eb" };
  return { score, label: "Strong", color: "#16a34a" };
}

/* ── Step indicator ── */
function StepIndicator({ step }) {
  const steps = [1, 2, 3];
  return (
    <div className="fp-steps">
      {steps.map((s, i) => (
        <div key={s} className="fp-step-item" style={{ flex: i < steps.length - 1 ? 1 : "none" }}>
          <div className={`fp-step-dot ${step > s ? "done" : step === s ? "active" : ""}`}>
            {step > s
              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              : s}
          </div>
          {i < steps.length - 1 && (
            <div className={`fp-step-line ${step > s ? "done" : ""}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Step 1: Email ── */
function StepEmail({ onSent }) {
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError("");
    try {
      await axios.post(`${API}/request-otp`, { email: email.trim() });
      onSent(email.trim());
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fp-slide">
      <div className="fp-step-icon" style={{ background: "#eff6ff" }}>
        <IconMail size={26} color="#2563eb" />
      </div>
      <h1 className="fp-heading">Forgot password?</h1>
      <p className="fp-sub">Enter your registered email and we'll send a 4-digit OTP to reset your password.</p>

      {error && (
        <div className="fp-alert error"><AlertIcon />{error}</div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="fp-form-group">
          <label className="fp-label" htmlFor="fp-email">Email address</label>
          <input
            id="fp-email" type="email" autoComplete="email"
            placeholder="you@example.com"
            className={`fp-input${error ? " err" : ""}`}
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            autoFocus
          />
        </div>
        <button type="submit" className="fp-btn" disabled={loading}>
          {loading ? <><span className="fp-spinner" />Sending OTP…</> : "Send OTP"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Link to="/login" className="fp-back" style={{ justifyContent: "center", display: "inline-flex" }}>
          <IconBack /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}

/* ── Step 2: OTP ── */
function StepOTP({ email, onVerified, onBack }) {
  const [otp, setOtp]         = useState(["", "", "", ""]);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const refs = useRef([useRef(), useRef(), useRef(), useRef()]).current;

  // Focus first input on mount
  useEffect(() => { setTimeout(() => refs[0].current?.focus(), 80); }, []);

  // Countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleChange = (val, idx) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = clean;
    setOtp(next);
    setError("");
    if (clean && idx < 3) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const next = [...otp];
    pasted.split("").forEach((ch, i) => { if (i < 4) next[i] = ch; });
    setOtp(next);
    const lastFilled = Math.min(pasted.length, 3);
    refs[lastFilled].current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 4) { setError("Please enter the complete 4-digit OTP."); return; }
    setLoading(true); setError("");
    // We don't call a separate verify endpoint — OTP is verified in forgotPassword
    // Just pass it forward to step 3
    onVerified(code);
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true); setError("");
    try {
      await axios.post(`${API}/request-otp`, { email });
      setResendCooldown(60);
      setOtp(["", "", "", ""]);
      setTimeout(() => refs[0].current?.focus(), 80);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to resend OTP.");
    } finally { setResending(false); }
  };

  const allFilled = otp.every(d => d !== "");

  return (
    <div className="fp-slide">
      <button className="fp-back" onClick={onBack}><IconBack /> Back</button>
      <div className="fp-step-icon" style={{ background: "#f5f3ff" }}>
        <IconShield size={26} color="#7c3aed" />
      </div>
      <h1 className="fp-heading">Enter OTP</h1>
      <p className="fp-sub">
        We sent a 4-digit code to <strong>{email}</strong>. Check your inbox (and spam folder).
      </p>

      {error && <div className="fp-alert error"><AlertIcon />{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="fp-otp-row" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className={`fp-otp-input${digit ? " filled" : ""}${error ? " err" : ""}`}
              value={digit}
              onChange={e => handleChange(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
            />
          ))}
        </div>

        <button
          type="submit" className="fp-btn"
          style={{ marginTop: 20 }}
          disabled={loading || !allFilled}
        >
          {loading ? <><span className="fp-spinner" />Verifying…</> : "Verify OTP"}
        </button>
      </form>

      <div className="fp-resend">
        {resendCooldown > 0 ? (
          <span>Resend code in <strong style={{ color: "var(--navy)" }}>{resendCooldown}s</strong></span>
        ) : (
          <span>
            Didn't receive it?{" "}
            <button onClick={handleResend} disabled={resending}>
              {resending ? "Sending…" : "Resend OTP"}
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Step 3: New password ── */
function StepNewPassword({ email, otp, onDone }) {
  const [pw, setPw]           = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [showCf, setShowCf]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getStrength(pw);

  const validate = () => {
    if (!pw) return "Password is required.";
    if (pw.length < 6) return "Password must be at least 6 characters.";
    if (pw !== confirm) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError("");
    try {
      await axios.post(`${API}/forgot-password`, { email, otp, newPassword: pw });
      onDone();
    } catch (e) {
      setError(e?.response?.data?.message || "Password reset failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fp-slide">
      <div className="fp-step-icon" style={{ background: "#fffbeb" }}>
        <IconLock size={26} color="#d97706" />
      </div>
      <h1 className="fp-heading">New password</h1>
      <p className="fp-sub">Almost done. Choose a strong password for your account.</p>

      {error && <div className="fp-alert error"><AlertIcon />{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {/* New password */}
        <div className="fp-form-group">
          <label className="fp-label">New Password</label>
          <div className="fp-input-wrap">
            <input
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              className={`fp-input fp-input-pw${error && !pw ? " err" : ""}`}
              value={pw}
              onChange={e => { setPw(e.target.value); setError(""); }}
              autoFocus
            />
            <button type="button" className="fp-eye" onClick={() => setShowPw(v => !v)}>
              {showPw ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
          {/* Strength bars */}
          {pw && (
            <>
              <div className="fp-strength-row">
                {[1,2,3,4].map(i => (
                  <div key={i} className="fp-strength-bar"
                    style={{ background: i <= strength.score ? strength.color : undefined }} />
                ))}
              </div>
              <div className="fp-strength-label" style={{ color: strength.color }}>
                {strength.label} password
              </div>
            </>
          )}
        </div>

        {/* Confirm */}
        <div className="fp-form-group">
          <label className="fp-label">Confirm Password</label>
          <div className="fp-input-wrap">
            <input
              type={showCf ? "text" : "password"}
              placeholder="••••••••"
              className={`fp-input fp-input-pw${error && confirm && pw !== confirm ? " err" : ""}`}
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(""); }}
            />
            <button type="button" className="fp-eye" onClick={() => setShowCf(v => !v)}>
              {showCf ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
          {confirm && pw !== confirm && (
            <div className="fp-field-err">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              Passwords don't match
            </div>
          )}
        </div>

        <button type="submit" className="fp-btn green" disabled={loading}>
          {loading ? <><span className="fp-spinner" />Resetting…</> : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

/* ── Success screen ── */
function StepSuccess() {
  const navigate = useNavigate();
  return (
    <div className="fp-success fp-slide">
      <div className="fp-success-icon">
        <IconCheck size={36} color="#16a34a" />
      </div>
      <h2>Password Reset!</h2>
      <p>Your password has been updated successfully. You can now sign in with your new password.</p>
      <button className="fp-btn" style={{ maxWidth: 320 }} onClick={() => navigate("/login")}>
        Back to Sign In
      </button>
    </div>
  );
}

/* ── Main page ── */
export default function ForgotPassword() {
  const [step,  setStep]  = useState(1);  // 1 | 2 | 3 | 4(success)
  const [email, setEmail] = useState("");
  const [otp,   setOtp]   = useState("");

  return (
    <>
      <style>{style}</style>
      <div className="fp-root">

        {/* ── Left brand panel ── */}
        <aside className="fp-brand">
          <Link to="/" className="fp-brand-logo">
            <div className="fp-brand-logo-icon"><SaturnLogo size={24} /></div>
            <span className="fp-brand-logo-name">Bank of Saturn</span>
          </Link>
          <div className="fp-brand-tagline">
            <h2>Secure Your<br /><span>Account</span>,<br />Reclaim Access.</h2>
            <p>Your security is our priority. Reset your password safely in just a few steps.</p>
          </div>
          <div className="fp-brand-trust">
            {[
              { val: "256-bit", label: "Encryption" },
              { val: "2FA",     label: "OTP Verified" },
              { val: "24/7",    label: "Fraud Monitoring" },
            ].map(s => (
              <div className="fp-brand-trust-item" key={s.label}>
                <div className="fp-brand-trust-val">{s.val}</div>
                <div className="fp-brand-trust-label">{s.label}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Right form panel ── */}
        <main className="fp-panel">
          {step < 4 && <StepIndicator step={step} />}

          {step === 1 && (
            <StepEmail onSent={email => { setEmail(email); setStep(2); }} />
          )}
          {step === 2 && (
            <StepOTP
              email={email}
              onVerified={code => { setOtp(code); setStep(3); }}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepNewPassword
              email={email}
              otp={otp}
              onDone={() => setStep(4)}
            />
          )}
          {step === 4 && <StepSuccess />}
        </main>
      </div>
    </>
  );
}