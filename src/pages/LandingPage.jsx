import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import logoImg from "../assets/logo.png";

/* ── Feature-card SVG icons ── */
const IconCreditCard = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const IconPiggyBank = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 9a7 7 0 1 0-13.6 2.3L4 20h16l-1.4-8.7A7 7 0 0 0 19 9z" />
    <path d="M12 2v2" />
    <path d="M9 20v2" />
    <path d="M15 20v2" />
    <circle cx="12" cy="9" r="1" fill="currentColor" />
  </svg>
);
const IconBolt = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconShield = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconBarChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);
const IconArrows = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);
/* Checkmark SVG for dashboard-preview checklist */
const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');

  :root {
    --navy: #1b3a6b;
    --navy-dark: #122850;
    --blue: #2563eb;
    --green: #16a34a;
    --text: #1e293b;
    --muted: #64748b;
    --border: #e2e8f0;
    --bg: #f8fafc;
    --white: #ffffff;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    color: var(--text);
    background: var(--white);
    overflow-x: hidden;
  }

  /* NAV */
  .nav-bar {
    background: var(--white);
    border-bottom: 1px solid var(--border);
    padding: 0 40px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 1000;
    transition: box-shadow 0.2s;
  }
  .nav-bar.scrolled { box-shadow: 0 2px 16px rgba(0,0,0,0.08); }

  .nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    color: var(--navy);
    text-decoration: none;
    flex-shrink: 0;
  }
  .nav-logo-icon {
    width: 36px; height: 36px;
    background: var(--navy);
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    overflow: visible;
  }

  .nav-links {
    display: flex;
    gap: 28px;
    list-style: none;
    margin: 0;
  }
  .nav-links a {
    text-decoration: none;
    color: var(--muted);
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 0.2s;
    white-space: nowrap;
  }
  .nav-links a:hover { color: var(--navy); }

  .nav-cta { display: flex; gap: 10px; align-items: center; }

  .btn-outline-navy {
    border: 1.5px solid var(--navy);
    background: transparent;
    color: var(--navy);
    padding: 7px 18px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
    white-space: nowrap;
  }
  .btn-outline-navy:hover { background: var(--navy); color: white; }

  .btn-navy {
    background: var(--navy);
    color: white;
    border: none;
    padding: 7px 18px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.2s;
    font-family: 'DM Sans', sans-serif;
    white-space: nowrap;
  }
  .btn-navy:hover { background: var(--navy-dark); }

  /* Hamburger */
  .hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
    background: none;
    border: none;
    padding: 4px;
    z-index: 1100;
  }
  .hamburger span {
    display: block;
    width: 24px; height: 2px;
    background: var(--navy);
    border-radius: 2px;
    transition: all 0.3s;
    transform-origin: center;
  }
  .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .hamburger.open span:nth-child(2) { opacity: 0; }
  .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  /* Mobile drawer */
  .mobile-menu {
    display: none;
    position: fixed;
    top: 64px; left: 0; right: 0;
    background: var(--white);
    border-bottom: 1px solid var(--border);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    z-index: 999;
    padding: 24px 24px 28px;
    flex-direction: column;
    animation: slideDown 0.25s ease;
  }
  .mobile-menu.open { display: flex; }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .mobile-menu a {
    text-decoration: none;
    color: var(--text);
    font-size: 1rem;
    font-weight: 500;
    padding: 14px 0;
    border-bottom: 1px solid var(--border);
    display: block;
    transition: color 0.2s;
  }
  .mobile-menu a:last-of-type { border-bottom: none; }
  .mobile-menu a:hover { color: var(--navy); }
  .mobile-menu-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
  }
  .mobile-menu-actions button { width: 100%; padding: 12px; font-size: 0.95rem; }

  /* HERO */
  .hero {
    background: var(--navy);
    color: white;
    padding: 80px 40px 70px;
  }
  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.18);
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 0.78rem;
    font-weight: 500;
    margin-bottom: 20px;
    color: rgba(255,255,255,0.9);
  }
  .hero-badge-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #4ade80;
    animation: pulse 2s infinite;
    flex-shrink: 0;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 5vw, 3.5rem);
    line-height: 1.15;
    margin-bottom: 18px;
    color: white;
  }
  .hero h1 span { color: #60a5fa; }
  .hero-desc {
    font-size: 1rem;
    line-height: 1.7;
    color: rgba(255,255,255,0.72);
    max-width: 500px;
    margin-bottom: 32px;
  }
  .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }

  .btn-hero-primary {
    background: white;
    color: var(--navy);
    border: none;
    padding: 12px 26px;
    border-radius: 7px;
    font-weight: 700;
    font-size: 0.92rem;
    cursor: pointer;
    transition: background 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-hero-primary:hover { background: #eef2ff; }

  .btn-hero-ghost {
    background: transparent;
    color: white;
    border: 1.5px solid rgba(255,255,255,0.38);
    padding: 12px 26px;
    border-radius: 7px;
    font-weight: 600;
    font-size: 0.92rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-hero-ghost:hover { border-color: white; background: rgba(255,255,255,0.08); }

  /* Account preview card */
  .hero-card {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 16px;
    padding: 24px;
  }
  .hero-card-stat {
    flex: 1;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 12px 14px;
    min-width: 0;
  }
  .hero-card-stat-label { font-size: 0.68rem; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
  .hero-card-stat-val   { font-size: 0.9rem; font-weight: 700; }
  .hero-txn-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 9px 0;
    font-size: 0.83rem;
  }
  .hero-txn-row + .hero-txn-row { border-top: 1px solid rgba(255,255,255,0.08); }

  /* STATS */
  .stats-strip {
    background: var(--navy-dark);
    padding: 28px 40px;
  }
  .stats-inner {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 28px 40px;
  }
  .stat-item { text-align: center; }
  .stat-val {
    font-size: 1.7rem;
    font-weight: 700;
    color: white;
    font-family: 'Playfair Display', serif;
  }
  .stat-label {
    font-size: 0.72rem;
    color: rgba(255,255,255,0.5);
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
  .stat-divider {
    width: 1px; height: 38px;
    background: rgba(255,255,255,0.15);
  }

  /* SECTIONS */
  .section { padding: 80px 40px; }

  .section-label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.13em;
    color: var(--blue);
    margin-bottom: 10px;
  }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.7rem, 3.5vw, 2.5rem);
    color: var(--navy);
    line-height: 1.2;
    margin-bottom: 14px;
  }
  .section-sub {
    color: var(--muted);
    font-size: 0.97rem;
    line-height: 1.7;
    max-width: 520px;
  }

  /* FEATURE CARDS */
  .feature-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 26px;
    height: 100%;
    transition: box-shadow 0.25s, transform 0.25s;
  }
  .feature-card:hover { box-shadow: 0 8px 32px rgba(27,58,107,0.1); transform: translateY(-3px); }
  .feature-icon {
    width: 46px; height: 46px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px;
    font-size: 1.35rem;
  }
  .feature-icon.blue   { background: #eff6ff; }
  .feature-icon.green  { background: #f0fdf4; }
  .feature-icon.orange { background: #fff7ed; }
  .feature-icon.purple { background: #f5f3ff; }
  .feature-card h5 { font-weight: 700; color: var(--navy); margin-bottom: 7px; font-size: 0.97rem; }
  .feature-card p  { color: var(--muted); font-size: 0.85rem; line-height: 1.65; margin: 0; }

  /* PREVIEW */
  .preview-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 16px 48px rgba(27,58,107,0.12);
  }
  .preview-header {
    background: var(--navy);
    padding: 12px 20px;
    display: flex; align-items: center; gap: 7px;
  }
  .preview-dot { width: 10px; height: 10px; border-radius: 50%; }
  .preview-body { padding: 20px; }
  .mini-stat {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 9px;
    padding: 13px;
    border-top: 3px solid var(--navy);
  }
  .mini-stat.blue-top  { border-top-color: var(--blue); }
  .mini-stat.green-top { border-top-color: var(--green); }
  .mini-stat label { font-size: 0.65rem; color: var(--muted); display: block; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.05em; }
  .mini-stat .amount { font-size: 1rem; font-weight: 700; color: var(--navy); font-family: 'Playfair Display', serif; }
  .mini-txn {
    display: flex; justify-content: space-between; align-items: center;
    padding: 9px 0;
    border-bottom: 1px solid var(--border);
    font-size: 0.82rem;
  }
  .mini-txn:last-child { border-bottom: none; }
  .txn-desc { color: var(--text); font-weight: 500; }
  .txn-sub  { color: var(--muted); font-size: 0.7rem; }
  .txn-credit { color: var(--green); font-weight: 700; white-space: nowrap; }
  .txn-debit  { color: #ef4444; font-weight: 700; white-space: nowrap; }

  /* CHECKLIST */
  .check-item { display: flex; gap: 12px; margin-bottom: 14px; }
  .check-icon {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: #f0fdf4;
    border: 1.5px solid #86efac;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; color: var(--green); font-weight: 700;
    margin-top: 2px;
  }
  .check-item-title { font-weight: 600; color: var(--navy); font-size: 0.88rem; }
  .check-item-desc  { color: var(--muted); font-size: 0.78rem; }

  /* STEPS */
  .step-row { display: flex; gap: 16px; align-items: flex-start; }
  .step-num {
    width: 46px; height: 46px;
    background: var(--navy); color: white;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 1rem;
    flex-shrink: 0;
    font-family: 'Playfair Display', serif;
  }
  .step-connector {
    width: 2px; height: 36px;
    background: var(--border);
    margin: 5px 0 5px 22px;
  }
  .step-text h6 { font-weight: 700; color: var(--navy); margin-bottom: 4px; font-size: 0.95rem; }
  .step-text p  { color: var(--muted); font-size: 0.85rem; margin: 0; line-height: 1.6; }

  /* CTA */
  .cta-section {
    background: var(--navy);
    color: white;
    padding: 80px 40px;
    text-align: center;
  }
  .cta-section h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.9rem, 4vw, 2.9rem);
    color: white; margin-bottom: 14px;
  }
  .cta-section p {
    color: rgba(255,255,255,0.68);
    font-size: 0.97rem;
    margin-bottom: 32px;
    max-width: 460px;
    margin-left: auto; margin-right: auto;
  }
  .cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

  /* FOOTER */
  footer {
    background: var(--navy-dark);
    color: rgba(255,255,255,0.58);
    padding: 52px 40px 28px;
  }
  .footer-logo { font-family: 'Playfair Display', serif; font-size: 1.3rem; color: white; margin-bottom: 10px; }
  .footer-heading { color: white; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px; }
  .footer-links { list-style: none; padding: 0; margin: 0; }
  .footer-links li { margin-bottom: 8px; }
  .footer-links a { color: rgba(255,255,255,0.52); text-decoration: none; font-size: 0.85rem; transition: color 0.2s; }
  .footer-links a:hover { color: white; }
  .footer-bottom {
    border-top: 1px solid rgba(255,255,255,0.1);
    margin-top: 40px; padding-top: 20px;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.78rem; flex-wrap: wrap; gap: 8px;
  }

  /* ══════════════════════════════════════
     RESPONSIVE BREAKPOINTS
  ══════════════════════════════════════ */

  /* Tablet ≤ 991px */
  @media (max-width: 991px) {
    .nav-bar    { padding: 0 24px; }
    .nav-links  { display: none; }
    .nav-cta    { display: none; }
    .hamburger  { display: flex; }

    .hero       { padding: 60px 24px 52px; }
    .hero-card  { margin-top: 40px; }

    .stats-strip   { padding: 24px 20px; }
    .stat-divider  { display: none; }

    .section       { padding: 60px 24px; }
    .cta-section   { padding: 60px 24px; }
    footer         { padding: 44px 24px 24px; }
  }

  /* Mobile ≤ 767px */
  @media (max-width: 767px) {
    .nav-bar      { padding: 0 16px; height: 58px; }
    .mobile-menu  { top: 58px; padding: 20px 16px 24px; }

    .hero         { padding: 44px 16px 40px; }
    .hero-desc    { font-size: 0.93rem; }
    .hero-actions { flex-direction: column; }
    .btn-hero-primary,
    .btn-hero-ghost { width: 100%; text-align: center; padding: 14px; }
    .hero-card    { padding: 18px; margin-top: 32px; }

    .stats-inner  { gap: 14px 20px; }
    .stat-val     { font-size: 1.35rem; }
    .stat-label   { font-size: 0.68rem; }

    .section         { padding: 44px 16px; }
    .feature-card    { padding: 20px; }

    .preview-body    { padding: 14px; }
    .mini-stat       { padding: 10px; }
    .mini-stat .amount { font-size: 0.82rem; }
    .mini-stat label   { font-size: 0.6rem; }

    .cta-section     { padding: 52px 16px; }
    .cta-actions     { flex-direction: column; align-items: stretch; }
    .cta-actions button { width: 100%; text-align: center; padding: 14px; }

    footer           { padding: 36px 16px 20px; }
    .footer-bottom   { flex-direction: column; text-align: center; gap: 6px; }
  }

  /* Small mobile ≤ 480px */
  @media (max-width: 480px) {
    .hero-card { display: none; }
    .hero h1   { font-size: 1.85rem; }
    .preview-header span { display: none; }
  }
`;

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 991) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <style>{style}</style>

      {/* ── NAV ── */}
      <nav className={`nav-bar${scrolled ? " scrolled" : ""}`}>
        <a href="#" className="nav-logo">
          <div className="nav-logo-icon">
            <img src={logoImg} alt="Bank of Saturn" width="22" height="22" style={{ objectFit: "contain", borderRadius: "5px" }} />
          </div>
          Bank of Saturn
        </a>

        <ul className="nav-links">
          <li><a href="#personal">Personal</a></li>
          <li><a href="#personal">Business</a></li>
          <li><a href="#personal">Savings</a></li>
          <li><a href="#">About</a></li>
        </ul>

        <div className="nav-cta">
          <button className="btn-outline-navy" onClick={() => navigate("/login")}>Log In</button>
          <button className="btn-navy" onClick={() => navigate("/register")}>Open Account</button>
        </div>

        <button
          className={`hamburger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle navigation"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <a href="#" onClick={closeMenu}>Personal</a>
        <a href="#" onClick={closeMenu}>Business</a>
        <a href="#" onClick={closeMenu}>Savings</a>
        <a href="#" onClick={closeMenu}>About</a>
        <div className="mobile-menu-actions">
          <button className="btn-outline-navy" onClick={() => { closeMenu(); navigate("/login"); }}>Log In</button>
          <button className="btn-navy" onClick={() => { closeMenu(); navigate("/register"); }}>Open Account</button>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="container-fluid p-0">
          <div className="row align-items-center g-0">

            <div className="col-lg-6 col-12">
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                Trusted by 250,000+ SQI Students
              </div>
              <h1>
                Banking That<br />
                Works <span>For You</span>,<br />
                Not Against You.
              </h1>
              <p className="hero-desc">
                Manage your money, pay bills, save smarter, and track your finances all in one secure place. Open your account in minutes.
              </p>
              <div className="hero-actions">
                <button className="btn-hero-primary" onClick={() => navigate("/register")}>Get Started — It's Free</button>
                <button className="btn-hero-ghost">See How It Works</button>
              </div>
            </div>

            <div className="col-lg-6 col-12 ps-lg-5">
              <div className="hero-card">
                <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Total Balance</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.7rem,5vw,2.2rem)", color: "white", fontWeight: 700, marginBottom: 18 }}>
                  ₦450,500.00
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "Savings", val: "₦200,000", color: "#60a5fa" },
                    { label: "Interest", val: "+₦5,000", color: "#4ade80" },
                    { label: "Bills", val: "₦18,000", color: "#fbbf24" },
                  ].map(s => (
                    <div className="hero-card-stat" key={s.label}>
                      <div className="hero-card-stat-label">{s.label}</div>
                      <div className="hero-card-stat-val" style={{ color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>
                {[
                  { desc: "Salary Credit", date: "Apr 18", amt: "+₦120,000", credit: true },
                  { desc: "DSTV Subscription", date: "Apr 22", amt: "-₦7,500", credit: false },
                  { desc: "Interest Credit", date: "Apr 24", amt: "+₦5,000", credit: true },
                ].map((t, i) => (
                  <div className="hero-txn-row" key={i}>
                    <div>
                      <div style={{ color: "rgba(255,255,255,0.88)", fontWeight: 500, fontSize: "0.82rem" }}>{t.desc}</div>
                      <div style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.7rem" }}>{t.date}</div>
                    </div>
                    <div style={{ color: t.credit ? "#4ade80" : "#f87171", fontWeight: 700, fontSize: "0.84rem" }}>{t.amt}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="stats-strip">
        <div className="container">
          <div className="stats-inner">
            {[
              { val: "₦2.4B+", label: "Total Deposits" },
              { val: "250K+", label: "Active Customers" },
              { val: "99.9%", label: "Uptime SLA" },
              { val: "CBN", label: "Licensed & Regulated" },
            ].map((s, i, arr) => (
              <div key={s.label} style={{ display: "contents" }}>
                <div className="stat-item">
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
                {i < arr.length - 1 && <div className="stat-divider" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="section" id="section" style={{ background: "var(--white)" }}>
        <div className="container">
          <div className="text-center mb-5">
            <div className="section-label">Features</div>
            <h2 className="section-title">Everything you need,<br />nothing you don't.</h2>
            <p className="section-sub mx-auto">
              A full-featured banking experience designed for everyday Nigerians — simple, fast, and reliable.
            </p>
          </div>
          <div className="row g-4">
            {[
              { icon: <IconCreditCard />, cls: "blue", title: "Smart Account Management", desc: "View your balance, manage accounts, and track every transaction in real time." },
              { icon: <IconPiggyBank />, cls: "green", title: "High-Yield Savings", desc: "Earn 0.5% monthly on your savings automatically, with no minimum balance." },
              { icon: <IconBolt />, cls: "orange", title: "Instant Bill Payments", desc: "Pay electricity, internet, cable TV, and water bills in seconds — no queues." },
              { icon: <IconShield />, cls: "purple", title: "Bank-Grade Security", desc: "Multi-layer security with 2FA, and real-time fraud alerts." },
              { icon: <IconBarChart />, cls: "blue", title: "Spending Insights", desc: "Understand where your money goes with visual breakdowns and monthly summaries." },
              { icon: <IconArrows />, cls: "green", title: "Instant Transfers", desc: "Send money to any BOS account instantly, 24/7, with zero hidden fees." },
            ].map(f => (
              <div className="col-lg-4 col-sm-6 col-12" key={f.title}>
                <div className="feature-card">
                  <div className={`feature-icon ${f.cls}`}>{f.icon}</div>
                  <h5>{f.title}</h5>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="section" style={{ background: "var(--bg)" }}>
        <div className="container">
          <div className="row align-items-center g-5">

            <div className="col-lg-5 col-12">
              <div className="section-label">Dashboard</div>
              <h2 className="section-title">Your finances at a glance.</h2>
              <p className="section-sub mb-4">
                A clean, intuitive dashboard gives you full visibility over your account — balances, transactions, savings, and bills — all on one screen.
              </p>
              {[
                { title: "Real-time balance updates", desc: "Always know exactly how much you have." },
                { title: "One-tap bill payments", desc: "Electricity, internet, DSTV — done in seconds." },
                { title: "Savings tracker", desc: "Watch your savings and interest grow every month." },
              ].map((item, i) => (
                <div className="check-item" key={i}>
                  <div className="check-icon"><IconCheck /></div>
                  <div>
                    <div className="check-item-title">{item.title}</div>
                    <div className="check-item-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="col-lg-7 col-12">
              <div className="preview-card">
                <div className="preview-header">
                  <div className="preview-dot" style={{ background: "#ef4444" }} />
                  <div className="preview-dot" style={{ background: "#fbbf24" }} />
                  <div className="preview-dot" style={{ background: "#4ade80" }} />
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.7rem", marginLeft: 8 }}>
                    dashboard.bankofsaturn.ng
                  </span>
                </div>
                <div className="preview-body">
                  <div className="row g-2 mb-3">
                    {[
                      { label: "Total Balance", val: "₦450,500", cls: "", green: false },
                      { label: "Savings", val: "₦200,000", cls: "blue-top", green: false },
                      { label: "Interest", val: "+₦5,000", cls: "green-top", green: true },
                    ].map(s => (
                      <div className="col-4" key={s.label}>
                        <div className={`mini-stat ${s.cls}`}>
                          <label>{s.label}</label>
                          <div className="amount" style={s.green ? { color: "var(--green)" } : {}}>{s.val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--navy)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Recent Transactions
                  </div>
                  {[
                    { desc: "Monthly Interest Payout", sub: "Apr 24 · Interest Credit", amt: "+₦5,000", credit: true },
                    { desc: "DSTV Subscription", sub: "Apr 22 · Bill Payment", amt: "-₦7,500", credit: false },
                    { desc: "Salary Credit", sub: "Apr 18 · Deposit", amt: "+₦120,000", credit: true },
                    { desc: "Electricity Bill", sub: "Apr 15 · Bill Payment", amt: "-₦10,500", credit: false },
                  ].map((t, i) => (
                    <div className="mini-txn" key={i}>
                      <div style={{ minWidth: 0, flex: 1, marginRight: 12 }}>
                        <div className="txn-desc">{t.desc}</div>
                        <div className="txn-sub">{t.sub}</div>
                      </div>
                      <div className={t.credit ? "txn-credit" : "txn-debit"}>{t.amt}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section" id="personal" style={{ background: "var(--white)" }}>
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-5 col-12">
              <div className="section-label">How It Works</div>
              <h2 className="section-title">Up and running<br />in under 5 minutes.</h2>
              <p className="section-sub">
                No paperwork. No branch visits. Just open your phone and get started.
              </p>
            </div>
            <div className="col-lg-6 offset-lg-1 col-12">
              {[
                { n: "1", title: "Create your account", desc: "Sign up with your valid email, and basic details. Fully verified and secure." },
                { n: "2", title: "Fund your wallet", desc: "Transfer from any Nigerian bank or deposit cash at partner agents near you." },
                { n: "3", title: "Start banking", desc: "Pay bills, save, send money — everything is ready from your dashboard instantly." },
              ].map((step, i) => (
                <div key={i}>
                  <div className="step-row">
                    <div className="step-num">{step.n}</div>
                    <div className="step-text pt-2">
                      <h6>{step.title}</h6>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                  {i < 2 && <div className="step-connector" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to take control<br />of your money?</h2>
          <p>Join 250,000+ Nigerians already banking smarter with Bank of Saturn.</p>
          <div className="cta-actions">
            <button className="btn-hero-primary" onClick={() => navigate("/register")}>Open a Free Account</button>
            <button className="btn-hero-ghost">Talk to Support</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="container">
          <div className="row g-4 mb-2">
            <div className="col-lg-4 col-md-12">
              <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="14" fill="white" fillOpacity="0.95" />
                  <ellipse cx="32" cy="28" rx="12" ry="2.5" fill="white" fillOpacity="0.3" />
                  <ellipse cx="32" cy="35" rx="10" ry="2" fill="white" fillOpacity="0.2" />
                  <ellipse cx="32" cy="32" rx="28" ry="8" transform="rotate(-20 32 32)" stroke="white" strokeWidth="3" strokeOpacity="0.85" fill="none" />
                  <ellipse cx="32" cy="32" rx="24" ry="6" transform="rotate(-20 32 32)" stroke="white" strokeWidth="1.5" strokeOpacity="0.35" fill="none" />
                </svg>
                Bank of Saturn
              </div>
              <p style={{ fontSize: "0.83rem", lineHeight: 1.75, maxWidth: 300 }}>
                A CBN-licensed digital bank providing secure, accessible financial services to Nigerians everywhere.
              </p>
            </div>
            <div className="col-lg-2 col-md-3 col-6">
              <div className="footer-heading">Products</div>
              <ul className="footer-links">
                <li><a href="#">Personal Banking</a></li>
                <li><a href="#">Business Account</a></li>
                <li><a href="#">Savings Plans</a></li>
                <li><a href="#">Bill Payments</a></li>
              </ul>
            </div>
            <div className="col-lg-2 col-md-3 col-6">
              <div className="footer-heading">Company</div>
              <ul className="footer-links">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>
            <div className="col-lg-2 col-md-3 col-6">
              <div className="footer-heading">Support</div>
              <ul className="footer-links">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Security</a></li>
                <li><a href="#">Report Fraud</a></li>
              </ul>
            </div>
            <div className="col-lg-2 col-md-3 col-6">
              <div className="footer-heading">Legal</div>
              <ul className="footer-links">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Use</a></li>
                <li><a href="#">Cookie Policy</a></li>
                <li><a href="#">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2024 Bank of Saturn Ltd. Licensed by the Central Bank of Nigeria.</span>
            <span>NDIC Insured · SSL Secured</span>
          </div>
        </div>
      </footer>
    </>
  );
}