import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar";
import Topbar from "../components/Dashboard/Topbar";
import PageLoader from "../components/PageLoader";

const API = "https://bank-web-app-eight.vercel.app/api/v1";

const fmt = (n) =>
    "₦" + Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("en-NG", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

/* ─── Styles ─────────────────────────────────────────────── */
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy: #1b3a6b; --navy-dark: #122850; --blue: #2563eb;
    --green: #16a34a; --red: #ef4444; --amber: #d97706;
    --purple: #7c3aed; --cyan: #0891b2;
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

  /* ══════════════════════════
     ADMIN PAGE
  ══════════════════════════ */
  .admin-page { max-width: 1200px; }

  .admin-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px; flex-wrap: wrap; gap: 12px;
  }
  .admin-header-left { display: flex; flex-direction: column; gap: 4px; }
  .admin-title { font-family: 'Playfair Display', serif; font-size: 1.7rem; font-weight: 700; color: var(--navy); }
  .admin-sub { font-size: .83rem; color: var(--muted); }
  .admin-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: linear-gradient(135deg, #7c3aed, #9f67fa);
    color: white; padding: 5px 14px; border-radius: 20px;
    font-size: .72rem; font-weight: 700; letter-spacing: .05em;
    text-transform: uppercase; box-shadow: 0 4px 12px rgba(124,58,237,.3);
  }
  .admin-refresh-btn {
    display: flex; align-items: center; gap: 6px;
    background: var(--white); border: 1px solid var(--border);
    color: var(--navy); padding: 8px 16px; border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: .82rem; font-weight: 600;
    cursor: pointer; transition: all .18s;
  }
  .admin-refresh-btn:hover { border-color: var(--navy); background: #f8fafc; }
  .admin-refresh-btn:disabled { opacity: .5; cursor: not-allowed; }

  .admin-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .admin-stat-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 16px; padding: 22px 20px;
    position: relative; overflow: hidden;
    transition: transform .2s, box-shadow .2s;
  }
  .admin-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,.08); }
  .admin-stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: var(--accent, var(--navy)); border-radius: 16px 16px 0 0;
  }
  .admin-stat-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: var(--icon-bg, #eff6ff);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px; color: var(--accent, var(--navy));
  }
  .admin-stat-label { font-size: .72rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; }
  .admin-stat-value { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; color: var(--navy); line-height: 1.1; margin-bottom: 4px; }
  .admin-stat-sub { font-size: .72rem; color: var(--muted); }
  .admin-stat-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
  .admin-stat-pill {
    font-size: .65rem; font-weight: 700; padding: 2px 8px; border-radius: 12px;
    background: var(--pill-bg, #eff6ff); color: var(--pill-color, var(--blue));
  }

  .admin-row { display: grid; grid-template-columns: 3fr 2fr; gap: 20px; margin-bottom: 20px; }
  .admin-row.full { grid-template-columns: 1fr; }

  .admin-section { background: var(--white); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
  .admin-section-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px; border-bottom: 1px solid var(--border);
  }
  .admin-section-title { display: flex; align-items: center; gap: 10px; font-size: .92rem; font-weight: 700; color: var(--navy); }
  .admin-section-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .admin-section-badge {
    font-size: .65rem; font-weight: 700; padding: 3px 9px; border-radius: 12px;
    background: #fef2f2; color: var(--red); border: 1px solid #fecaca;
  }
  .admin-section-badge.amber { background: #fffbeb; color: var(--amber); border-color: #fde68a; }
  .admin-section-badge.green { background: #f0fdf4; color: var(--green); border-color: #bbf7d0; }

  .admin-table-wrap { overflow-x: auto; }
  .admin-table { width: 100%; border-collapse: collapse; min-width: 520px; }
  .admin-table th {
    font-size: .68rem; font-weight: 700; color: var(--muted);
    text-transform: uppercase; letter-spacing: .06em;
    padding: 10px 20px; border-bottom: 1px solid var(--border);
    text-align: left; background: #f8fafc; white-space: nowrap;
  }
  .admin-table td { padding: 13px 20px; border-bottom: 1px solid var(--border); font-size: .85rem; vertical-align: middle; }
  .admin-table tr:last-child td { border-bottom: none; }
  .admin-table tr:hover td { background: #f8fafc; }
  .admin-amount { font-family: 'Playfair Display', serif; font-weight: 700; color: var(--red); }
  .admin-acct { font-family: monospace; font-size: .8rem; color: var(--muted); }
  .admin-names { font-weight: 600; color: var(--text); font-size: .85rem; }
  .admin-names span { color: var(--muted); font-weight: 400; font-size: .78rem; display: block; }

  .admin-sus-list { padding: 8px 0; }
  .admin-sus-item {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 22px; border-bottom: 1px solid var(--border); transition: background .15s;
  }
  .admin-sus-item:last-child { border-bottom: none; }
  .admin-sus-item:hover { background: #fef2f2; }
  .admin-sus-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #fef2f2; border: 1.5px solid #fecaca;
    color: var(--red); font-size: .75rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .admin-sus-info { flex: 1; min-width: 0; }
  .admin-sus-name { font-weight: 700; font-size: .85rem; color: var(--text); }
  .admin-sus-email { font-size: .73rem; color: var(--muted); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .admin-sus-meta { text-align: right; flex-shrink: 0; }
  .admin-sus-acct { font-family: monospace; font-size: .75rem; color: var(--muted); }
  .admin-sus-attempts {
    display: inline-flex; align-items: center; gap: 4px;
    background: #fef2f2; color: var(--red);
    font-size: .68rem; font-weight: 700; padding: 3px 8px; border-radius: 12px; margin-top: 4px;
  }
  .admin-sus-locked {
    display: inline-flex; align-items: center; gap: 4px;
    background: #fffbeb; color: var(--amber);
    font-size: .68rem; font-weight: 700; padding: 3px 8px; border-radius: 12px; margin-top: 4px; margin-left: 4px;
  }

  .admin-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 40px; color: var(--muted); font-size: .85rem; }

  .admin-health-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 22px; border-bottom: 1px solid var(--border); gap: 16px;
  }
  .admin-health-row:last-child { border-bottom: none; }
  .admin-health-label { font-size: .84rem; font-weight: 600; color: var(--text); }
  .admin-health-val { font-size: .84rem; font-weight: 700; }
  .admin-health-bar-track { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; max-width: 200px; }
  .admin-health-bar-fill { height: 100%; border-radius: 3px; background: var(--fill-color, var(--green)); transition: width 1s ease; }

  .admin-timestamp { font-size: .72rem; color: var(--muted); text-align: right; padding-top: 12px; }

  @media (max-width: 768px) {
    .bos-sidebar { transform: translateX(-100%); width: 280px; }
    .dash-main { margin-left: 0; }
    .sidebar-overlay-bg { display: block; }
    .topbar-hamburger { display: flex; }
    .bos-topbar { padding: 0 16px; height: 60px; }
    .topbar-name { display: none; }
    .dash-content { padding: 14px 14px 40px; }
    .admin-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .admin-row { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .admin-stats-grid { grid-template-columns: 1fr; }
    .dash-content { padding: 10px 10px 36px; }
  }
`;

/* ── Stat card ─────────────────────────────────────────────── */
function StatCard({ label, value, sub, pills, icon, accent, iconBg }) {
    return (
        <div className="admin-stat-card" style={{ "--accent": accent, "--icon-bg": iconBg }}>
            <div className="admin-stat-icon">{icon}</div>
            <div className="admin-stat-label">{label}</div>
            <div className="admin-stat-value">{value}</div>
            {sub && <div className="admin-stat-sub">{sub}</div>}
            {pills && (
                <div className="admin-stat-pills">
                    {pills.map((p, i) => (
                        <span key={i} className="admin-stat-pill" style={{ "--pill-bg": p.bg, "--pill-color": p.color }}>{p.text}</span>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────── */
export default function Admin({ onLogout }) {
    const navigate = useNavigate();
    const cookies = new Cookies();
    const token = cookies.get("token");

    const [data,       setData]       = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // ✅ Fixed: uses window.location.replace — no React flicker
    const handleLogout = () => {
        new Cookies().remove("token", { path: "/" });
        window.location.replace("/login");
    };

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        setError("");
        try {
            const adminRes = await axios.get(`${API}/admin/overview`, { headers: { Authorization: `Bearer ${token}` } });
            setData(adminRes.data.data);
        } catch (e) {
            if (e?.response?.status === 401) {
                // ✅ direct redirect, no React state flicker
                new Cookies().remove("token", { path: "/" });
                window.location.replace("/login");
                return;
            }
            if (e?.response?.status === 403) {
                setError("You do not have admin access to this page.");
            } else {
                setError(e?.response?.data?.message || "Failed to load admin data.");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    /* ── Loading state ── */
    if (loading) return (
        <>
            <style>{style}</style>
            <div className="sidebar-overlay-bg" style={{ display: mobileOpen ? "block" : "none" }} onClick={() => setMobileOpen(false)} />
            <div className="dash-layout">
                <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout}
                    onNavigate={key => navigate("/" + key)} active="admin" />
                <main className="dash-main">
                    <Topbar onMenuToggle={() => setMobileOpen(o => !o)} />
                    <div className="dash-content">
                        <PageLoader message="Loading admin data…" />
                    </div>
                </main>
            </div>
        </>
    );

    /* ── Access denied ── */
    if (error) return (
        <>
            <style>{style}</style>
            <div className="sidebar-overlay-bg" style={{ display: mobileOpen ? "block" : "none" }} onClick={() => setMobileOpen(false)} />
            <div className="dash-layout">
                <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout}
                    onNavigate={key => navigate("/" + key)} active="admin" />
                <main className="dash-main">
                    <Topbar onMenuToggle={() => setMobileOpen(o => !o)} />
                    <div className="dash-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
                        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "#ef4444" }}>🔒</div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, color: "#1b3a6b" }}>Access Denied</div>
                        <div style={{ fontSize: ".88rem", color: "#64748b", textAlign: "center", maxWidth: 320 }}>{error}</div>
                        <button onClick={() => navigate("/dashboard")} style={{ marginTop: 8, padding: "11px 28px", background: "#1b3a6b", color: "white", border: "none", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, cursor: "pointer", fontSize: ".9rem" }}>
                            Back to Dashboard
                        </button>
                    </div>
                </main>
            </div>
        </>
    );

    const { users, balances, recentHighValueTransfers, suspiciousAccounts, failedTransactionsLast24h, timestamp } = data;
    const savingsPct = balances.totalInSystem > 0 ? Math.round((balances.totalSavings / balances.totalInSystem) * 100) : 0;

    return (
        <>
            <style>{style}</style>
            <div className="sidebar-overlay-bg" style={{ display: mobileOpen ? "block" : "none" }} onClick={() => setMobileOpen(false)} />
            <div className="dash-layout">
                <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout}
                    onNavigate={key => navigate("/" + key)} active="admin" />
                <main className="dash-main">
                    <Topbar onMenuToggle={() => setMobileOpen(o => !o)} />

                    <div className="dash-content">
                        <div className="admin-page">

                            {/* ── Header ── */}
                            <div className="admin-header">
                                <div className="admin-header-left">
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <h1 className="admin-title">Admin Overview</h1>
                                        <span className="admin-badge">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                                            Admin
                                        </span>
                                    </div>
                                    <p className="admin-sub">System-wide overview — live data snapshot</p>
                                </div>
                                <button className="admin-refresh-btn" onClick={() => fetchData(true)} disabled={refreshing}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                        style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }}>
                                        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                    </svg>
                                    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                                    Refresh
                                </button>
                            </div>

                            {/* ── KPI Stats ── */}
                            <div className="admin-stats-grid">
                                <StatCard
                                    label="Total Users"
                                    value={users.total.toLocaleString()}
                                    pills={[
                                        { text: `+${users.newToday} today`, bg: "#f0fdf4", color: "#16a34a" },
                                        { text: `+${users.newThisWeek} this week`, bg: "#eff6ff", color: "#2563eb" },
                                    ]}
                                    accent="#1b3a6b" iconBg="#eff6ff"
                                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1b3a6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                                />
                                <StatCard
                                    label="Total in System"
                                    value={fmt(balances.totalInSystem)}
                                    sub={`Main: ${fmt(balances.totalMain)}`}
                                    pills={[{ text: `Savings: ${savingsPct}%`, bg: "#f0fdf4", color: "#16a34a" }]}
                                    accent="#2563eb" iconBg="#eff6ff"
                                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
                                />
                                <StatCard
                                    label="Failed Txns (24h)"
                                    value={failedTransactionsLast24h}
                                    sub="Failed transactions"
                                    pills={failedTransactionsLast24h > 0 ? [{ text: "Needs review", bg: "#fef2f2", color: "#ef4444" }] : [{ text: "All clear", bg: "#f0fdf4", color: "#16a34a" }]}
                                    accent={failedTransactionsLast24h > 0 ? "#ef4444" : "#16a34a"}
                                    iconBg={failedTransactionsLast24h > 0 ? "#fef2f2" : "#f0fdf4"}
                                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={failedTransactionsLast24h > 0 ? "#ef4444" : "#16a34a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>}
                                />
                                <StatCard
                                    label="Suspicious Accounts"
                                    value={suspiciousAccounts.length}
                                    sub="Failed PIN ≥ 3 attempts"
                                    pills={suspiciousAccounts.length > 0 ? [{ text: "Action needed", bg: "#fffbeb", color: "#d97706" }] : [{ text: "None flagged", bg: "#f0fdf4", color: "#16a34a" }]}
                                    accent={suspiciousAccounts.length > 0 ? "#d97706" : "#16a34a"}
                                    iconBg={suspiciousAccounts.length > 0 ? "#fffbeb" : "#f0fdf4"}
                                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={suspiciousAccounts.length > 0 ? "#d97706" : "#16a34a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
                                />
                            </div>

                            {/* ── High-Value Transfers + Suspicious Accounts ── */}
                            <div className="admin-row">
                                <div className="admin-section">
                                    <div className="admin-section-header">
                                        <div className="admin-section-title">
                                            <div className="admin-section-icon" style={{ background: "#fef2f2" }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                                                    <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
                                                </svg>
                                            </div>
                                            High-Value Transfers
                                        </div>
                                        <span className="admin-section-badge">Last 24h · &gt;₦50k</span>
                                    </div>
                                    <div className="admin-table-wrap">
                                        {recentHighValueTransfers.length === 0 ? (
                                            <div className="admin-empty">
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="17 1 21 5 17 9" /></svg>
                                                No high-value transfers in the last 24 hours
                                            </div>
                                        ) : (
                                            <table className="admin-table">
                                                <thead>
                                                    <tr>
                                                        <th>From</th><th>To</th><th>Amount</th><th>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recentHighValueTransfers.map((tx, i) => (
                                                        <tr key={i}>
                                                            <td>
                                                                <div className="admin-names">
                                                                    {tx.senderFullName || "—"}
                                                                    <span className="admin-acct">{tx.senderAccount}</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="admin-names">
                                                                    {tx.receiverFullName || "—"}
                                                                    <span className="admin-acct">{tx.receiverAccount}</span>
                                                                </div>
                                                            </td>
                                                            <td><span className="admin-amount">{tx.amountFormatted || fmt(tx.amount)}</span></td>
                                                            <td style={{ fontSize: ".78rem", color: "#64748b", whiteSpace: "nowrap" }}>{fmtDate(tx.createdAt)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>

                                <div className="admin-section">
                                    <div className="admin-section-header">
                                        <div className="admin-section-title">
                                            <div className="admin-section-icon" style={{ background: "#fffbeb" }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                                                </svg>
                                            </div>
                                            Suspicious Accounts
                                        </div>
                                        <span className="admin-section-badge amber">{suspiciousAccounts.length} flagged</span>
                                    </div>
                                    <div className="admin-sus-list">
                                        {suspiciousAccounts.length === 0 ? (
                                            <div className="admin-empty">
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                                No suspicious accounts detected
                                            </div>
                                        ) : (
                                            suspiciousAccounts.map((acct, i) => {
                                                const ini = (acct.fullName || "??").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                                                const isLocked = acct.pinLockedUntil && new Date(acct.pinLockedUntil) > new Date();
                                                return (
                                                    <div key={i} className="admin-sus-item">
                                                        <div className="admin-sus-avatar">{ini}</div>
                                                        <div className="admin-sus-info">
                                                            <div className="admin-sus-name">{acct.fullName}</div>
                                                            <div className="admin-sus-email">{acct.email}</div>
                                                        </div>
                                                        <div className="admin-sus-meta">
                                                            <div className="admin-sus-acct">{acct.accountNumber}</div>
                                                            <div>
                                                                <span className="admin-sus-attempts">⚠ {acct.failedPinAttempts} fails</span>
                                                                {isLocked && <span className="admin-sus-locked">🔒 Locked</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── System Health ── */}
                            <div className="admin-row full">
                                <div className="admin-section">
                                    <div className="admin-section-header">
                                        <div className="admin-section-title">
                                            <div className="admin-section-icon" style={{ background: "#f0fdf4" }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                                </svg>
                                            </div>
                                            System Balance Overview
                                        </div>
                                        <span className="admin-section-badge green">Live</span>
                                    </div>
                                    <div>
                                        <div className="admin-health-row">
                                            <div className="admin-health-label">Total Main Balance</div>
                                            <div className="admin-health-bar-track">
                                                <div className="admin-health-bar-fill" style={{ width: `${100 - savingsPct}%`, "--fill-color": "#2563eb" }} />
                                            </div>
                                            <div className="admin-health-val" style={{ color: "#2563eb" }}>{fmt(balances.totalMain)}</div>
                                        </div>
                                        <div className="admin-health-row">
                                            <div className="admin-health-label">Total Savings Balance</div>
                                            <div className="admin-health-bar-track">
                                                <div className="admin-health-bar-fill" style={{ width: `${savingsPct}%`, "--fill-color": "#16a34a" }} />
                                            </div>
                                            <div className="admin-health-val" style={{ color: "#16a34a" }}>{fmt(balances.totalSavings)}</div>
                                        </div>
                                        <div className="admin-health-row">
                                            <div className="admin-health-label">Total Interest Paid Out</div>
                                            <div className="admin-health-bar-track">
                                                <div className="admin-health-bar-fill" style={{ width: "100%", "--fill-color": "#d97706" }} />
                                            </div>
                                            <div className="admin-health-val" style={{ color: "#d97706" }}>{fmt(balances.totalInterestPaid)}</div>
                                        </div>
                                        <div className="admin-health-row">
                                            <div className="admin-health-label">Total Assets Under Management</div>
                                            <div style={{ flex: 1 }} />
                                            <div className="admin-health-val" style={{ color: "#1b3a6b", fontSize: "1rem", fontFamily: "'Playfair Display', serif" }}>{fmt(balances.totalInSystem)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-timestamp">Last refreshed: {fmtDate(timestamp)}</div>

                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}