import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "../Topbar";
import Statscard from "./Statscard";
import QuickActions from "./Quickactions";
import Billscard from "./Billscard";
import TransactionsTable from "./Transactionstable";
import Cookies from "universal-cookie";
import { getTokenData } from "../../auth/auth";

const API_BASE = "http://localhost:9000/api/v1";

const dashboardStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --navy:       #1b3a6b;
  --navy-dark:  #122850;
  --blue:       #2563eb;
  --green:      #16a34a;
  --amber:      #d97706;
  --text:       #1e293b;
  --muted:      #64748b;
  --border:     #e2e8f0;
  --bg:         #f1f5f9;
  --white:      #ffffff;
  --sidebar-w:  220px;
}

body {
  font-family: 'DM Sans', sans-serif;
  color: var(--text);
  background: var(--bg);
}

/* ═══════════════════════════
   LAYOUT
═══════════════════════════ */
.bos-layout {
  display: flex;
  min-height: 100vh;
}

.bos-main {
  flex: 1;
  margin-left: var(--sidebar-w);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s;
}

.bos-content {
  flex: 1;
  padding: 28px 28px 40px;
  max-width: 1280px;
  width: 100%;
}

/* ═══════════════════════════
   SIDEBAR
═══════════════════════════ */
.bos-sidebar {
  width: var(--sidebar-w);
  background: var(--navy);
  position: fixed;
  top: 0; left: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  z-index: 300;
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 20px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.sidebar-logo-text {
  font-family: 'Playfair Display', serif;
  font-size: 0.92rem;
  color: white;
  line-height: 1.2;
}

.sidebar-nav {
  flex: 1;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.6);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
  text-align: left;
  width: 100%;
}
.sidebar-item:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); }
.sidebar-item.active { background: rgba(255,255,255,0.14); color: white; font-weight: 600; }
.sidebar-item-icon { display: flex; align-items: center; flex-shrink: 0; }

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.sidebar-logout {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.5);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: all 0.18s;
}
.sidebar-logout:hover { background: rgba(239,68,68,0.15); color: #f87171; }

/* ═══════════════════════════
   TOPBAR
═══════════════════════════ */
.bos-topbar {
  height: 68px;
  background: var(--white);
  border-bottom: 1px solid var(--border);
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 8px rgba(0,0,0,0.05);
}

.topbar-left { display: flex; align-items: center; gap: 14px; }
.topbar-hamburger {
  display: none;
  background: none;
  border: none;
  color: var(--navy);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  flex-shrink: 0;
}
.topbar-hamburger:hover { background: var(--bg); }

.topbar-welcome {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  color: var(--navy);
  font-weight: 700;
  line-height: 1.2;
}
.topbar-date { font-size: 0.78rem; color: var(--muted); margin-top: 1px; }

.topbar-right { display: flex; align-items: center; gap: 14px; }

.topbar-bell {
  position: relative;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: var(--muted);
  transition: all 0.18s;
}
.topbar-bell:hover { border-color: var(--navy); color: var(--navy); }
.bell-badge {
  position: absolute;
  top: -3px; right: -3px;
  background: #ef4444;
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  width: 16px; height: 16px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid white;
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px 10px 5px 5px;
  border-radius: 30px;
  border: 1px solid var(--border);
  background: var(--bg);
  transition: all 0.18s;
  color: var(--muted);
}
.topbar-user:hover { border-color: var(--navy); }
.topbar-avatar {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: var(--navy);
  color: white;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.topbar-name { font-size: 0.85rem; font-weight: 600; color: var(--text); }

/* ═══════════════════════════
   STATS CARDS
═══════════════════════════ */
.stats-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 22px;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
}
.stat-card:hover { box-shadow: 0 8px 24px rgba(27,58,107,0.1); transform: translateY(-2px); }

.stat-card-top { display: flex; justify-content: space-between; align-items: flex-start; }
.stat-label { font-size: 0.75rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
.stat-value { font-family: 'Playfair Display', serif; font-size: clamp(1.35rem, 3vw, 1.8rem); font-weight: 700; color: var(--navy); line-height: 1.1; }
.stat-sub { font-size: 0.73rem; color: var(--muted); margin-top: 4px; }

.stat-icon-wrap {
  width: 46px; height: 46px;
  border-radius: 12px;
  background: #eff6ff;
  color: var(--navy);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.stat-bar { height: 4px; background: var(--border); border-radius: 4px; margin-top: 16px; overflow: hidden; }
.stat-bar-fill { height: 100%; width: 72%; background: var(--bar); border-radius: 4px; }

/* ═══════════════════════════
   CARD SHARED
═══════════════════════════ */
.card-heading {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--navy);
  margin: 0;
}

/* ═══════════════════════════
   QUICK ACTIONS
═══════════════════════════ */
.quick-actions-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
}
.quick-actions-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 14px;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 10px;
  border: none;
  border-radius: 10px;
  background: var(--color);
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
}
.quick-action-btn:hover { background: var(--hover); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
.quick-action-btn:active { transform: scale(0.97); }
.qa-icon { display: flex; }
.qa-arrow { opacity: 0.7; }
.qa-label { white-space: nowrap; }

/* ═══════════════════════════
   MIDDLE ROW (savings + bills)
═══════════════════════════ */
.middle-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

/* ═══════════════════════════
   SAVINGS CARD
═══════════════════════════ */
.savings-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 22px;
}
.savings-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.savings-badge {
  font-size: 0.65rem;
  font-weight: 700;
  background: #f0fdf4;
  color: var(--green);
  border: 1px solid #bbf7d0;
  padding: 3px 9px;
  border-radius: 20px;
  letter-spacing: 0.04em;
}
.savings-actions { display: flex; gap: 10px; margin-bottom: 18px; }
.savings-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  justify-content: center;
  padding: 9px 12px;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
}
.savings-btn.primary { background: var(--blue); color: white; border: none; }
.savings-btn.primary:hover { background: #1d4ed8; }
.savings-btn.secondary { background: transparent; color: var(--green); border: 1.5px solid var(--green); }
.savings-btn.secondary:hover { background: #f0fdf4; }

.savings-stats { display: flex; flex-direction: column; gap: 10px; }
.savings-stat-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border); }
.savings-stat-row:last-child { border-bottom: none; }
.savings-stat-label { font-size: 0.8rem; color: var(--muted); }
.savings-stat-val { font-weight: 700; font-family: 'Playfair Display', serif; font-size: 0.95rem; }
.savings-stat-val.navy { color: var(--navy); }
.savings-stat-val.green { color: var(--green); }

/* ═══════════════════════════
   BILLS CARD (dark)
═══════════════════════════ */
.bills-card-widget {
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 22px;
  position: relative;
  overflow: hidden;
}
.bills-card-widget::before {
  content: '';
  position: absolute;
  top: -50px; right: -50px;
  width: 180px; height: 180px;
  background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
  pointer-events: none;
}
.bills-widget-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.bills-badge-count {
  font-size: 0.62rem;
  font-weight: 600;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: #94a3b8;
  padding: 3px 8px;
  border-radius: 20px;
  letter-spacing: 0.05em;
}

.bills-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.bill-tile {
  position: relative;
  background: var(--bg);
  border: 1.5px solid var(--bdr);
  border-radius: 12px;
  padding: 12px 4px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
}
.bill-tile::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--grad);
  opacity: 0;
  transition: opacity 0.22s;
  border-radius: 10px;
}
.bill-tile:hover { transform: translateY(-3px); box-shadow: 0 8px 20px var(--glow); border-color: transparent; }
.bill-tile:hover::after, .bill-tile.active::after { opacity: 1; }
.bill-tile.active { transform: translateY(-3px) scale(1.04); box-shadow: 0 10px 24px var(--glow); border-color: transparent; }
.bill-tile-icon { position: relative; z-index: 1; display: flex; }
.bill-tile-label { position: relative; z-index: 1; font-size: 0.59rem; font-weight: 600; color: #cbd5e1; text-align: center; line-height: 1.2; transition: color 0.2s; }
.bill-tile:hover .bill-tile-label, .bill-tile.active .bill-tile-label { color: rgba(255,255,255,0.95); }

.bills-pay-btn {
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 4px 16px rgba(99,102,241,0.4);
  transition: all 0.22s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}
.bills-pay-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(99,102,241,0.55); }
.bills-pay-btn.success { background: linear-gradient(135deg, #10b981, #34d399); box-shadow: 0 4px 16px rgba(16,185,129,0.4); pointer-events: none; }

/* ═══════════════════════════
   TRANSACTIONS
═══════════════════════════ */
.txn-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 22px;
  margin-bottom: 0;
}
.txn-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.txn-view-all { background: none; border: none; color: var(--blue); font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600; cursor: pointer; padding: 0; transition: color 0.2s; }
.txn-view-all:hover { color: #1d4ed8; }

.txn-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 40px 0; color: var(--muted); font-size: 0.88rem; }

.txn-table-wrap { overflow-x: auto; }
.txn-table { width: 100%; border-collapse: collapse; }
.txn-table th {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0 14px 12px 0;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  text-align: left;
}
.txn-table td {
  padding: 12px 14px 12px 0;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
.txn-row:last-child td { border-bottom: none; }

.txn-date { font-size: 0.8rem; color: var(--muted); white-space: nowrap; }
.txn-type-badge { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; white-space: nowrap; }
.txn-desc { font-size: 0.84rem; color: var(--text); font-weight: 500; }
.txn-status { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; white-space: nowrap; }
.txn-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.txn-amount { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 0.9rem; white-space: nowrap; text-align: right; }
.txn-amount.credit { color: var(--green); }
.txn-amount.debit  { color: #ef4444; }

/* Mobile txn list */
.txn-mobile-list { display: none; flex-direction: column; gap: 1px; }
.txn-mobile-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); }
.txn-mobile-row:last-child { border-bottom: none; }
.txn-mobile-left { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; margin-right: 12px; }
.txn-mobile-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0; }
.txn-mobile-desc { font-size: 0.84rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.txn-mobile-meta { display: flex; align-items: center; gap: 6px; margin-top: 4px; flex-wrap: wrap; }
.txn-mobile-date { font-size: 0.68rem; color: var(--muted); }

/* ═══════════════════════════
   LOADING SKELETON
═══════════════════════════ */
.skeleton {
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ═══════════════════════════
   RESPONSIVE
═══════════════════════════ */
@media (max-width: 1024px) {
  :root { --sidebar-w: 200px; }
  .bos-content { padding: 20px; }
}

@media (max-width: 768px) {
  .bos-sidebar {
    transform: translateX(-100%);
  }
  .bos-sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0,0,0,0.3);
  }
  .bos-main { margin-left: 0; }
  .bos-content { padding: 16px; }

  .topbar-hamburger { display: flex; }
  .topbar-welcome { font-size: 1rem; }
  .topbar-name { display: none; }
  .bos-topbar { padding: 0 16px; }

  .stats-row { grid-template-columns: 1fr 1fr; gap: 12px; }
  .stat-value { font-size: 1.2rem; }

  .quick-actions-row { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .qa-label { font-size: 0.78rem; }

  .middle-row { grid-template-columns: 1fr; }

  .txn-table-wrap { display: none; }
  .txn-mobile-list { display: flex; }

  .bills-grid { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 480px) {
  .stats-row { grid-template-columns: 1fr; }
  .quick-actions-row { gap: 8px; }
  .quick-action-btn { padding: 10px 6px; font-size: 0.78rem; }
  .qa-arrow { display: none; }
  .savings-actions { flex-direction: column; }
  .bos-topbar { height: 60px; }
}

/* Sidebar overlay on mobile */
.sidebar-overlay-bg {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 250;
}
.sidebar-overlay-bg.visible { display: block; }
`;

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

 


  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = cookies.get("token")

        const res = await fetch(`${API_BASE}/dashboard`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include", // sends cookies too, in case you use httpOnly JWT
        });

        if (!res.ok) {
          if (res.status === 401) {
            // Token expired or not logged in — redirect to login
            window.location.href = "/login";
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
        setError("Failed to load dashboard. Please refresh or log in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <>
      <style>{dashboardStyles}</style>

      <div className="bos-layout">
        {/* Sidebar overlay */}
        <div
          className={`sidebar-overlay-bg${mobileMenuOpen ? " visible" : ""}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        <Sidebar
          active={activePage}
          onNavigate={setActivePage}
          mobileOpen={mobileMenuOpen}
          // role={userRole}
          onClose={() => setMobileMenuOpen(false)}
        />

        <div className="bos-main">
          <Topbar
            fullName={data?.fullName || ""}
            onMenuToggle={() => setMobileMenuOpen((o) => !o)}
          />

          <div className="bos-content">
            {loading ? (
              /* Loading skeleton */
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[1, 2].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 110, borderRadius: 14 }} />
                  ))}
                </div>
                <div className="skeleton" style={{ height: 80, borderRadius: 14 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="skeleton" style={{ height: 220, borderRadius: 14 }} />
                  <div className="skeleton" style={{ height: 220, borderRadius: 14 }} />
                </div>
                <div className="skeleton" style={{ height: 280, borderRadius: 14 }} />
              </div>
            ) : error ? (
              /* Error state */
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", minHeight: 300, gap: 16, textAlign: "center",
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p style={{ color: "#ef4444", fontWeight: 600, fontSize: "0.95rem" }}>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    background: "var(--navy)", color: "white", border: "none",
                    padding: "10px 24px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600, fontSize: "0.88rem", cursor: "pointer",
                  }}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Stats */}
                <StatsCards
                  totalBalance={data.totalBalance}
                  savingsBalance={data.savingsBalance}
                />

                {/* Quick Actions */}
                <QuickActions onNavigate={setActivePage} />

                {/* Savings + Bills side by side */}
                <div className="middle-row">
                  <SavingsCard
                    savingsBalance={data.savingsBalance}
                    interestThisMonth={data.interestThisMonth}
                    onNavigate={setActivePage}
                  />
                  <BillsCard onNavigate={setActivePage} />
                </div>

                {/* Transactions */}
                <TransactionsTable transactions={data.recentTransactions} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}