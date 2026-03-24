import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { getTokenData } from "../auth/auth";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar";
import Topbar from "../components/Dashboard/Topbar";
import PageLoader from "../components/PageLoader";

/* ─── Styles ──────────────────────────────────────────────── */
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy: #1b3a6b; --navy-dark: #122850; --blue: #2563eb;
    --green: #16a34a; --green-dark: #15803d; --green-light: #dcfce7;
    --red: #ef4444; --amber: #d97706;
    --text: #1e293b; --muted: #64748b; --border: #e2e8f0;
    --bg: #f1f5f9; --white: #ffffff; --sidebar-w: 240px;
  }
  body { font-family: 'DM Sans', sans-serif; color: var(--text); background: var(--bg); overflow-x: hidden; }

  .dash-layout { display: flex; min-height: 100vh; overflow-x: hidden; }
  .dash-main   { flex: 1; margin-left: var(--sidebar-w); display: flex; flex-direction: column; min-width: 0; transition: margin-left .3s; }
  .dash-content { padding: 28px 32px 56px; flex: 1; }

  .bos-sidebar { width: var(--sidebar-w); background: var(--navy); position: fixed; top:0; left:0; bottom:0; display:flex; flex-direction:column; z-index:300; transition:transform .3s cubic-bezier(.4,0,.2,1); overflow-y:auto; }
  .bos-sidebar.mobile-open { transform:translateX(0)!important; box-shadow:4px 0 24px rgba(0,0,0,.3); }
  .sidebar-logo { display:flex; align-items:center; gap:10px; padding:22px 20px 18px; border-bottom:1px solid rgba(255,255,255,.1); flex-shrink:0; }
  .sidebar-logo-text { font-family:'Playfair Display',serif; font-size:.92rem; color:white; line-height:1.2; font-weight:700; }
  .sidebar-nav { flex:1; padding:14px 12px; display:flex; flex-direction:column; gap:3px; overflow-y:auto; }
  .sidebar-item { display:flex; align-items:center; gap:11px; padding:10px 12px; border-radius:9px; border:none; background:transparent; color:rgba(255,255,255,.6); font-family:'DM Sans',sans-serif; font-size:.85rem; font-weight:500; cursor:pointer; transition:all .18s; text-align:left; width:100%; text-decoration:none; }
  .sidebar-item:hover { background:rgba(255,255,255,.08); color:rgba(255,255,255,.9); }
  .sidebar-item.active { background:rgba(255,255,255,.14); color:white; font-weight:600; }
  .sidebar-item-icon { display:flex; align-items:center; flex-shrink:0; }
  .sidebar-user-footer { position:relative; border-top:1px solid rgba(255,255,255,.1); padding:10px 12px; flex-shrink:0; }
  .sidebar-user-pill { display:flex; align-items:center; gap:10px; width:100%; padding:9px 10px; border-radius:10px; border:none; background:rgba(255,255,255,.06); cursor:pointer; transition:background .18s; text-align:left; }
  .sidebar-user-pill:hover { background:rgba(255,255,255,.12); }
  .sidebar-user-avatar { width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,.18); border:1.5px solid rgba(255,255,255,.25); color:white; font-size:.75rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .sidebar-user-info { display:flex; flex-direction:column; min-width:0; flex:1; }
  .sidebar-user-name { color:white; font-size:.85rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .sidebar-user-role { color:rgba(255,255,255,.4); font-size:.68rem; margin-top:1px; }
  .sidebar-dropdown { position:absolute; bottom:calc(100% - 10px); left:12px; right:12px; background:#1e2d50; border:1px solid rgba(255,255,255,.12); border-radius:12px; padding:8px; box-shadow:0 -8px 28px rgba(0,0,0,.35); z-index:400; animation:dropUp .15s ease; }
  @keyframes dropUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .sidebar-drop-header { display:flex; align-items:center; gap:10px; padding:8px 10px 10px; }
  .sidebar-drop-avatar { width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,.15); color:white; font-size:.8rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .sidebar-drop-name { font-size:.85rem; font-weight:700; color:white; }
  .sidebar-drop-role { font-size:.7rem; color:rgba(255,255,255,.45); margin-top:1px; }
  .sidebar-drop-divider { height:1px; background:rgba(255,255,255,.1); margin:4px 0; }
  .sidebar-drop-item { display:flex; align-items:center; gap:10px; width:100%; padding:9px 12px; border-radius:8px; border:none; background:none; font-family:'DM Sans',sans-serif; font-size:.84rem; font-weight:500; color:rgba(255,255,255,.75); cursor:pointer; transition:background .15s; text-align:left; }
  .sidebar-drop-item:hover { background:rgba(255,255,255,.08); color:white; }
  .sidebar-drop-logout { color:#f87171; }
  .sidebar-drop-logout:hover { background:rgba(239,68,68,.12)!important; color:#fca5a5; }
  .sidebar-overlay-bg { display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:250; }
  .bos-topbar { height:68px; background:var(--white); border-bottom:1px solid var(--border); padding:0 32px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:100; box-shadow:0 1px 8px rgba(0,0,0,.05); flex-shrink:0; }
  .topbar-left { display:flex; align-items:center; gap:14px; min-width:0; }
  .topbar-hamburger { display:none; background:none; border:none; color:var(--navy); cursor:pointer; padding:4px; border-radius:6px; flex-shrink:0; }
  .topbar-hamburger:hover { background:var(--bg); }
  .topbar-greeting { min-width:0; }
  .topbar-welcome { font-family:'Playfair Display',serif; font-size:1.2rem; color:var(--navy); font-weight:700; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .topbar-date { font-size:.78rem; color:var(--muted); margin-top:1px; white-space:nowrap; }
  .topbar-right { display:flex; align-items:center; gap:12px; flex-shrink:0; }
  .topbar-bell { position:relative; background:var(--bg); border:1px solid var(--border); border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--muted); transition:all .18s; flex-shrink:0; }
  .topbar-bell:hover { border-color:var(--navy); color:var(--navy); }
  .bell-badge { position:absolute; top:-3px; right:-3px; background:var(--red); color:white; font-size:.58rem; font-weight:700; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; }
  .topbar-user { display:flex; align-items:center; gap:8px; cursor:pointer; padding:5px 10px 5px 5px; border-radius:30px; border:1px solid var(--border); background:var(--bg); transition:all .18s; flex-shrink:0; }
  .topbar-user:hover { border-color:var(--navy); }
  .topbar-avatar { width:30px; height:30px; border-radius:50%; background:var(--navy); color:white; font-size:.72rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .topbar-name { font-size:.85rem; font-weight:600; color:var(--text); }
  .topbar-dropdown { position:absolute; top:calc(100% + 8px); right:32px; background:white; border:1px solid var(--border); border-radius:12px; padding:8px; box-shadow:0 8px 24px rgba(0,0,0,.1); z-index:200; min-width:180px; animation:dropDownIn .15s ease; }
  @keyframes dropDownIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .topbar-drop-item { display:flex; align-items:center; gap:10px; width:100%; padding:9px 12px; border-radius:8px; border:none; background:none; font-family:'DM Sans',sans-serif; font-size:.84rem; font-weight:500; color:var(--text); cursor:pointer; transition:background .15s; text-align:left; }
  .topbar-drop-item:hover { background:var(--bg); }
  .topbar-drop-logout { color:var(--red); }
  .topbar-drop-logout:hover { background:#fef2f2; }
  .topbar-drop-divider { height:1px; background:var(--border); margin:4px 0; }

  /* skeleton */
  .skeleton { background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── Deposit page ── */
  .deposit-page { max-width: 520px; margin: 0 auto; }
  .deposit-page-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem; font-weight: 700; color: var(--navy);
    margin-bottom: 6px;
  }
  .deposit-page-sub { font-size: .85rem; color: var(--muted); margin-bottom: 24px; }

  /* Balance pill */
  .deposit-balance-pill {
    display: inline-flex; align-items: center; gap: 16px;
    background: linear-gradient(135deg, var(--green-dark) 0%, #16a34a 60%, #22c55e 100%);
    color: white; padding: 12px 20px; border-radius: 16px;
    font-size: .82rem; font-weight: 500;
    margin-bottom: 24px;
    box-shadow: 0 4px 16px rgba(22,163,74,.3);
  }
  .deposit-balance-pill-icon { display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,.15); flex-shrink:0; }
  .deposit-balance-pill-info { display:flex; flex-direction:column; gap:2px; }
  .deposit-balance-pill-name { font-size:.82rem; font-weight:600; opacity:.85; }
  .deposit-balance-pill-acct { font-size:.72rem; opacity:.6; letter-spacing:.04em; }
  .deposit-balance-pill-divider { width:1px; height:32px; background:rgba(255,255,255,.2); flex-shrink:0; }
  .deposit-balance-pill-bal { display:flex; flex-direction:column; gap:2px; }
  .deposit-balance-pill-bal-label { font-size:.68rem; opacity:.6; text-transform:uppercase; letter-spacing:.06em; }
  .deposit-balance-pill-bal-value { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; }

  /* Card */
  .deposit-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 28px;
    box-shadow: 0 4px 20px rgba(0,0,0,.05);
  }

  /* Form */
  .dpf-group { margin-bottom: 20px; }
  .dpf-label {
    display: block; font-size: .8rem; font-weight: 700;
    color: var(--navy); text-transform: uppercase;
    letter-spacing: .06em; margin-bottom: 7px;
  }
  .dpf-input-wrap { position: relative; }
  .dpf-input {
    width: 100%; padding: 13px 16px; border: 1.5px solid var(--border);
    border-radius: 10px; font-family: 'DM Sans', sans-serif;
    font-size: .95rem; color: var(--text); background: #f8fafc;
    transition: border-color .2s, box-shadow .2s; outline: none;
  }
  .dpf-input:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(22,163,74,.1); background: white; }
  .dpf-input.error { border-color: var(--red) !important; box-shadow: 0 0 0 3px rgba(239,68,68,.1) !important; }
  .dpf-prefix {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    font-size: 1rem; font-weight: 700; color: var(--muted);
    pointer-events: none;
  }
  .dpf-input.has-prefix { padding-left: 32px; }
  .dpf-hint { font-size: .78rem; color: var(--muted); margin-top: 5px; }
  .dpf-error-msg { font-size: .8rem; color: var(--red); margin-top: 5px; font-weight: 500; }

  /* Info box */
  .dpf-info-box {
    display: flex; align-items: flex-start; gap: 10px;
    background: #f0fdf4; border: 1px solid #bbf7d0;
    border-radius: 10px; padding: 12px 14px;
    font-size: .82rem; color: #166534; margin-bottom: 20px;
  }

  /* Error box */
  .dpf-error-box {
    display: flex; flex-direction: column; gap: 10px;
    background: #fef2f2; border: 1px solid #fecaca;
    border-radius: 10px; padding: 14px;
    font-size: .82rem; color: #991b1b; margin-bottom: 20px;
  }
  .dpf-error-msg-main { font-weight: 600; display: flex; align-items: center; gap: 8px; }
  .dpf-error-msg-icon { width: 18px; height: 18px; flex-shrink: 0; }
  .dpf-error-details { display: flex; flex-direction: column; gap: 6px; padding-left: 26px; font-size: .78rem; }
  .dpf-error-detail-row { display: flex; justify-content: space-between; gap: 12px; padding: 5px 8px; background: rgba(239,68,68,.08); border-radius: 6px; }
  .dpf-error-detail-label { color: #7f1d1d; font-weight: 500; }
  .dpf-error-detail-value { color: #991b1b; font-weight: 700; font-family: 'Playfair Display', serif; }

  /* Quick amount chips */
  .dpf-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .dpf-chip {
    padding: 6px 14px; border: 1.5px solid var(--border);
    border-radius: 20px; background: #f8fafc;
    font-family: 'DM Sans', sans-serif; font-size: .8rem;
    font-weight: 600; color: var(--muted); cursor: pointer;
    transition: all .15s;
  }
  .dpf-chip:hover { border-color: var(--green); color: var(--green); background: #f0fdf4; }
  .dpf-chip.selected { border-color: var(--green); color: white; background: var(--green); }

  /* Submit button */
  .deposit-submit-btn {
    width: 100%; padding: 15px;
    background: linear-gradient(135deg, var(--green-dark), var(--green));
    color: white; border: none; border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 700;
    cursor: pointer; transition: opacity .2s, transform .18s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-top: 6px;
    box-shadow: 0 4px 16px rgba(22,163,74,.35);
  }
  .deposit-submit-btn:hover:not(:disabled) { opacity: .92; transform: translateY(-2px); }
  .deposit-submit-btn:active:not(:disabled) { transform: scale(.98); }
  .deposit-submit-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }

  /* ── Confirmation Modal ── */
  .dpf-modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,.5);
    backdrop-filter: blur(4px); z-index: 9999;
    display: flex; align-items: center; justify-content: center; padding: 16px;
    animation: dpfFadeIn .2s ease;
  }
  @keyframes dpfFadeIn { from{opacity:0} to{opacity:1} }
  .dpf-modal {
    background: white; border-radius: 20px; width: 100%; max-width: 420px;
    box-shadow: 0 24px 72px rgba(0,0,0,.22); overflow: hidden;
    animation: dpfSlideUp .25s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes dpfSlideUp { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  .dpf-modal-header {
    background: linear-gradient(135deg, var(--green-dark) 0%, var(--green) 100%);
    padding: 28px; text-align: center; color: white;
  }
  .dpf-modal-icon {
    width: 60px; height: 60px; border-radius: 50%;
    background: rgba(255,255,255,.15); display: flex;
    align-items: center; justify-content: center; margin: 0 auto 12px;
    font-size: 1.6rem;
  }
  .dpf-modal-title { font-family:'Playfair Display',serif; font-size: 1.3rem; font-weight: 700; }
  .dpf-modal-subtitle { font-size: .85rem; opacity: .75; margin-top: 4px; }
  .dpf-modal-body { padding: 24px 28px; }
  .dpf-modal-row {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 11px 0; border-bottom: 1px solid #f1f5f9; gap: 12px;
  }
  .dpf-modal-row:last-of-type { border-bottom: none; }
  .dpf-modal-lbl { font-size: .82rem; color: var(--muted); }
  .dpf-modal-val { font-size: .9rem; font-weight: 700; color: var(--text); text-align: right; }
  .dpf-modal-val.green { color: var(--green); font-family:'Playfair Display',serif; font-size: 1.1rem; }
  .dpf-modal-footer { padding: 0 28px 24px; display: flex; gap: 10px; }
  .dpf-modal-cancel {
    flex: 1; padding: 13px; border: 1.5px solid var(--border);
    border-radius: 10px; background: white; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 600;
    color: var(--text); transition: all .18s;
  }
  .dpf-modal-cancel:hover { border-color: var(--green); }
  .dpf-modal-confirm {
    flex: 1.6; padding: 13px;
    background: linear-gradient(135deg, var(--green-dark), var(--green));
    color: white; border: none; border-radius: 10px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 700;
    transition: opacity .18s, transform .18s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .dpf-modal-confirm:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
  .dpf-modal-confirm:disabled { opacity: .6; cursor: not-allowed; }

  /* ── Success card ── */
  .dpf-success-card {
    background: white; border: 1px solid var(--border); border-radius: 18px;
    padding: 40px 28px; text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,.05);
  }
  .dpf-success-icon {
    width: 72px; height: 72px; border-radius: 50%;
    background: #f0fdf4; display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px; font-size: 2rem; color: var(--green);
  }
  .dpf-success-title { font-family:'Playfair Display',serif; font-size: 1.5rem; color: var(--navy); font-weight: 700; margin-bottom: 6px; }
  .dpf-success-sub { font-size: .88rem; color: var(--muted); margin-bottom: 24px; }
  .dpf-success-amount { font-family:'Playfair Display',serif; font-size: 2rem; font-weight: 700; color: var(--green); margin-bottom: 28px; }
  .dpf-success-btn {
    padding: 13px 32px; background: var(--navy); color: white;
    border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif;
    font-size: .9rem; font-weight: 700; cursor: pointer; transition: background .18s;
  }
  .dpf-success-btn:hover { background: var(--navy-dark); }

  /* Responsive */
  @media (max-width: 768px) {
    .bos-sidebar { transform: translateX(-100%); width: 280px; }
    .dash-main { margin-left: 0; }
    .sidebar-overlay-bg { display: block; }
    .topbar-hamburger { display: flex; }
    .bos-topbar { padding: 0 16px; height: 60px; }
    .topbar-name { display: none; }
    .dash-content { padding: 14px 14px 40px; }
  }
`;

const API = "https://bank-web-app-eight.vercel.app/api/v1";
const fmt = (n) => "₦" + Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const QUICK_AMOUNTS = [500, 1000, 5000, 10000, 50000];

function Spin() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>
            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
    );
}

export default function Deposit() {
    const navigate = useNavigate();
    const cookies = new Cookies();
    const token = cookies.get("token");

  const { roles: userRole } = getTokenData();

    const [userData, setUserData] = useState(null);
    const [depositStatus, setDepositStatus] = useState(null); // { dailyDepositLimit, depositedToday }
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    /* ── form ── */
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");

    /* ── submission ── */
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [formErrorDetails, setFormErrorDetails] = useState(null); // { depositedToday, remaining, limit }
    const [success, setSuccess] = useState(null);

    const handleLogout = () => { cookies.remove("token", { path: "/" }); navigate("/login"); };

    /* ── Fetch user/balance ── */
    useEffect(() => {
        axios.get(`${API}/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setUserData(r.data.data))
            .catch(e => { if (e?.response?.status === 401) handleLogout(); })
            .finally(() => setLoading(false));
    }, []);

    /* ── Validate before modal ── */
    const handleReview = () => {
        setFormError("");
        const amt = parseFloat(amount);
        if (!amount || isNaN(amt) || amt <= 0) return setFormError("Please enter a valid amount.");
        if (amt < 100) return setFormError("Minimum deposit amount is ₦100.");
        // Check daily deposit limit if available
        if (userData?.dailyDepositLimit && userData?.depositedToday !== undefined) {
            const remaining = userData.dailyDepositLimit - userData.depositedToday;
            if (amt > remaining) {
                return setFormError(`Deposit amount exceeds daily limit. Remaining: ₦${remaining.toLocaleString("en-NG")}`);
            }
        }
        setShowModal(true);
    };

    /* ── Submit deposit ── */
    const handleConfirm = async () => {
        setSubmitting(true);
        setFormError("");
        setFormErrorDetails(null);
        try {
            const r = await axios.post(
                `${API}/deposit`,
                { amount: parseFloat(amount), note },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess(r.data);
            setShowModal(false);
            // Refetch user data to update deposit limits
            axios.get(`${API}/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => setUserData(r.data.data))
                .catch(() => {}); // ignore errors
        } catch (e) {
            setShowModal(false);
            const errorData = e?.response?.data;
            const msg = errorData?.message || errorData?.error || "Deposit failed. Please try again.";
            setFormError(msg);

            // Handle daily limit error with remaining amount
            if (e?.response?.status === 403 && errorData?.remaining !== undefined) {
                setFormErrorDetails({
                    depositedToday: errorData.depositedToday || 0,
                    remaining: errorData.remaining || 0,
                    dailyLimit: (errorData.depositedToday || 0) + (errorData.remaining || 0),
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setAmount(""); setNote(""); setSuccess(null); setFormError(""); setFormErrorDetails(null);
    };

    /* ── Success view ── */
    if (success) {
        const depositedAmt = parseFloat(amount);
        return (
            <>
                <style>{style}</style>
                <div className="sidebar-overlay-bg" style={{ display: mobileOpen ? "block" : "none" }} onClick={() => setMobileOpen(false)} />
                <div className="dash-layout">
                    <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout}
                        onNavigate={(key) => navigate("/" + key)} active="deposit" />
                    <main className="dash-main">
                        <Topbar onMenuToggle={() => setMobileOpen(o => !o)} />
                        <div className="dash-content">
                            <div className="deposit-page">
                                <div className="dpf-success-card">
                                    <div className="dpf-success-icon">↑</div>
                                    <div className="dpf-success-title">Deposit Successful!</div>
                                    <div className="dpf-success-sub">Your funds have been added to your account.</div>
                                    <div className="dpf-success-amount">+{fmt(depositedAmt)}</div>
                                    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                                        <button className="dpf-success-btn" onClick={resetForm}>New Deposit</button>
                                        <button className="dpf-success-btn" style={{ background: "#e2e8f0", color: "#1e293b" }} onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </>
        );
    }

    /* ── Main render ── */

    if (loading) return (
        <>
            <style>{style}</style>
            <div className="sidebar-overlay-bg" style={{ display: mobileOpen ? "block" : "none" }} onClick={() => setMobileOpen(false)} />
            <div className="dash-layout">
                <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout}
                    onNavigate={key => navigate("/" + key)} active="deposit" />
                <main className="dash-main">
                    <Topbar onMenuToggle={() => setMobileOpen(o => !o)} />
                    <div className="dash-content">
                        <PageLoader message="Loading deposit page…" />
                    </div>
                </main>
            </div>
        </>
    );
    return (
        <>
            <style>{style}</style>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="dpf-modal-backdrop" onClick={(e) => e.target === e.currentTarget && !submitting && setShowModal(false)}>
                    <div className="dpf-modal">
                        <div className="dpf-modal-header">
                            <div className="dpf-modal-icon">↑</div>
                            <div className="dpf-modal-title">Confirm Deposit</div>
                            <div className="dpf-modal-subtitle">Please review before confirming</div>
                        </div>
                        <div className="dpf-modal-body">
                            <div className="dpf-modal-row">
                                <span className="dpf-modal-lbl">Amount</span>
                                <span className="dpf-modal-val green">+{fmt(amount)}</span>
                            </div>
                            <div className="dpf-modal-row">
                                <span className="dpf-modal-lbl">To Account</span>
                                <span className="dpf-modal-val">{userData?.accountNumber || "—"}</span>
                            </div>
                            {note.trim() && (
                                <div className="dpf-modal-row">
                                    <span className="dpf-modal-lbl">Note</span>
                                    <span className="dpf-modal-val" style={{ fontStyle: "italic", fontWeight: 500 }}>{note}</span>
                                </div>
                            )}
                            <div className="dpf-modal-row">
                                <span className="dpf-modal-lbl">Balance After</span>
                                <span className="dpf-modal-val">{fmt((userData?.totalBalance || 0) + parseFloat(amount || 0))}</span>
                            </div>
                        </div>
                        <div className="dpf-modal-footer">
                            <button className="dpf-modal-cancel" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                            <button className="dpf-modal-confirm" onClick={handleConfirm} disabled={submitting}>
                                {submitting ? <><Spin /> Processing…</> : "✓ Confirm Deposit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="sidebar-overlay-bg" style={{ display: mobileOpen ? "block" : "none" }} onClick={() => setMobileOpen(false)} />

            <div className="dash-layout">
                <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout}
                    onNavigate={(key) => navigate("/" + key)} active="deposit" />

                <main className="dash-main">
                    <Topbar onMenuToggle={() => setMobileOpen(o => !o)} />

                    <div className="dash-content">
                        <div className="deposit-page">
                            <h1 className="deposit-page-title">Deposit Funds</h1>
                            <p className="deposit-page-sub">Add money to your Bank of Saturn account instantly.</p>

                            {/* Account identity pill */}
                            <div className="deposit-balance-pill">
                                <div className="deposit-balance-pill-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <div className="deposit-balance-pill-info">
                                    <span className="deposit-balance-pill-name">{userData?.fullName || "—"}</span>
                                    <span className="deposit-balance-pill-acct">{userData?.accountNumber || "—"}</span>
                                </div>
                                <div className="deposit-balance-pill-divider" />
                                <div className="deposit-balance-pill-bal">
                                    <span className="deposit-balance-pill-bal-label">Current Balance</span>
                                    <span className="deposit-balance-pill-bal-value">{userData ? fmt(userData.totalBalance) : "—"}</span>
                                </div>
                            </div>

                            <div className="deposit-card">
                                {/* Info box */}
                                <div className="dpf-info-box">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <span>Deposits are credited instantly. Minimum deposit is <strong>₦100</strong>. {userData?.dailyDepositLimit ? `Daily limit: ₦${((userData.dailyDepositLimit - (userData.depositedToday || 0))).toLocaleString("en-NG")}` : 'Daily limit: ₦1,000,000'}. No PIN required.</span>
                                </div>

                                {/* Amount */}
                                <div className="dpf-group">
                                    <label className="dpf-label">Amount</label>
                                    <div className="dpf-input-wrap">
                                        <span className="dpf-prefix">₦</span>
                                        <input
                                            id="deposit-amount"
                                            className={`dpf-input has-prefix${formError && (!amount || parseFloat(amount) < 100) ? " error" : ""}`}
                                            type="number" min="100" placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => { setAmount(e.target.value); setFormError(""); }}
                                        />
                                    </div>
                                    <p className="dpf-hint">Minimum deposit: ₦100</p>

                                    {/* Quick amount chips */}
                                    <div className="dpf-chips">
                                        {QUICK_AMOUNTS.map(v => (
                                            <button
                                                key={v}
                                                type="button"
                                                className={`dpf-chip${parseFloat(amount) === v ? " selected" : ""}`}
                                                onClick={() => { setAmount(String(v)); setFormError(""); }}
                                            >
                                                {fmt(v).replace(".00", "")}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Note */}
                                <div className="dpf-group">
                                    <label className="dpf-label">Note <span style={{ fontWeight: 400, textTransform: "none", fontSize: ".75rem", color: "var(--muted)" }}>(optional)</span></label>
                                    <input
                                        id="deposit-note"
                                        className="dpf-input"
                                        type="text" maxLength={100}
                                        placeholder="e.g. Monthly savings"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </div>

                                {/* Error */}
                                {formError && (
                                    <div className="dpf-error-box">
                                        <div className="dpf-error-msg-main">
                                            <svg className="dpf-error-msg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                            {formError}
                                        </div>
                                        
                                        {/* Daily limit details */}
                                        {formErrorDetails && (
                                            <div className="dpf-error-details">
                                                <div className="dpf-error-detail-row">
                                                    <span className="dpf-error-detail-label">Deposited Today:</span>
                                                    <span className="dpf-error-detail-value">{fmt(formErrorDetails.depositedToday)}</span>
                                                </div>
                                                <div className="dpf-error-detail-row">
                                                    <span className="dpf-error-detail-label">Daily Limit:</span>
                                                    <span className="dpf-error-detail-value">{fmt(formErrorDetails.dailyLimit)}</span>
                                                </div>
                                                <div className="dpf-error-detail-row" style={{ background: "rgba(22,163,74,.08)" }}>
                                                    <span className="dpf-error-detail-label" style={{ color: "#166534" }}>Amount Remaining:</span>
                                                    <span className="dpf-error-detail-value" style={{ color: "#16a34a" }}>{fmt(formErrorDetails.remaining)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    id="deposit-submit"
                                    className="deposit-submit-btn"
                                    onClick={handleReview}
                                    disabled={submitting}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    Review Deposit
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
