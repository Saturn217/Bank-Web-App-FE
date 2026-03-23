import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { getTokenData } from "../auth/auth";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar";
import Topbar from "../components/Dashboard/Topbar";
import PageLoader from "../components/PageLoader";

/* ─── Styles ──────────────────────────────────────────────────── */
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy: #1b3a6b; --navy-dark: #122850; --blue: #2563eb;
    --green: #16a34a; --red: #ef4444; --amber: #d97706;
    --text: #1e293b; --muted: #64748b; --border: #e2e8f0;
    --bg: #f1f5f9; --white: #ffffff; --sidebar-w: 240px;
  }
  body { font-family: 'DM Sans', sans-serif; color: var(--text); background: var(--bg); overflow-x: hidden; }

  .dash-layout { display: flex; min-height: 100vh; overflow-x: hidden; }
  .dash-main   { flex: 1; margin-left: var(--sidebar-w); display: flex; flex-direction: column; min-width: 0; transition: margin-left .3s; }
  .dash-content { padding: 28px 32px 56px; flex: 1; }

  /* sidebar, topbar — same shared styles as Dashboard */
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

  /* ── Transfer page ── */
  .transfer-page { max-width: 560px; margin: 0 auto; }
  .transfer-page-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem; font-weight: 700; color: var(--navy);
    margin-bottom: 6px;
  }
  .transfer-page-sub { font-size: .85rem; color: var(--muted); margin-bottom: 24px; }

  /* Balance pill */
  .transfer-balance-pill {
    display: inline-flex; align-items: center; gap: 16px;
    background: linear-gradient(135deg, var(--navy) 0%, #1e4db7 60%, var(--blue) 100%);
    color: white; padding: 12px 20px; border-radius: 16px;
    font-size: .82rem; font-weight: 500;
    margin-bottom: 24px;
    box-shadow: 0 4px 16px rgba(27,58,107,.3);
  }
  .transfer-balance-pill-icon { display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,.15); flex-shrink:0; }
  .transfer-balance-pill-info { display:flex; flex-direction:column; gap:2px; }
  .transfer-balance-pill-name { font-size:.82rem; font-weight:600; opacity:.85; }
  .transfer-balance-pill-acct { font-size:.72rem; opacity:.6; letter-spacing:.04em; }
  .transfer-balance-pill-divider { width:1px; height:32px; background:rgba(255,255,255,.2); flex-shrink:0; }
  .transfer-balance-pill-bal { display:flex; flex-direction:column; gap:2px; }
  .transfer-balance-pill-bal-label { font-size:.68rem; opacity:.6; text-transform:uppercase; letter-spacing:.06em; }
  .transfer-balance-pill-bal-value { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; }

  /* Card */
  .transfer-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 28px;
    box-shadow: 0 4px 20px rgba(0,0,0,.05);
  }

  /* Form */
  .txf-group { margin-bottom: 20px; }
  .txf-label {
    display: block; font-size: .8rem; font-weight: 700;
    color: var(--navy); text-transform: uppercase;
    letter-spacing: .06em; margin-bottom: 7px;
  }
  .txf-input-wrap { position: relative; }
  .txf-input {
    width: 100%; padding: 13px 16px; border: 1.5px solid var(--border);
    border-radius: 10px; font-family: 'DM Sans', sans-serif;
    font-size: .95rem; color: var(--text); background: #f8fafc;
    transition: border-color .2s, box-shadow .2s; outline: none;
  }
  .txf-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(37,99,235,.1); background: white; }
  .txf-input.error { border-color: var(--red) !important; box-shadow: 0 0 0 3px rgba(239,68,68,.1) !important; }
  .txf-input.success { border-color: var(--green) !important; box-shadow: 0 0 0 3px rgba(22,163,74,.1) !important; }
  .txf-prefix {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    font-size: 1rem; font-weight: 700; color: var(--muted);
    pointer-events: none;
  }
  .txf-input.has-prefix { padding-left: 32px; }

  /* PIN dots — used inside the confirmation modal */
  .pin-input-wrap { display: flex; gap: 10px; justify-content: center; }
  .pin-digit {
    width: 52px; height: 52px; flex-shrink: 0;
    text-align: center; font-size: 1.4rem;
    font-weight: 700; letter-spacing: .05em;
    border: 1.5px solid var(--border); border-radius: 10px;
    background: #f8fafc; font-family: 'DM Sans', sans-serif;
    color: var(--navy); transition: border-color .2s, box-shadow .2s;
    outline: none;
  }
  .pin-digit:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(37,99,235,.1); background: white; }
  .pin-digit.error { border-color: var(--red); box-shadow: 0 0 0 3px rgba(239,68,68,.1); }
  .txf-modal-pin-section { padding: 0 28px 4px; }
  .txf-modal-pin-label { font-size: .78rem; font-weight: 700; color: var(--navy); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px; text-align: center; }
  .txf-modal-error { margin: 10px 28px 0; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 9px; padding: 10px 14px; font-size: .82rem; font-weight: 600; text-align: center; }

  /* Account verified badge */
  .txf-verified {
    display: flex; align-items: center; gap: 6px;
    font-size: .82rem; font-weight: 600; color: var(--green);
    margin-top: 6px;
  }
  .txf-error-msg { font-size: .8rem; color: var(--red); margin-top: 5px; font-weight: 500; }
  .txf-hint      { font-size: .78rem; color: var(--muted); margin-top: 5px; }

  /* Submit button */
  .transfer-submit-btn {
    width: 100%; padding: 15px;
    background: linear-gradient(135deg, var(--navy), var(--blue));
    color: white; border: none; border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 700;
    cursor: pointer; transition: opacity .2s, transform .18s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-top: 6px;
    box-shadow: 0 4px 16px rgba(27,58,107,.3);
  }
  .transfer-submit-btn:hover:not(:disabled) { opacity: .92; transform: translateY(-2px); }
  .transfer-submit-btn:active:not(:disabled) { transform: scale(.98); }
  .transfer-submit-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }

  /* ── Confirmation Modal ── */
  .txf-modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,.5);
    backdrop-filter: blur(4px); z-index: 9999;
    display: flex; align-items: center; justify-content: center; padding: 16px;
    animation: txfFadeIn .2s ease;
  }
  @keyframes txfFadeIn { from{opacity:0} to{opacity:1} }
  .txf-modal {
    background: white; border-radius: 20px; width: 100%; max-width: 420px;
    box-shadow: 0 24px 72px rgba(0,0,0,.22); overflow: hidden;
    animation: txfSlideUp .25s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes txfSlideUp { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  .txf-modal-header {
    background: linear-gradient(135deg, var(--navy) 0%, var(--blue) 100%);
    padding: 28px; text-align: center; color: white;
  }
  .txf-modal-icon {
    width: 60px; height: 60px; border-radius: 50%;
    background: rgba(255,255,255,.15); display: flex;
    align-items: center; justify-content: center; margin: 0 auto 12px;
    font-size: 1.6rem;
  }
  .txf-modal-title { font-family:'Playfair Display',serif; font-size: 1.3rem; font-weight: 700; }
  .txf-modal-subtitle { font-size: .85rem; opacity: .75; margin-top: 4px; }
  .txf-modal-body { padding: 24px 28px; }
  .txf-modal-row {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 11px 0; border-bottom: 1px solid #f1f5f9; gap: 12px;
  }
  .txf-modal-row:last-of-type { border-bottom: none; }
  .txf-modal-lbl { font-size: .82rem; color: var(--muted); }
  .txf-modal-val { font-size: .9rem; font-weight: 700; color: var(--text); text-align: right; }
  .txf-modal-val.red { color: var(--red); font-family:'Playfair Display',serif; font-size: 1.1rem; }
  .txf-modal-footer { padding: 0 28px 24px; display: flex; gap: 10px; }
  .txf-modal-cancel {
    flex: 1; padding: 13px; border: 1.5px solid var(--border);
    border-radius: 10px; background: white; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 600;
    color: var(--text); transition: all .18s;
  }
  .txf-modal-cancel:hover { border-color: var(--navy); }
  .txf-modal-confirm {
    flex: 1.6; padding: 13px;
    background: linear-gradient(135deg, var(--navy), var(--blue));
    color: white; border: none; border-radius: 10px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 700;
    transition: opacity .18s, transform .18s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .txf-modal-confirm:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
  .txf-modal-confirm:disabled { opacity: .6; cursor: not-allowed; }

  /* ── Success card ── */
  .txf-success-card {
    background: white; border: 1px solid var(--border); border-radius: 18px;
    padding: 40px 28px; text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,.05);
  }
  .txf-success-icon {
    width: 72px; height: 72px; border-radius: 50%;
    background: #f0fdf4; display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px; font-size: 2rem; color: var(--green);
  }
  .txf-success-title { font-family:'Playfair Display',serif; font-size: 1.5rem; color: var(--navy); font-weight: 700; margin-bottom: 6px; }
  .txf-success-sub { font-size: .88rem; color: var(--muted); margin-bottom: 24px; }
  .txf-success-amount { font-family:'Playfair Display',serif; font-size: 2rem; font-weight: 700; color: var(--green); margin-bottom: 4px; }
  .txf-success-to { font-size: .88rem; color: var(--muted); margin-bottom: 28px; }
  .txf-success-btn {
    padding: 13px 32px; background: var(--navy); color: white;
    border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif;
    font-size: .9rem; font-weight: 700; cursor: pointer; transition: background .18s;
  }
  .txf-success-btn:hover { background: var(--navy-dark); }

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

const API = "http://localhost:9000/api/v1";
const fmt = (n) => "₦" + Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ── Spinner ── */
function Spin() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>
            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
    );
}

/* ─────────────────────────────────────────────────────────────── */
export default function Transfer() {
    const navigate = useNavigate();
    const cookies = new Cookies();
    const token = cookies.get("token");

  const { roles: userRole } = getTokenData();

    /* ── user data (balance + name) ── */
    const [userData, setUserData] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    /* ── form state ── */
    const [amount, setAmount] = useState("");
    const [accNum, setAccNum] = useState("");
    const [note, setNote] = useState("");

    /* ── modal PIN state ── */
    const [modalPin, setModalPin] = useState(["", "", "", ""]);
    const modalPinRefs = [useRef(), useRef(), useRef(), useRef()];
    const [modalError, setModalError] = useState("");

    /* ── verification ── */
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(null);  // { fullName } | false | null
    const [accError, setAccError] = useState("");

    /* ── submission ── */
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [success, setSuccess] = useState(null); // transfer data on success

    const handleLogout = () => { cookies.remove("token", { path: "/" }); navigate("/login"); };

    /* ── Fetch logged-in user's balance ── */
    useEffect(() => {
        axios.get(`${API}/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setUserData(r.data.data))
            .catch(e => { if (e?.response?.status === 401) handleLogout(); })
            .finally(() => setLoading(false));
    }, []);

    /* ── Live account verification ── */
    const verifyTimer = useRef(null);
    const handleAccNumChange = (val) => {
        setAccNum(val);
        setVerified(null);
        setAccError("");
        clearTimeout(verifyTimer.current);
        if (val.length === 10) {
            // Block self-transfer immediately — no API call needed
            if (userData?.accountNumber && val === userData.accountNumber) {
                setVerified(false);
                setAccError("You cannot transfer to your own account.");
                return;
            }
            setVerifying(true);
            verifyTimer.current = setTimeout(async () => {
                try {
                    const r = await axios.get(`${API}/account-holder/`, { params: { accountNumber: val } });
                    if (r.data.found) setVerified({ fullName: r.data.fullName });
                    else { setVerified(false); setAccError("Account number not found"); }
                } catch {
                    setAccError("Could not verify account — try again");
                } finally {
                    setVerifying(false);
                }
            }, 600);
        }
    };

    /* ── Modal PIN input handling ── */
    const handleModalPinKey = (e, idx) => {
        const val = e.target.value.replace(/\D/g, "").slice(-1);
        const next = [...modalPin];
        next[idx] = val;
        setModalPin(next);
        setModalError("");
        if (val && idx < 3) modalPinRefs[idx + 1].current?.focus();
    };
    const handleModalPinKeyDown = (e, idx) => {
        if (e.key === "Backspace" && !modalPin[idx] && idx > 0) modalPinRefs[idx - 1].current?.focus();
    };
    const modalPinValue = modalPin.join("");

    /* ── Validation before showing modal ── */
    const handleReview = () => {
        setFormError("");
        const amt = parseFloat(amount);
        if (!amount || isNaN(amt) || amt <= 0) return setFormError("Please enter a valid amount.");
        if (amt < 1000) return setFormError("Minimum transfer amount is ₦1,000.");
        if (userData && amt > userData.totalBalance) return setFormError("Insufficient balance.");
        if (accNum.length !== 10) return setFormError("Account number must be 10 digits.");
        if (userData?.accountNumber && accNum === userData.accountNumber)
            return setFormError("You cannot transfer to your own account.");
        if (!verified) return setFormError("Please wait for account verification.");
        // Reset modal PIN & error each time modal opens
        setModalPin(["", "", "", ""]);
        setModalError("");
        setShowModal(true);
    };

    /* ── Submit transfer ── */
    const handleConfirm = async () => {
        if (modalPinValue.length !== 4) { setModalError("Please enter your 4-digit PIN."); return; }
        setSubmitting(true);
        setModalError("");
        try {
            const r = await axios.post(
                `${API}/transfer`,
                { receiverAccount: accNum, amount: parseFloat(amount), note, transactionPin: modalPinValue },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess(r.data.data);
            setShowModal(false);
        } catch (e) {
            // Keep modal open — show error inside it
            const msg = e?.response?.data?.error || e?.response?.data?.message || "Transfer failed. Please try again.";
            setModalError(msg);
            // Clear PIN so user can re-enter
            setModalPin(["", "", "", ""]);
            setTimeout(() => modalPinRefs[0].current?.focus(), 50);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setAmount(""); setAccNum(""); setNote(""); setModalPin(["", "", "", ""]); setVerified(null); setSuccess(null); setFormError(""); setModalError("");
    };

    /* ── Render success ── */
    if (success) {
        return (
            <>
                <style>{style}</style>
                <div className="sidebar-overlay-bg" style={{ display: mobileOpen ? "block" : "none" }} onClick={() => setMobileOpen(false)} />
                <div className="dash-layout">
                    <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout}
                        onNavigate={(key) => navigate("/" + key)} active="transfer" />
                    <main className="dash-main">
                        <Topbar onMenuToggle={() => setMobileOpen(o => !o)} />
                        <div className="dash-content">
                            <div className="transfer-page">
                                <div className="txf-success-card">
                                    <div className="txf-success-icon">✓</div>
                                    <div className="txf-success-title">Transfer Successful!</div>
                                    <div className="txf-success-sub">Your transfer has been processed.</div>
                                    <div className="txf-success-amount">-{fmt(success.amount)}</div>
                                    <div className="txf-success-to">To {success.receiver?.fullName} ({success.receiver?.accountNumber})</div>
                                    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                                        <button className="txf-success-btn" onClick={resetForm}>New Transfer</button>
                                        <button className="txf-success-btn" style={{ background: "#e2e8f0", color: "#1e293b" }} onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </>
        );
    }

    /* ── Loading ── */
    if (loading) return (
        <>
            <style>{style}</style>
            <div className="sidebar-overlay-bg" style={{ display: mobileOpen ? "block" : "none" }} onClick={() => setMobileOpen(false)} />
            <div className="dash-layout">
                <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout}
                    onNavigate={key => navigate("/" + key)} active="transfer" />
                <main className="dash-main">
                    <Topbar onMenuToggle={() => setMobileOpen(o => !o)} />
                    <div className="dash-content">
                        <PageLoader message="Loading transfer page…" />
                    </div>
                </main>
            </div>
        </>
    );

    /* ── Main render ── */
    return (
        <>
            <style>{style}</style>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="txf-modal-backdrop" onClick={(e) => e.target === e.currentTarget && !submitting && setShowModal(false)}>
                    <div className="txf-modal">
                        <div className="txf-modal-header">
                            <div className="txf-modal-icon">⇄</div>
                            <div className="txf-modal-title">Confirm Transfer</div>
                            <div className="txf-modal-subtitle">Review details and enter your PIN</div>
                        </div>
                        <div className="txf-modal-body">
                            <div className="txf-modal-row">
                                <span className="txf-modal-lbl">Amount</span>
                                <span className="txf-modal-val red">-{fmt(amount)}</span>
                            </div>
                            <div className="txf-modal-row">
                                <span className="txf-modal-lbl">Recipient</span>
                                <span className="txf-modal-val">{verified?.fullName}</span>
                            </div>
                            <div className="txf-modal-row">
                                <span className="txf-modal-lbl">Account No.</span>
                                <span className="txf-modal-val">{accNum}</span>
                            </div>
                            {note.trim() && (
                                <div className="txf-modal-row">
                                    <span className="txf-modal-lbl">Note</span>
                                    <span className="txf-modal-val" style={{ fontStyle: "italic", fontWeight: 500 }}>{note}</span>
                                </div>
                            )}
                            <div className="txf-modal-row">
                                <span className="txf-modal-lbl">Balance After</span>
                                <span className="txf-modal-val">{fmt((userData?.totalBalance || 0) - parseFloat(amount || 0))}</span>
                            </div>
                        </div>

                        {/* PIN entry inside modal */}
                        <div className="txf-modal-pin-section">
                            <div className="txf-modal-pin-label">Enter Transaction PIN</div>
                            <div className="pin-input-wrap">
                                {modalPin.map((d, i) => (
                                    <input
                                        key={i}
                                        ref={modalPinRefs[i]}
                                        className={`pin-digit${modalError ? " error" : ""}`}
                                        type="password" inputMode="numeric"
                                        maxLength={1} value={d}
                                        onChange={(e) => handleModalPinKey(e, i)}
                                        onKeyDown={(e) => handleModalPinKeyDown(e, i)}
                                        id={`modal-pin-digit-${i}`}
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Modal-level error */}
                        {modalError && <div className="txf-modal-error">{modalError}</div>}

                        <div className="txf-modal-footer" style={{ marginTop: 16 }}>
                            <button className="txf-modal-cancel" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                            <button className="txf-modal-confirm" onClick={handleConfirm} disabled={submitting || modalPinValue.length !== 4}>
                                {submitting ? <><Spin /> Processing…</> : "✓ Confirm Transfer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="sidebar-overlay-bg" style={{ display: mobileOpen ? "block" : "none" }} onClick={() => setMobileOpen(false)} />

            <div className="dash-layout">
                <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout}
                    onNavigate={(key) => navigate("/" + key)} active="transfer" />

                <main className="dash-main">
                    <Topbar onMenuToggle={() => setMobileOpen(o => !o)} />

                    <div className="dash-content">
                        <div className="transfer-page">
                            <h1 className="transfer-page-title">Transfer Funds</h1>
                            <p className="transfer-page-sub">Send money securely to any Bank of Saturn account.</p>

                            {/* Account identity pill */}
                            <div className="transfer-balance-pill">
                                <div className="transfer-balance-pill-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <div className="transfer-balance-pill-info">
                                    <span className="transfer-balance-pill-name">{userData?.fullName || "—"}</span>
                                    <span className="transfer-balance-pill-acct">{userData?.accountNumber || "—"}</span>
                                </div>
                                <div className="transfer-balance-pill-divider" />
                                <div className="transfer-balance-pill-bal">
                                    <span className="transfer-balance-pill-bal-label">Available Balance</span>
                                    <span className="transfer-balance-pill-bal-value">{userData ? fmt(userData.totalBalance) : "—"}</span>
                                </div>
                            </div>

                            <div className="transfer-card">
                                {/* Amount */}
                                <div className="txf-group">
                                    <label className="txf-label">Amount</label>
                                    <div className="txf-input-wrap">
                                        <span className="txf-prefix">₦</span>
                                        <input
                                            id="transfer-amount"
                                            className="txf-input has-prefix"
                                            type="number" min="1000" placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                    </div>
                                    <p className="txf-hint">Minimum transfer: ₦1,000</p>
                                </div>

                                {/* Receiver Account */}
                                <div className="txf-group">
                                    <label className="txf-label">Receiver Account Number</label>
                                    <input
                                        id="transfer-account"
                                        className={`txf-input${accError ? " error" : verified ? " success" : ""}`}
                                        type="text" inputMode="numeric" maxLength={10}
                                        placeholder="10-digit account number"
                                        value={accNum}
                                        onChange={(e) => handleAccNumChange(e.target.value.replace(/\D/g, ""))}
                                    />
                                    {verifying && (
                                        <p className="txf-hint" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <Spin /> Verifying account…
                                        </p>
                                    )}
                                    {verified && (
                                        <p className="txf-verified">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            {verified.fullName}
                                        </p>
                                    )}
                                    {accError && <p className="txf-error-msg">{accError}</p>}
                                </div>

                                {/* Note (optional) */}
                                <div className="txf-group">
                                    <label className="txf-label">Note <span style={{ fontWeight: 400, textTransform: "none", fontSize: ".75rem", color: "var(--muted)" }}>(optional)</span></label>
                                    <input
                                        id="transfer-note"
                                        className="txf-input"
                                        type="text" maxLength={100}
                                        placeholder="e.g. Rent for March"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </div>


                                {/* Error */}
                                {formError && (
                                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 10, padding: "11px 14px", fontSize: ".85rem", fontWeight: 600, marginBottom: 16 }}>
                                        {formError}
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    id="transfer-submit"
                                    className="transfer-submit-btn"
                                    onClick={handleReview}
                                    disabled={verifying || submitting}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                                        <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
                                    </svg>
                                    Review Transfer
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
