import { useState, useRef, useEffect } from "react";
import Cookies from "universal-cookie";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { getTokenData } from "../../auth/auth";

import logoImg from "../../assets/logo.png";

function getFirstName(sourceName = "") {
  if (!sourceName || typeof sourceName !== "string") return "";
  return sourceName.trim().split(" ")[0] || "";
}

const SaturnLogo = () => (
  <img src={logoImg} alt="Bank of Saturn Logo" width="32" height="32" style={{ objectFit: "contain", borderRadius: "20%" }} />
);

const navItems = [
  {
    key: "dashboard", label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    key: "transfer", label: "Transfer Funds",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
  {
    key: "withdrawal", label: "Withdrawal",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    key: "deposit", label: "Deposit",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M2 12h20" />
      </svg>
    ),
  },
  {
    key: "bills", label: "Bills Payment",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    key: "transactions", label: "Transactions",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    key: "profile", label: "My Profile",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    key: "savings", label: "Savings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 9a7 7 0 1 0-13.6 2.3L4 20h16l-1.4-8.7A7 7 0 0 0 19 9z" />
        <path d="M12 2v2" /><path d="M9 20v2" /><path d="M15 20v2" />
      </svg>
    ),
  },
  {
    key: "notifications", label: "Notifications",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

/* ── Logout Confirmation Modal ── */
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onCancel()}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.55)",
        backdropFilter: "blur(4px)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        animation: "sbFadeIn .2s ease",
      }}
    >
      <style>{`
        @keyframes sbFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes sbSlideUp { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .sb-modal { background:white; border-radius:20px; width:100%; max-width:360px; overflow:hidden; box-shadow:0 24px 72px rgba(0,0,0,.22); animation:sbSlideUp .25s cubic-bezier(.34,1.56,.64,1); }
        .sb-modal-hdr { background:#1b3a6b; padding:28px 28px 22px; text-align:center; color:white; }
        .sb-modal-title { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:700; margin-bottom:4px; }
        .sb-modal-sub { font-size:.82rem; opacity:.6; }
        .sb-modal-body { padding:18px 28px 8px; text-align:center; }
        .sb-modal-body p { font-size:.88rem; color:#64748b; line-height:1.6; }
        .sb-modal-footer { padding:16px 28px 24px; display:flex; gap:10px; }
        .sb-btn-cancel { flex:1; padding:12px; border:1.5px solid #e2e8f0; border-radius:10px; background:white; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:600; color:#1e293b; transition:border-color .18s; }
        .sb-btn-cancel:hover { border-color:#1b3a6b; }
        .sb-btn-confirm { flex:1.6; padding:12px; background:#ef4444; color:white; border:none; border-radius:10px; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:.88rem; font-weight:700; display:flex; align-items:center; justify-content:center; gap:7px; transition:opacity .18s; }
        .sb-btn-confirm:hover { opacity:.88; }
      `}</style>
      <div className="sb-modal">
        <div className="sb-modal-hdr">
          <div style={{ marginBottom: 10 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <div className="sb-modal-title">Sign Out?</div>
          <div className="sb-modal-sub">You'll be returned to the login screen.</div>
        </div>
        <div className="sb-modal-body">
          <p>Are you sure you want to sign out of your Bank of Saturn account?</p>
        </div>
        <div className="sb-modal-footer">
          <button className="sb-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="sb-btn-confirm" onClick={onConfirm}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen = false, onClose, onLogout, onNavigate, active = "dashboard", fullName: propFullName = "" }) {
  const [dropOpen,    setDropOpen]    = useState(false);
  const [showLogout,  setShowLogout]  = useState(false);
  const dropRef = useRef(null);

  const { userData } = useUser();
  const tokenData = getTokenData();
  const fullName =
    propFullName ||
    userData?.fullName ||
    userData?.name ||
    userData?.firstName ||
    tokenData?.fullName ||
    tokenData?.name ||
    "";
  const role = userData?.roles || tokenData?.roles || "";

  const firstName = getFirstName(fullName) || "User";
  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* Logout confirmation modal */}
      {showLogout && (
        <LogoutModal
          onConfirm={() => {
            new Cookies().remove("token", { path: "/" });
            window.location.replace("/login");
          }}
          onCancel={() => setShowLogout(false)}
        />
      )}

      <aside className={`bos-sidebar${mobileOpen ? " mobile-open" : ""}`}>
        {/* Mobile close */}
        {mobileOpen && (
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 14, right: 14,
              background: "rgba(255,255,255,0.1)", border: "none",
              color: "white", borderRadius: "50%",
              width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", zIndex: 10,
            }}
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {/* Logo */}
        <div className="sidebar-logo">
          <SaturnLogo />
          <Link className="text-decoration-none" to="/">
            <span className="sidebar-logo-text">Bank of Saturn</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`sidebar-item${active === item.key ? " active" : ""}`}
              onClick={() => { onNavigate?.(item.key); onClose?.(); }}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              <span className="sidebar-item-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User pill + dropdown */}
        <div className="sidebar-user-footer" ref={dropRef}>
          {dropOpen && (
            <div className="sidebar-dropdown">
              <div className="sidebar-drop-header">
                <div className="sidebar-drop-avatar">{initials}</div>
                <div>
                  <div className="sidebar-drop-name">{fullName || "User"}</div>
                  <div className="sidebar-drop-role">{Array.isArray(role) ? (role.includes("admin") ? "Administrator" : "Account Holder") : (role === "admin" ? "Administrator" : "Account Holder")}</div>
                </div>
              </div>
              <div className="sidebar-drop-divider" />
              <button
                className="sidebar-drop-item"
                onClick={() => { setDropOpen(false); onNavigate?.("profile"); onClose?.(); }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                My Profile
              </button>
              <div className="sidebar-drop-divider" />
              <button
                className="sidebar-drop-item sidebar-drop-logout"
                onClick={() => { setDropOpen(false); setShowLogout(true); }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          )}

          <button
            className="sidebar-user-pill"
            onClick={() => setDropOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={dropOpen}
          >
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{firstName}</span>
              <span className="sidebar-user-role">{Array.isArray(role) ? (role.includes("admin") ? "Administrator" : "Account Holder") : (role === "admin" ? "Administrator" : "Account Holder")}</span>
            </div>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              style={{
                marginLeft: "auto", flexShrink: 0,
                transition: "transform 0.2s",
                transform: dropOpen ? "rotate(180deg)" : "rotate(0deg)",
                opacity: 0.5,
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}