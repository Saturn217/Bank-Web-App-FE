import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

/* ── SVG Icons (replaces all emojis) ── */
const IconGift = ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
);
const IconBoltReg = ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);
const IconShieldReg = ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const IconChartReg = ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
);
/* Celebration / success icon */
const IconCheckCircle = ({ size = 28, color = "#16a34a" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

/* ─── Brand tokens (mirrored from LandingPage / Login) ─── */
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
    --success:   #16a34a;
  }

  body {
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
    background: var(--bg);
  }

  /* ── Layout ── */
  .reg-root {
    min-height: 100vh;
    display: flex;
  }

  /* Left brand panel */
  .reg-brand {
    flex: 1;
    background: var(--navy);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px 52px;
    position: relative;
    overflow: hidden;
  }
  .reg-brand::before {
    content: '';
    position: absolute;
    width: 480px; height: 480px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
    bottom: -160px; right: -120px;
  }
  .reg-brand::after {
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

  .brand-tagline { z-index: 1; }
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

  /* Perks list on left panel */
  .brand-perks {
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .brand-perk {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .brand-perk-icon {
    width: 32px; height: 32px;
    border-radius: 8px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.88rem;
  }
  .brand-perk-text strong {
    display: block;
    color: white;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 2px;
  }
  .brand-perk-text span {
    color: rgba(255,255,255,0.5);
    font-size: 0.75rem;
    line-height: 1.5;
  }

  /* Right form panel */
  .reg-form-panel {
    width: 500px;
    flex-shrink: 0;
    background: var(--white);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 52px 48px;
    overflow-y: auto;
  }

  .reg-heading {
    font-family: 'Playfair Display', serif;
    font-size: 1.9rem;
    color: var(--navy);
    margin-bottom: 6px;
  }
  .reg-subheading {
    color: var(--muted);
    font-size: 0.9rem;
    margin-bottom: 32px;
  }

  /* Welcome bonus badge */
  .welcome-bonus {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f0fdf4;
    border: 1px solid #86efac;
    border-radius: 8px;
    padding: 11px 14px;
    margin-bottom: 28px;
    font-size: 0.82rem;
    color: var(--green);
    font-weight: 600;
    line-height: 1.4;
  }
  .welcome-bonus-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  .welcome-bonus span { color: var(--muted); font-weight: 400; display: block; margin-top: 1px; }

  /* Form elements */
  .form-group { margin-bottom: 18px; }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .form-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 7px;
  }
  .form-control-wrap { position: relative; }

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
  .form-input.has-error { border-color: var(--error); }
  .form-input.has-error:focus {
    box-shadow: 0 0 0 3px rgba(239,68,68,0.12);
  }
  .form-input-password { padding-right: 44px; }

  .toggle-password {
    position: absolute;
    right: 13px; top: 50%;
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

  /* Password strength */
  .pwd-strength {
    margin-top: 7px;
    display: flex;
    gap: 4px;
    align-items: center;
  }
  .pwd-bar {
    flex: 1;
    height: 3px;
    border-radius: 3px;
    background: var(--border);
    transition: background 0.3s;
  }
  .pwd-bar.weak   { background: #ef4444; }
  .pwd-bar.fair   { background: #f59e0b; }
  .pwd-bar.good   { background: #3b82f6; }
  .pwd-bar.strong { background: var(--green); }
  .pwd-strength-label {
    font-size: 0.7rem;
    font-weight: 600;
    margin-left: 4px;
    min-width: 42px;
    text-align: right;
  }
  .pwd-strength-label.weak   { color: #ef4444; }
  .pwd-strength-label.fair   { color: #f59e0b; }
  .pwd-strength-label.good   { color: #3b82f6; }
  .pwd-strength-label.strong { color: var(--green); }

  /* Terms checkbox */
  .terms-row {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-bottom: 22px;
    font-size: 0.82rem;
    color: var(--muted);
    line-height: 1.5;
  }
  .terms-row input[type="checkbox"] {
    width: 16px; height: 16px;
    accent-color: var(--navy);
    cursor: pointer;
    margin-top: 1px;
    flex-shrink: 0;
  }
  .terms-row a {
    color: var(--navy);
    font-weight: 600;
    text-decoration: none;
  }
  .terms-row a:hover { color: var(--blue); text-decoration: underline; }

  /* Submit button */
  .btn-register {
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
  .btn-register:hover:not(:disabled)  { background: var(--navy-dark); }
  .btn-register:active:not(:disabled) { transform: scale(0.99); }
  .btn-register:disabled { opacity: 0.65; cursor: not-allowed; }

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

  /* API error / success alerts */
  .reg-api-error {
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

  .reg-success {
    background: #f0fdf4;
    border: 1px solid #86efac;
    border-radius: 12px;
    padding: 36px 28px;
    text-align: center;
  }
  .reg-success-icon {
    width: 56px; height: 56px;
    background: #dcfce7;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.6rem;
    margin: 0 auto 16px;
  }
  .reg-success h3 {
    font-family: 'Playfair Display', serif;
    color: var(--navy);
    font-size: 1.35rem;
    margin-bottom: 10px;
  }
  .reg-success p {
    color: var(--muted);
    font-size: 0.88rem;
    line-height: 1.65;
    margin-bottom: 4px;
  }
  .reg-success .acct-number {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    color: var(--navy);
    font-weight: 700;
    letter-spacing: 0.06em;
    margin: 10px 0;
    background: #e9f5e9;
    border-radius: 6px;
    padding: 8px 14px;
    display: inline-block;
  }
  .btn-go-login {
    margin-top: 22px;
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
    transition: background 0.2s;
  }
  .btn-go-login:hover { background: var(--navy-dark); }

  .login-cta {
    text-align: center;
    font-size: 0.85rem;
    color: var(--muted);
    margin-top: 24px;
  }
  .login-cta a {
    color: var(--navy);
    font-weight: 700;
    text-decoration: none;
    transition: color 0.2s;
  }
  .login-cta a:hover { color: var(--blue); text-decoration: underline; }

  /* ── Responsive ── */
  @media (max-width: 960px) {
    .reg-brand { display: none; }
    .reg-form-panel { width: 100%; padding: 48px 28px; }
  }
  @media (max-width: 480px) {
    .reg-form-panel { padding: 36px 20px; }
    .reg-heading { font-size: 1.65rem; }
    .form-row { grid-template-columns: 1fr; gap: 0; }
  }
`;

import logoImg from "../assets/logo.png";

/* ── Saturn logo SVG ── */
const SaturnLogo = ({ size = 24 }) => (
    <img src={logoImg} alt="Bank of Saturn Logo" width={size} height={size} style={{ objectFit: "contain", borderRadius: "20%" }} />
);

/* ── Eye icons ── */
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

/* ── Error icon ── */
const ErrorIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
);

/* ── Password strength helper ── */
function getPasswordStrength(pwd) {
    if (!pwd) return { score: 0, label: "", cls: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
        { label: "", cls: "" },
        { label: "Weak", cls: "weak" },
        { label: "Fair", cls: "fair" },
        { label: "Good", cls: "good" },
        { label: "Strong", cls: "strong" },
    ];
    return { score, ...map[score] };
}

/* ── Yup validation schema ── */
const registerSchema = Yup.object({
    fullName: Yup.string()
        .min(2, "Full name must be at least 2 characters")
        .required("Full name is required"),
    email: Yup.string()
        .email("Enter a valid email address")
        .required("Email is required"),
    password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords do not match")
        .required("Please confirm your password"),
    terms: Yup.boolean()
        .oneOf([true], "You must accept the terms and conditions"),
});

/* ── Register component ── */
export default function Register() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [apiError, setApiError] = useState("");
    const [successData, setSuccessData] = useState(null); // { fullName, accountNumber }

    const formik = useFormik({
        initialValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            terms: false,
        },
        validationSchema: registerSchema,
        onSubmit: async (values, { setSubmitting }) => {
            setApiError("");
            try {
                const response = await axios.post(
                    "http://localhost:9000/api/v1/register",
                    {
                        fullName: values.fullName,
                        email: values.email,
                        password: values.password,
                    }
                );
                // Backend returns: { message, data: { fullName, email, accountNumber, balance, roles } }
                setSuccessData(response.data.data);
            } catch (err) {
                const msg =
                    err?.response?.data?.message ||
                    "Something went wrong. Please try again.";
                setApiError(msg);
            } finally {
                setSubmitting(false);
            }
        },
    });

    const fieldError = (name) =>
        formik.touched[name] && formik.errors[name] ? formik.errors[name] : null;

    const pwdStrength = getPasswordStrength(formik.values.password);

    return (
        <>
            <style>{style}</style>

            <div className="reg-root">
                {/* ── LEFT BRAND PANEL ── */}
                <aside className="reg-brand">
                    <Link to="/" className="brand-logo">
                        <div className="brand-logo-icon">
                            <SaturnLogo size={24} />
                        </div>
                        <span className="brand-logo-name">Bank of Saturn</span>
                    </Link>

                    <div className="brand-tagline">
                        <h2>
                            Your Money,<br />
                            Your <span>Future</span>,<br />
                            Secured.
                        </h2>
                        <p>
                            Open your Bank of Saturn account in minutes and start banking smarter today — zero hidden fees, full control.
                        </p>
                    </div>

                    <div className="brand-perks">
                        {[
                            { icon: <IconGift size={18} color="white" />, title: "₦100,000 Welcome Bonus", desc: "Instantly credited on account opening" },
                            { icon: <IconBoltReg size={18} color="white" />, title: "Instant Transfers", desc: "Send money 24/7 — no delays, no fees" },
                            { icon: <IconShieldReg size={18} color="white" />, title: "Bank-Grade Security", desc: "Multi-layer encryption & real-time fraud alerts" },
                            { icon: <IconChartReg size={18} color="white" />, title: "Spending Insights", desc: "Visual breakdowns of where your money goes" },
                        ].map((p) => (
                            <div className="brand-perk" key={p.title}>
                                <div className="brand-perk-icon">{p.icon}</div>
                                <div className="brand-perk-text">
                                    <strong>{p.title}</strong>
                                    <span>{p.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* ── RIGHT FORM PANEL ── */}
                <main className="reg-form-panel">
                    {successData ? (
                        /* ── Success state ── */
                        <div className="reg-success">
                            <div className="reg-success-icon"><IconCheckCircle size={30} /></div>
                            <h3>Account Created!</h3>
                            <p>Welcome, <strong>{successData.fullName}</strong>! Your Bank of Saturn account is ready.</p>
                            <p style={{ marginTop: 6, fontSize: "0.8rem", color: "#64748b" }}>Your account number</p>
                            <div className="acct-number">{successData.accountNumber}</div>
                            <p style={{ fontSize: "0.8rem", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                <IconGift size={15} color="var(--green)" /> <strong style={{ color: "var(--green)" }}>₦100,000 welcome bonus</strong> has been credited to your account.
                            </p>
                            <button className="btn-go-login" onClick={() => navigate("/login")}>
                                Sign In to Your Account
                            </button>
                        </div>
                    ) : (
                        /* ── Registration form ── */
                        <>
                            <h1 className="reg-heading">Open an Account</h1>
                            <p className="reg-subheading">Join Bank of Saturn — it takes less than 2 minutes</p>

                            {/* Welcome bonus banner */}
                            <div className="welcome-bonus">
                                <span className="welcome-bonus-icon"><IconGift size={20} color="#16a34a" /></span>
                                <div>
                                    Get <strong>₦100,000 welcome bonus</strong> instantly on sign-up
                                    <span>No minimum deposit required. No hidden fees.</span>
                                </div>
                            </div>

                            {/* API error */}
                            {apiError && (
                                <div className="reg-api-error" role="alert">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {apiError}
                                </div>
                            )}

                            <form onSubmit={formik.handleSubmit} noValidate>
                                {/* Full Name */}
                                <div className="form-group">
                                    <label className="form-label" htmlFor="fullName">Full Name</label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="e.g. Chidi Okonkwo"
                                        className={`form-input${fieldError("fullName") ? " has-error" : ""}`}
                                        value={formik.values.fullName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {fieldError("fullName") && (
                                        <div className="field-error" role="alert">
                                            <ErrorIcon />
                                            {fieldError("fullName")}
                                        </div>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="form-group">
                                    <label className="form-label" htmlFor="email">Email Address</label>
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
                                            <ErrorIcon />
                                            {fieldError("email")}
                                        </div>
                                    )}
                                </div>

                                {/* Password + Confirm Password in a row */}
                                <div className="form-row">
                                    {/* Password */}
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="password">Password</label>
                                        <div className="form-control-wrap">
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                placeholder="Min. 8 characters"
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
                                        {/* Strength meter */}
                                        {formik.values.password && (
                                            <div className="pwd-strength">
                                                {[1, 2, 3, 4].map((n) => (
                                                    <div
                                                        key={n}
                                                        className={`pwd-bar${n <= pwdStrength.score ? " " + pwdStrength.cls : ""}`}
                                                    />
                                                ))}
                                                <span className={`pwd-strength-label ${pwdStrength.cls}`}>
                                                    {pwdStrength.label}
                                                </span>
                                            </div>
                                        )}
                                        {fieldError("password") && (
                                            <div className="field-error" role="alert">
                                                <ErrorIcon />
                                                {fieldError("password")}
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                                        <div className="form-control-wrap">
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                placeholder="Re-enter password"
                                                className={`form-input form-input-password${fieldError("confirmPassword") ? " has-error" : ""}`}
                                                value={formik.values.confirmPassword}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            <button
                                                type="button"
                                                className="toggle-password"
                                                onClick={() => setShowConfirmPassword((v) => !v)}
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            >
                                                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                                            </button>
                                        </div>
                                        {fieldError("confirmPassword") && (
                                            <div className="field-error" role="alert">
                                                <ErrorIcon />
                                                {fieldError("confirmPassword")}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Terms */}
                                <div className="terms-row">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        name="terms"
                                        checked={formik.values.terms}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    <label htmlFor="terms">
                                        I agree to the{" "}
                                        <a href="#">Terms of Service</a> and{" "}
                                        <a href="#">Privacy Policy</a>
                                        {fieldError("terms") && (
                                            <span style={{ display: "block", color: "var(--error)", fontWeight: 600, fontSize: "0.75rem", marginTop: 4 }}>
                                                {fieldError("terms")}
                                            </span>
                                        )}
                                    </label>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="btn-register"
                                    disabled={formik.isSubmitting}


                                >
                                    {formik.isSubmitting ? (
                                        <>
                                            <span className="spinner" />
                                            Creating Account…
                                        </>
                                    ) : (
                                        "Create My Account — It's Free"
                                    )}
                                </button>
                            </form>

                            <p className="login-cta">
                                Already have an account?{" "}
                                <Link to="/login">Sign in</Link>
                            </p>
                        </>
                    )}
                </main>
            </div>
        </>
    );
}
