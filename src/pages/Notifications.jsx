import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "universal-cookie";
import { getTokenData } from "../auth/auth";
import Sidebar from "../components/Dashboard/Sidebar";
import Topbar from "../components/Dashboard/Topbar";
import PageLoader from "../components/PageLoader";

const API = "https://bank-web-app-eight.vercel.app/api/v1";

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
  .skeleton { background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── Notifications page ── */
  .notif-page { max-width: 760px; margin: 0 auto; }
  .notif-page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; gap:12px; flex-wrap:wrap; }
  .notif-page-title { font-family:'Playfair Display',serif; font-size:1.5rem; font-weight:700; color:var(--navy); margin-bottom:4px; }
  .notif-page-sub { font-size:.84rem; color:var(--muted); }
  .notif-mark-all-btn { padding:9px 18px; background:var(--white); border:1.5px solid var(--border); border-radius:10px; font-family:'DM Sans',sans-serif; font-size:.82rem; font-weight:700; color:var(--navy); cursor:pointer; transition:all .18s; white-space:nowrap; flex-shrink:0; }
  .notif-mark-all-btn:hover { border-color:var(--navy); background:var(--bg); }
  .notif-mark-all-btn:disabled { opacity:.45; cursor:not-allowed; }
  .notif-controls { background:var(--white); border:1px solid var(--border); border-radius:14px; padding:14px 18px; display:flex; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
  .notif-filter-tabs { display:flex; gap:6px; flex-wrap:wrap; flex:1; }
  .notif-tab { padding:6px 14px; border-radius:20px; border:1.5px solid var(--border); background:var(--bg); font-family:'DM Sans',sans-serif; font-size:.78rem; font-weight:600; color:var(--muted); cursor:pointer; transition:all .15s; white-space:nowrap; }
  .notif-tab:hover { border-color:var(--navy); color:var(--navy); }
  .notif-tab.active { background:var(--navy); border-color:var(--navy); color:white; }
  .notif-unread-toggle { display:flex; align-items:center; gap:7px; font-family:'DM Sans',sans-serif; font-size:.82rem; font-weight:600; color:var(--muted); cursor:pointer; padding:7px 12px; border-radius:9px; border:1.5px solid var(--border); background:var(--bg); white-space:nowrap; transition:all .15s; }
  .notif-unread-toggle.active { border-color:var(--blue); color:var(--blue); background:#eff6ff; }
  .notif-card { background:var(--white); border:1px solid var(--border); border-radius:14px; overflow:hidden; }
  .notif-card-header { display:flex; align-items:center; justify-content:space-between; padding:14px 20px; border-bottom:1px solid var(--border); }
  .notif-card-title { font-size:.9rem; font-weight:700; color:var(--navy); }
  .notif-count-badge { background:var(--bg); border:1px solid var(--border); padding:3px 10px; border-radius:20px; font-size:.72rem; font-weight:700; color:var(--muted); }
  .notif-row { display:flex; align-items:flex-start; gap:14px; padding:16px 20px; border-bottom:1px solid var(--border); transition:background .15s; position:relative; }
  .notif-row:last-child { border-bottom:none; }
  .notif-row:hover { background:#f8fafc; }
  .notif-row.unread { background:#f0f7ff; cursor:pointer; }
  .notif-row.unread:hover { background:#e8f1fc; }
  .notif-row-icon { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:1rem; }
  .notif-row-body { flex:1; min-width:0; }
  .notif-row-title { font-size:.88rem; font-weight:600; color:var(--text); margin-bottom:3px; display:flex; align-items:center; gap:8px; }
  .notif-unread-dot { width:7px; height:7px; border-radius:50%; background:var(--blue); flex-shrink:0; }
  .notif-row-message { font-size:.82rem; color:var(--muted); line-height:1.5; }
  .notif-row-time { font-size:.72rem; color:var(--muted); margin-top:5px; }
  .notif-row-right { display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex-shrink:0; align-self:center; }
  .notif-row-amount { font-family:'Playfair Display',serif; font-size:.9rem; font-weight:700; white-space:nowrap; }
  .notif-row-amount.credit { color:var(--green); }
  .notif-row-amount.debit  { color:var(--red); }
  .notif-row-amount.neutral { color:#7c3aed; }
  .notif-mark-btn { font-size:.68rem; font-weight:600; color:var(--blue); background:none; border:none; cursor:pointer; padding:0; white-space:nowrap; font-family:'DM Sans',sans-serif; opacity:0; transition:opacity .15s; }
  .notif-row:hover .notif-mark-btn { opacity:1; }
  .notif-skel-row { display:flex; align-items:center; gap:14px; padding:16px 20px; border-bottom:1px solid var(--border); }
  .notif-skel-row:last-child { border-bottom:none; }
  .notif-empty { display:flex; flex-direction:column; align-items:center; gap:12px; padding:64px 24px; color:var(--muted); text-align:center; }
  .notif-empty-icon { width:64px; height:64px; border-radius:50%; background:var(--bg); display:flex; align-items:center; justify-content:center; font-size:1.8rem; margin-bottom:4px; }
  .notif-empty-title { font-weight:700; font-size:.95rem; color:var(--navy); }
  .notif-empty-sub { font-size:.82rem; max-width:260px; line-height:1.6; }
  .notif-pagination { display:flex; align-items:center; justify-content:space-between; padding:14px 20px; border-top:1px solid var(--border); gap:12px; flex-wrap:wrap; }
  .notif-page-info { font-size:.8rem; color:var(--muted); font-weight:500; }
  .notif-page-info strong { color:var(--navy); }
  .notif-page-btns { display:flex; align-items:center; gap:6px; }
  .notif-page-btn { min-width:34px; height:34px; padding:0 10px; border-radius:8px; border:1.5px solid var(--border); background:var(--white); font-family:'DM Sans',sans-serif; font-size:.82rem; font-weight:700; color:var(--text); cursor:pointer; transition:all .15s; display:flex; align-items:center; justify-content:center; }
  .notif-page-btn:hover:not(:disabled) { border-color:var(--navy); color:var(--navy); }
  .notif-page-btn.active { background:var(--navy); border-color:var(--navy); color:white; }
  .notif-page-btn:disabled { opacity:.38; cursor:not-allowed; }

  @media (max-width: 768px) {
    .bos-sidebar { transform: translateX(-100%); width: 280px; }
    .dash-main { margin-left: 0; }
    .sidebar-overlay-bg { display: block; }
    .topbar-hamburger { display: flex; }
    .bos-topbar { padding: 0 16px; height: 60px; }
    .topbar-name { display: none; }
    .dash-content { padding: 14px 14px 40px; }
    .notif-controls { gap: 8px; }
    .notif-tab { padding: 5px 10px; font-size: .72rem; }
    .notif-row { padding: 14px 16px; gap: 10px; }
    .notif-row-icon { width: 36px; height: 36px; }
    .notif-page-header { flex-direction: column; align-items: flex-start; }
  }
`;

const TYPE_CONFIG = {
  deposit:            { emoji: "↓", bg: "#f0fdf4", amountClass: "credit"  },
  withdrawal:         { emoji: "↑", bg: "#fef2f2", amountClass: "debit"   },
  transfer:           { emoji: "⇄", bg: "#eff6ff", amountClass: null       },
  transfer_sent:      { emoji: "↗", bg: "#fef2f2", amountClass: "debit"   },
  transfer_received:  { emoji: "↙", bg: "#f0fdf4", amountClass: "credit"  },
  bill_payment:       { emoji: "📄", bg: "#fffbeb", amountClass: "debit"   },
  savings_deposit:    { emoji: "🏦", bg: "#f0fdf4", amountClass: "debit"   },
  savings_withdrawal: { emoji: "↑", bg: "#fef2f2", amountClass: "credit"  },
  savings_interest:   { emoji: "✦", bg: "#f5f3ff", amountClass: "neutral" },
  system:             { emoji: "🔔", bg: "#f1f5f9", amountClass: null       },
  security:           { emoji: "🔒", bg: "#fff7ed", amountClass: null       },
};
const getConfig = (type = "") =>
  TYPE_CONFIG[type.toLowerCase()] || { emoji: "🔔", bg: "#f1f5f9", amountClass: null };

const FILTERS = [
  { label: "All",         value: "" },
  { label: "Transfers",   value: "transfer,transfer_sent,transfer_received" },
  { label: "Deposits",    value: "deposit" },
  { label: "Withdrawals", value: "withdrawal" },
  { label: "Bills",       value: "bill_payment" },
  { label: "Savings",     value: "savings_deposit,savings_interest,savings_withdrawal" },
];

const fmt = (n) => "₦" + Math.abs(Number(n || 0)).toLocaleString("en-NG", { minimumFractionDigits: 2 });

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
}

function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

function SkeletonRows({ n = 6 }) {
  return Array.from({ length: n }).map((_, i) => (
    <div className="notif-skel-row" key={i}>
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
        <div className="skeleton" style={{ height: 13, width: "60%" }} />
        <div className="skeleton" style={{ height: 11, width: "40%" }} />
        <div className="skeleton" style={{ height: 10, width: "20%" }} />
      </div>
      <div className="skeleton" style={{ height: 13, width: 70 }} />
    </div>
  ));
}

export default function Notifications() {
  const navigate = useNavigate();
  const cookies  = new Cookies();
  const token    = cookies.get("token");
  const { roles: userRole } = getTokenData();

  const [userData,    setUserData]    = useState(null);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [meta,        setMeta]        = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [initialLoad, setInitialLoad] = useState(true);
  const [loading,     setLoading]     = useState(true);
  const [markingAll,  setMarkingAll]  = useState(false);
  const [filter,      setFilter]      = useState("");
  const [unreadOnly,  setUnreadOnly]  = useState(false);
  const [page,        setPage]        = useState(1);
  const [limit,       setLimit]       = useState(10);
  const [error,       setError]       = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  const handleLogout = () => {
    new Cookies().remove("token", { path: "/" });
    navigate("/login");
  };

  // Fetch user name for sidebar/topbar
  useEffect(() => {
    axios.get(`${API}/dashboard`, { headers })
      .then(r => setUserData(r.data.data))
      .catch(e => { if (e?.response?.status === 401) handleLogout(); });
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit };
      if (filter)     params.type   = filter;
      if (unreadOnly) params.unread = "true";
      const r = await axios.get(`${API}/notifications`, { params, headers });
      setNotifications(r.data.data?.notifications || []);
      setMeta(r.data.data?.metadata || { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch (e) {
      if (e?.response?.status === 401) { handleLogout(); return; }
      setError(e?.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [page, filter, unreadOnly, limit]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
  useEffect(() => { setPage(1); }, [filter, unreadOnly, limit]);

  const markAsRead = async (notif) => {
    if (notif.isRead) return;
    setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
    try {
      await axios.patch(`${API}/notifications/${notif._id}/read`, {}, { headers });
    } catch {
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: false } : n));
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await axios.post(`${API}/notifications/mark-all-read`, {}, { headers });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {
      setError("Failed to mark all as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ── Loading (initial page load) ──
  if (initialLoad) return (
    <>
      <style>{style}</style>
      <div className="sidebar-overlay-bg" style={{ display: mobileOpen ? "block" : "none" }} onClick={() => setMobileOpen(false)} />
      <div className="dash-layout">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout}
          onNavigate={key => navigate("/" + key)} role={userRole} active="notifications" />
        <main className="dash-main">
          <Topbar onMenuToggle={() => setMobileOpen(o => !o)} />
          <div className="dash-content">
            <PageLoader message="Loading notifications…" />
          </div>
        </main>
      </div>
    </>
  );

  // ── Main render ──
  return (
    <>
      <style>{style}</style>

      <div className="sidebar-overlay-bg" style={{ display: mobileOpen ? "block" : "none" }} onClick={() => setMobileOpen(false)} />

      <div className="dash-layout">
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onLogout={handleLogout}
          onNavigate={key => navigate("/" + key)}
          fullName={userData?.fullName || ""}
          role={userRole}
          active="notifications"
        />

        <main className="dash-main">
          <Topbar onMenuToggle={() => setMobileOpen(o => !o)} />

          <div className="dash-content">
            <div className="notif-page">

              {/* Header */}
              <div className="notif-page-header">
                <div>
                  <h1 className="notif-page-title">Notifications</h1>
                  <p className="notif-page-sub">Stay updated on all your account activity.</p>
                </div>
                {unreadCount > 0 && (
                  <button className="notif-mark-all-btn" onClick={markAllRead} disabled={markingAll}>
                    {markingAll ? "Marking…" : `Mark all as read (${unreadCount})`}
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="notif-controls">
                <div className="notif-filter-tabs">
                  {FILTERS.map(f => (
                    <button
                      key={f.value}
                      className={`notif-tab${filter === f.value ? " active" : ""}`}
                      onClick={() => setFilter(f.value)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <button
                  className={`notif-unread-toggle${unreadOnly ? " active" : ""}`}
                  onClick={() => setUnreadOnly(o => !o)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    {unreadOnly
                      ? <polyline points="20 6 9 17 4 12"/>
                      : <line x1="12" y1="8" x2="12" y2="16"/>
                    }
                  </svg>
                  Unread only
                </button>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: ".86rem", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {error}
                  <button onClick={fetchNotifications} style={{ background: "#dc2626", color: "white", border: "none", padding: "5px 14px", borderRadius: 6, cursor: "pointer", fontSize: ".78rem", fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>Retry</button>
                </div>
              )}

              {/* List */}
              <div className="notif-card">
                <div className="notif-card-header">
                  <span className="notif-card-title">
                    {unreadOnly ? "Unread" : FILTERS.find(f => f.value === filter)?.label || "All"} Notifications
                  </span>
                  {!loading && <span className="notif-count-badge">{meta.total} total</span>}
                </div>

                {loading ? <SkeletonRows n={6} /> : notifications.length === 0 ? (
                  <div className="notif-empty">
                    <div className="notif-empty-icon">🔔</div>
                    <div className="notif-empty-title">No notifications</div>
                    <div className="notif-empty-sub">
                      {unreadOnly ? "You're all caught up — no unread notifications." : "No notifications match the selected filter."}
                    </div>
                  </div>
                ) : notifications.map(notif => {
                  const cfg = getConfig(notif.type);
                  const hasAmount = notif.amount != null;
                  return (
                    <div
                      key={notif._id}
                      className={`notif-row${notif.isRead ? "" : " unread"}`}
                      onClick={() => markAsRead(notif)}
                    >
                      <div className="notif-row-icon" style={{ background: cfg.bg }}>
                        <span style={{ fontSize: "1rem" }}>{cfg.emoji}</span>
                      </div>
                      <div className="notif-row-body">
                        <div className="notif-row-title">
                          {!notif.isRead && <span className="notif-unread-dot" />}
                          {notif.title || cfg.label || notif.type}
                        </div>
                        <div className="notif-row-message">{notif.message || notif.description || "—"}</div>
                        <div className="notif-row-time">{timeAgo(notif.createdAt)}</div>
                      </div>
                      <div className="notif-row-right">
                        {hasAmount && (
                          <div className={`notif-row-amount${cfg.amountClass ? ` ${cfg.amountClass}` : ""}`}>
                            {cfg.amountClass === "credit" ? "+" : cfg.amountClass === "debit" ? "-" : ""}
                            {fmt(notif.amount)}
                          </div>
                        )}
                        {!notif.isRead && (
                          <button className="notif-mark-btn" onClick={e => { e.stopPropagation(); markAsRead(notif); }}>
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {!loading && meta.total > 0 && (
                  <div className="notif-pagination">
                    <div className="notif-page-info">
                      Showing <strong>{Math.min((page - 1) * limit + 1, meta.total)}–{Math.min(page * limit, meta.total)}</strong> of <strong>{meta.total}</strong>
                      <span style={{ margin: "0 10px", color: "var(--border)" }}>|</span>
                      <select
                        value={limit}
                        onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                        style={{ border: "1.5px solid var(--border)", borderRadius: 7, padding: "3px 8px", fontSize: ".78rem", fontWeight: 600, color: "var(--navy)", background: "var(--bg)", outline: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {[10, 20, 50].map(n => <option key={n} value={n}>{n} per page</option>)}
                      </select>
                    </div>
                    {meta.totalPages > 1 && <div className="notif-page-btns">
                      <button className="notif-page-btn" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                      </button>
                      {pageNumbers(page, meta.totalPages).map((p, i) =>
                        p === "..." ? (
                          <span key={`d${i}`} style={{ fontSize: ".82rem", color: "var(--muted)", padding: "0 4px" }}>…</span>
                        ) : (
                          <button key={p} className={`notif-page-btn${page === p ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                        )
                      )}
                      <button className="notif-page-btn" onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPages}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </div>}
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}